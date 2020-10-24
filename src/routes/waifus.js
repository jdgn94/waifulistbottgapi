const Waifu = require('../models').waifu;
const Active = require('../models').active;
const Chat = require('../models').chat;
const User = require('../models').user;
const WaifuList = require('../models').waifu_list;
const db = require('../models');
const fs = require('fs-extra');
const cloudinary = require('cloudinary');
const express = require('express');

const router = express.Router();
const sequelize = db.sequelize;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

router.get('/', async (req, res) => {
  let { name, page } = req.query;
  if (!name) name = ''
  if (!page) page = 1;
  try {
    const waifus = await sequelize.query(`
      SELECT
        w.id,
        w.name,
        w.nickname,
        w.age,
        w.servant,
        w.image_url,
        wt.name AS waifu_type_name,
        f.name AS franchise_name,
        f.nickname AS franchise_nickname
      FROM
        waifus AS w
        INNER JOIN waifu_types AS wt ON wt.id = w.waifu_type_id 
        INNER JOIN franchises AS f ON f.id = w.franchise_id 
      WHERE
        LOWER(w.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.nickname) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.age) LIKE '%${name.toLowerCase()}%' OR
        LOWER(wt.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${name.toLowerCase()}%'
      ORDER BY
        f.name ASC, w.name ASC
      LIMIT 20 OFFSET ${(page - 1) * 20}
    `,
    { type: sequelize.QueryTypes.SELECT });
    
    const totalItems = await sequelize.query(`
      SELECT COUNT(*) AS total_items
      FROM 
        waifus AS w
        INNER JOIN waifu_types AS wt ON wt.id = w.waifu_type_id 
        INNER JOIN franchises AS f ON f.id = w.franchise_id 
      WHERE
        LOWER(w.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.nickname) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.age) LIKE '%${name.toLowerCase()}%' OR
        LOWER(wt.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${name.toLowerCase()}%'
    `, { type: sequelize.QueryTypes.SELECT });

    const totalPages = Math.ceil(totalItems[0].total_items / 20);
    return res.status(200).json({ waifus, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error)
  }
});

router.post('/create', async (req, res) => {
  const { name, nickname, age, waifu_type_id, servant, franchise_id } = req.body;

  const result = await uploadPhoto(req.file.path);
  const waifu = await Waifu.create({
    name,
    nickname,
    age,
    waifu_type_id,
    servant,
    franchise_id,
    public_id: result.public_id,
    image_url: result.secure_url
  });
  return res.status(200).send()
});

router.get('/send_waifu', async (req, res) => {
  const { chatId } = req.query;
  try {
    const chatData = await Chat.findOne({ where: { chat_id_tg: chatId } });
    const chat = chatData.dataValues;
    const active = await Active.findOne({ where: { chat_id: chat.id } });
    if (active != null) return res.status(201).send();
    await sequelize.query(`UPDATE chats SET message_quantity = 0 WHERE id = ${chat.id}`, { type: sequelize.QueryTypes.UPDATE });
    const waifusQuantities = await sequelize.query(`SELECT COUNT(*) total FROM waifus`, { type: sequelize.QueryTypes.SELECT });
    const waifuId = Math.round(Math.random() * (1 - waifusQuantities[0].total) + waifusQuantities[0].total);
    const waifu = await Waifu.findOne({ where: { id: waifuId } });
    const data = waifu.dataValues;
    await Active.create({ chat_id: chat.id, waifu_id: data.id, attempts: 10 });
    return res.status(200).send({ waifu: data });
  } catch (error) {
    console.error(error)
    return res.status(500).send()
  }
});

router.post('/protecc', async (req, res) => {
  const { message } = req.body;
  try {
    const text = message.text.split(' ');
    const data = await sequelize.query(`
      SELECT
        w.id,
        w.name,
        w.nickname,
        w.age,
        wt.id waifu_type_id,
        wt.name waifu_type_name,
        f.name franchise_name,
        f.nickname franchise_nickname,
        c.id chat_id,
        c.chat_id_tg,
        a.id active_id
      FROM
        actives a
        INNER JOIN chats c ON c.id = a.chat_id
        INNER JOIN waifus w ON w.id = a.waifu_id
        INNER JOIN waifu_types wt ON wt.id = w.waifu_type_id
        INNER JOIN franchises f ON f.id = w.franchise_id
      WHERE
        c.chat_id_tg = '${message.chat.id}'
    `, { type: sequelize.QueryTypes.SELECT });
    if (data.length == 0) return res.status(201).send();
    const waifu = data[0]
    const { name, nickname } = waifu;
    const nicknameArr = nickname.split(' ');
    const nameArr = name.split(' ');
    
    let match = false;
    if (nickname.length > 0) {
      for (i = 1; i < text.length; i++) {
        await nicknameArr.forEach(item => {
          if (item.toLowerCase() == text[i].toLowerCase()) match = true;
        });
      }
    }
    
    if (!match) {
      for (i = 1; i < text.length; i++) {
        await nameArr.forEach(item => {
          if (item.toLowerCase() == text[i].toLowerCase()) match = true;
        });
      }
    }

    let messageResponse = '';

    if (match) {
      let user = await User.findOne({ where: { user_id_tg: message.from.id } });
      const chat = await Chat.findOne({ where: { chat_id_tg: message.chat.id } });
      console.log("datos del usuario en el mensaje", message.from);
      if (!user) {
        user = await User.create({ user_id_tg: message.from.id, nickname: `${message.from.first_name}` });
      } else {
        await sequelize.query(`UPDATE users SET nickname = '${message.from.first_name}' WHERE id = ${user.dataValues.id}`, { type: sequelize.QueryTypes.UPDATE });
      }

      const waifuInList = await WaifuList.findOne({ where: { user_id: user.dataValues.id, chat_id: chat.dataValues.id, waifu_id: waifu.id } });

      if (!waifuInList) {
        await WaifuList.create({ user_id: user.dataValues.id, chat_id: chat.dataValues.id, waifu_id: waifu.id, quantity: 1 });
      } else {
        await sequelize.query(`
          UPDATE waifu_lists
          SET quantity = quantity + 1
          WHERE id = ${waifuInList.dataValues.id}
        `);
      }

      await sequelize.query(`DELETE FROM actives WHERE id = ${waifu.active_id}`, { type: sequelize.QueryTypes.DELETE });

      messageResponse = `Has agregado a ${waifu.name}${waifu.nickname.length > 0 ? ' (' + waifu.nickname + ')': ''} de la serie ${waifu.franchise_name}${waifu.franchise_nickname.length > 0 ? ' (' + waifu.franchise_nickname + ')' : ''}, ahora aparecera en tu lista`;

      switch(waifu.type){
        case 1:
          messageResponse += '.\ndejame decirte que es una loli';
          break;
        case 3:
          messageResponse += '.\nte gustan las tetas grande ¿eh?';
          break;
        case 4:
          messageResponse += '.\nDios mio mira el tamaño de esas tetas';
        case 5:
          messageResponse += '.\nNo soy nadie para opinar sobre tus gustos';
          break;
        default: break;
      }

      // switch(waifu.age){
      //   case 0:
      //     messageResponse += ' pero... ¿acaso sabes cual es su edad?';
      //     break;
      //   case waifu.age > 0 && waifu.age < 17:
      //     messageResponse += `... pero es menor de edad, el FBI te esta vigilando`;
      //     break;
      //   case 17:
      //     messageResponse += `... dejame decirte que todavía es ilegal así que estas bajo vigilancia`;
      //     break;
      //   case waifu.age > 17 && waifu.age < 50:
      //     messageResponse += ` esta es completamente legal, no te preocupes`;
      //   default:
      //     messageResponse += ' pero... ¿acaso sabes cual es su edad?';
      // }
      if (waifu.age > 0 && waifu.age < 17) {
        messageResponse += `... pero es menor de edad, el FBI te esta vigilando`;
      } else if(waifu.age == 17) {
        messageResponse += `... dejame decirte que todavía es ilegal así que estas bajo vigilancia`;
      } else if(waifu.age > 17 && waifu.age < 50) {
        messageResponse += ` esta es completamente legal, no te preocupes`;
      } else {
        messageResponse += ' pero... ¿acaso sabes cual es su edad?';
      }
    } else {
      messageResponse = 'No ese no es su nombre';
      const active = await Active.findOne({ where: { id: waifu.active_id } });
      if (active.dataValues.attempts > 1) {
        messageResponse += `, apurense solo quedan ${active.dataValues.attempts - 1}`;
        await sequelize.query(`UPDATE actives SET attempts = attempts - 1 WHERE id = ${waifu.active_id}`, { type: sequelize.QueryTypes.UPDATE });
      } else {
        messageResponse += ', lo siento, se acabaron los intentos. Sera para la proxima';
        await sequelize.query(`DELETE FROM actives WHERE id = ${waifu.active_id}`, { type: sequelize.QueryTypes.DELETE });
      }
    }
    return res.status(200).send({ message: messageResponse });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.post('/change_favorite', async (req, res) => {
  const { waifuNumber, position, chatId, userId } = req.body;
  try {
    const waifu = await sequelize.query(`
      SELECT
        w.id,
        w.name
      FROM
        waifu_lists wl
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN franchises f ON f.id = w.franchise_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN users u ON u.id = wl.user_id
      WHERE
        u.user_id_tg = '${userId}' AND
        c.chat_id_tg = '${chatId}'
      ORDER BY f.name ASC, w.name ASC
      LIMIT 1 OFFSET ${waifuNumber - 1}
    `, { type: sequelize.QueryTypes.SELECT });

    if (waifu.length == 0) return res.status(201).send();

    const list = await sequelize.query(`
      SELECT 
        wfl.id id,
        wfl.position,
        wl.id waifu_list_id
      FROM
        waifu_favorite_lists wfl
        INNER JOIN waifu_lists wl ON wl.id = wfl.waifu_list_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN users u ON u.id = wl.user_id
      WHERE
        c.chat_id_tg = ${chatId} AND
        u.user_id_tg = ${userId}
      ORDER BY wfl.position ASC
    `, { type: sequelize.QueryTypes.SELECT });

    let newList = [];
    let insert = false;

    await list.forEach(async (item, index) => {
      if (position - 1 == index) {
        insert = true;
        await newList.push({ id: null, waifu_list_id: waifu[0].id, position: index + 1 });
        await newList.push({ id: item.id, waifu_list_id:item.waifu_list_id, position: index + 2 });
      } else if (insert) {
        await newList.push({ id: item.id, waifu_list_id: item.waifu_list_id, position: index + 2 });
      } else {
        await newList.push({ id: item.id, waifu_list_id: item.waifu_list_id, position: index + 1 });
      }
    });
    if (!insert) await newList.push({ id: null, waifu_list_id: waifu[0].id, position: list.length + 1 });

    if (newList.length > 9) {
      await sequelize.query(`DELETE FROM waifu_favorite_lists WHERE id = ${newList[9].id}`, { type: sequelize.QueryTypes.DELETE });
      newList = await newList.pop();
    }

    await newList.forEach(async item => {
      if (item.id == null) {
        await sequelize.query(`
          INSERT INTO waifu_favorite_lists
          SET
            waifu_list_id = ${item.waifu_list_id},
            position = ${item.position}
        `, { type: sequelize.QueryTypes.INSERT });
      } else {
        await sequelize.query(`
          UPDATE waifu_favorite_lists
          SET position = ${item.position}
          WHERE
            id = ${item.id}
        `, { type: sequelize.QueryTypes.UPDATE });
      }
    })

    return res.status(200).send({ message: 'Se ha actualizado tu lista de favoritos' });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const waifu = await sequelize.query(`
      SELECT
        w.id,
        w.name,
        w.nickname,
        w.age,
        w.servant,
        w.image_url,
        wt.id AS waifu_type_id,
        wt.name AS waifu_type_name,
        f.id AS franchise_id,
        f.name AS franchise_name,
        f.nickname AS franchise_nickname
      FROM
        waifus AS w
        INNER JOIN waifu_types AS wt ON wt.id = w.waifu_type_id 
        INNER JOIN franchises AS f ON f.id = w.franchise_id 
      WHERE
        w.id = ${id}
    `,{ type: sequelize.QueryTypes.SELECT });
    
    return res.status(200).send(waifu[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, nickname, age, waifu_type_id, franchise_id, servant } = req.body;
  try {
    const waifu = await Waifu.findOne({ where: { id } });
    let result;

    if (req.file) {
      await cloudinary.v2.uploader.destroy(waifu.public_id);
  
      result = await uploadPhoto(req.file.path);
    } else {
      result = { public_id: waifu.public_id, secure_url: waifu.image_url };
    }

    await sequelize.query(`
      UPDATE waifus
      SET
        name = '${name}',
        nickname = '${nickname}',
        age = ${age},
        servant = ${servant},
        public_id = '${result.public_id}',
        image_url = '${result.secure_url}',
        waifu_type_id = ${waifu_type_id},
        franchise_id = ${franchise_id}
      WHERE id = ${id}
    `, { type: sequelize.QueryTypes.UPDATE });
    return res.status(200).send('update');
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

async function uploadPhoto(path) {
  const result = await cloudinary.v2.uploader.upload(
    path,
    { folder: "Waifu List Bot Telegram" }
  );

  await fs.unlink(path);
  return result;
}

module.exports = router;