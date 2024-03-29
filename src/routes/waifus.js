const Waifu = require('../models').waifu;
const Active = require('../models').active;
const Chat = require('../models').chat;
const User = require('../models').user;
const UserInfo = require('../models').user_info;
const WaifuList = require('../models').waifu_list;
const UserInfos = require('../models').user_info;
const Bet = require('../models').bet;
const utilUserInfo = require('../utils/userInfo');
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
  let { name, page, franchise_id, id, limit } = req.query;
  if (!name) name = ''
  if (!page) page = 1;
  if (!limit) limit = true;
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
        ${id > 0 ? 'w.id = ' + id + ' AND' : ''}
        ${franchise_id > 0 ? 'f.id = ' + franchise_id + ' AND' : ''}
        (LOWER(w.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.nickname) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.age) LIKE '%${name.toLowerCase()}%' OR
        LOWER(wt.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${name.toLowerCase()}%')
      ORDER BY
        f.name ASC, w.name ASC
        ${limit ? 'LIMIT 20 OFFSET ' + ((page - 1) * 20) : ''}
    `,
      { type: sequelize.QueryTypes.SELECT });

    const totalItems = await sequelize.query(`
      SELECT COUNT(*) AS total_items
      FROM 
        waifus AS w
        INNER JOIN waifu_types AS wt ON wt.id = w.waifu_type_id 
        INNER JOIN franchises AS f ON f.id = w.franchise_id 
      WHERE
        ${id > 0 ? 'w.id = ' + id + ' AND' : ''}
        ${franchise_id > 0 ? 'f.id = ' + franchise_id + ' AND' : ''}
        (LOWER(w.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.nickname) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.age) LIKE '%${name.toLowerCase()}%' OR
        LOWER(wt.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${name.toLowerCase()}%')
    `, { type: sequelize.QueryTypes.SELECT });

    const totalPages = Math.ceil(totalItems[0].total_items / 20);
    return res.status(200).json({ waifus, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error)
  }
});

router.get('/active', async (req, res) => {
  try {
    const waifus = await sequelize.query(`
      SELECT
        a.id,
        a.chat_id,
        w.name waifu_name,
        w.nickname waifu_nickname,
        w.image_url,
        f.name franchise_name,
        f.nickname franchise_nickname
      FROM
        actives a
        INNER JOIN waifus w ON a.waifu_id = w.id
        INNER JOIN franchises f on w.franchise_id = f.id
      ORDER BY
        chat_id
    `, { type: sequelize.QueryTypes.SELECT });

    return res.status(200).send(waifus)
  } catch (error) {
    return res.status(500).send(error);
  }
});

// router.get('/active', async (req, res) => {
//   try {
//     const waifus = await sequelize.query(`
//       SELECT
//         w.name,
//         w.nickname
//       FROM
//         actives a
//         INNER JOIN waifus w ON a.waifu_id = w.id 
//     `, { type: sequelize.QueryTypes.SELECT });

//     return res.status(200).send(waifus)
//   } catch (error) {
//     return res.status(500).send(error);
//   }
// });

router.post('/create', async (req, res) => {
  const { name, nickname, age, waifu_type_id, servant, franchise_id } = req.body;
  const { image, fav_img } = req.files

  try {
    const imageDefault = await uploadPhoto(image[0].path);
    const imageFavorite = fav_img ? await uploadPhoto(fav_img[0].path) : { public_id: null, secure_url: null };
    const waifu = await Waifu.create({
      name,
      nickname,
      age,
      waifu_type_id,
      servant,
      franchise_id,
      public_id: imageDefault.public_id,
      image_url: imageDefault.secure_url,
      fav_public_id: imageFavorite.public_id,
      fav_image_url: imageFavorite.secure_url
    });

    return res.status(200).send()
  } catch (error) {
    console.error(error);
    return res.status(500).send(error)
  }
});

router.get('/send_waifu', async (req, res) => {
  const { chatId, franchise } = req.query;
  try {
    const chatData = await Chat.findOne({ where: { chat_id_tg: chatId } });
    const chat = chatData.dataValues;
    const active = await Active.findOne({ where: { chat_id: chat.id } });
    if (active) return res.status(201).send();
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
  const t = await sequelize.transaction();
  const regExp = new RegExp(/[\s_.,-]/)
  try {
    const text = message.text.split(regExp);
    const data = await sequelize.query(`
      SELECT
        w.id,
        w.name,
        w.nickname,
        w.age,
        w.fav_image_url,
        wt.id waifu_type_id,
        wt.name waifu_type_name,
        f.id franchise_id,
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
    const waifu = data[0];
    const { name, nickname } = waifu;
    const nicknameArr = nickname.split(regExp);
    const nameArr = name.split(regExp);

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
    let resultBets = [];
    let aditionalMessage = '';
    const extras = {
      userId: '',
      chatId: '',
      waifuId: waifu.id,
      newWaifu: false,
    }

    if (match) {
      let user = await User.findOne({ where: { user_id_tg: message.from.id } });
      const chat = await Chat.findOne({ where: { chat_id_tg: message.chat.id } });
      let userInfo = await UserInfo.findOne({ where: { user_id: user.id, chat_id: chat.id } });
      console.log("datos del usuario en el mensaje", message.from);
      if (!user) {
        user = await User.create({ user_id_tg: message.from.id, nickname: `${message.from.username || message.from.first_name}` }, { transaction: t });
      } else {
        await sequelize.query(`UPDATE users SET nickname = '${message.from.username || message.from.first_name}' WHERE id = ${user.dataValues.id}`, { type: sequelize.QueryTypes.UPDATE, transaction: t });
      }

      const waifuInList = await WaifuList.findOne({ where: { user_id: user.dataValues.id, chat_id: chat.dataValues.id, waifu_id: waifu.id } }, { transaction: t });

      if (!waifuInList) {
        await WaifuList.create({ user_id: user.dataValues.id, chat_id: chat.dataValues.id, waifu_id: waifu.id, quantity: 1 }, { transaction: t });
      } else {
        await sequelize.query(
          `UPDATE waifu_lists
          SET quantity = quantity + 1
          WHERE id = ${waifuInList.dataValues.id} `,
          { type: sequelize.QueryTypes.UPDATE, transaction: t }
        );
      }

      const expType = { type: 'newWaifu', imgFavorite: waifu.fav_image_url != '' && waifu.fav_image_url != null ? true : false };
      if (userInfo) {
        aditionalMessage = await utilUserInfo.addExpUser(userInfo.id, expType);
      } else {
        userInfo = await UserInfo.create({ user_id: user.id, chat_id: chat.id });
        aditionalMessage = await utilUserInfo.addExpUser(userInfo.id, expType);
      }

      await sequelize.query(`DELETE FROM actives WHERE id = ${waifu.active_id}`, { type: sequelize.QueryTypes.DELETE, transaction: t });

      messageResponse = `Has agregado a ${waifu.name}${waifu.nickname.length > 0 ? ' (' + waifu.nickname + ')' : ''} de la serie ${waifu.franchise_name}${waifu.franchise_nickname.length > 0 ? ' (' + waifu.franchise_nickname + ')' : ''}, ahora aparecera en tu lista`;
      extras.userId = user.id;
      extras.chatId = chat.id;
      extras.newWaifu = true;

      switch (waifu.type) {
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
      if (waifu.age > 0 && waifu.age < 17) {
        messageResponse += `... pero es menor de edad, el FBI te esta vigilando`;
      } else if (waifu.age == 17) {
        messageResponse += `... dejame decirte que todavía es ilegal así que estas bajo vigilancia`;
      } else if (waifu.age > 17 && waifu.age < 50) {
        messageResponse += ` esta es completamente legal, no te preocupes`;
      } else {
        messageResponse += ' pero... ¿acaso sabes cual es su edad?';
      }

      resultBets = await deleteBetsActives(waifu.chat_id, waifu.franchise_id, t);
    } else {
      messageResponse = 'No ese no es su nombre';
      const active = await Active.findOne({ where: { id: waifu.active_id } });
      if (active.dataValues.attempts > 1) {
        messageResponse += `, apurense solo quedan ${active.dataValues.attempts - 1}`;
        await sequelize.query(`UPDATE actives SET attempts = attempts - 1 WHERE id = ${waifu.active_id}`, { type: sequelize.QueryTypes.UPDATE, transaction: t });
      } else {
        messageResponse += ', lo siento, se acabaron los intentos. Sera para la proxima';
        await sequelize.query(`DELETE FROM actives WHERE id = ${waifu.active_id}`, { type: sequelize.QueryTypes.DELETE, transaction: t });
      }
    }
    messageResponse += '\n' + aditionalMessage;
    await t.commit();
    return res.status(200).json({ message: messageResponse, extras, bets: resultBets });
  } catch (error) {
    console.error(error);
    t.rollback();
    return res.status(500).send(error);
  }
});

router.post('/change_favorite', async (req, res) => {
  const { waifuNumber, position, chatId, userId } = req.body;
  try {
    const waifu = await sequelize.query(`
      SELECT
        wl.id,
        IF(w.nickname = '', w.name, CONCAT(w.name, ' (', w.nickname, ')')) name,
        IF(f.nickname = '', f.name, CONCAT(f.name, ' (', f.nickname, ')')) franchise
      FROM
        waifu_lists wl
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN franchises f ON f.id = w.franchise_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN users u ON u.id = wl.user_id
      WHERE
        u.user_id_tg = '${userId}' AND
        c.chat_id_tg = '${chatId}' AND
        wl.quantity > 0
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
        u.user_id_tg = ${userId} AND
        wl.quantity > 0
      ORDER BY wfl.position ASC 
    `, { type: sequelize.QueryTypes.SELECT });

    const userInfo = await sequelize.query(`
      SELECT
        ui.level
      FROM
        user_infos ui
        INNER JOIN chats c ON ui.chat_id = c.id
        INNER JOIN users u ON u.id = ui.user_id
      WHERE
        c.chat_id_tg = ${chatId} AND
        u.user_id_tg = ${userId}
    `, { type: sequelize.QueryTypes.SELECT });

    let newList = [];
    let insert = false;

    const waifusNoSelected = list.filter(item => item.waifu_list_id != waifu[0].id);
    const waifuSelected = list.filter(item => item.waifu_list_id == waifu[0].id);
    if (waifuSelected.length > 1) {
      for (let i = 1; i < waifuSelected.length; i++) {
        await sequelize.query(`
          DELETE FROM waifu_favorite_lists WHERE waifu_favorite_lists.id = ${waifuSelected[i].id}
        `, { type: sequelize.QueryTypes.DELETE });
      }
    }

    await waifusNoSelected.forEach(async (item, index) => {
      if (position - 1 == index) {
        insert = true;
        if (waifuSelected.length > 0) {
          await newList.push({ id: waifuSelected[0].id, waifu_list_id: waifuSelected[0].waifu_list_id, position: index + 1 });
        } else {
          await newList.push({ id: null, waifu_list_id: waifu[0].id, position: index + 1 });
        }
        await newList.push({ id: item.id, waifu_list_id: item.waifu_list_id, position: index + 2 });
      } else if (insert) {
        await newList.push({ id: item.id, waifu_list_id: item.waifu_list_id, position: index + 2 });
      } else {
        await newList.push({ id: item.id, waifu_list_id: item.waifu_list_id, position: index + 1 });
      }
    });
    if (!insert) await newList.push({ id: null, waifu_list_id: waifu[0].id, position: list.length + 1 });

    const totalAvailable = (parseInt(userInfo[0].level / 5) + 1) * 10;
    if (newList.length > totalAvailable) {
      await sequelize.query(`DELETE FROM waifu_favorite_lists WHERE waifu_list_id = ${newList[totalAvailable - 1].waifu_list_id}`, { type: sequelize.QueryTypes.DELETE });
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
    });

    const waifuName = `${waifu[0].name} de la franquicia ${waifu[0].franchise}`
    return res.status(200).send({ message: `Se ha agregado a ${waifuName} a tú lista de favoritos` });
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
        w.fav_image_url,
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
    `, { type: sequelize.QueryTypes.SELECT });

    return res.status(200).send(waifu[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, nickname, age, waifu_type_id, franchise_id, servant } = req.body;
  const { image, fav_img } = req.files
  console.log(req.files);
  try {
    const waifu = await Waifu.findOne({ where: { id } });
    let imageDefault;
    let imageFavorite;

    if (image) {
      await cloudinary.v2.uploader.destroy(waifu.public_id);

      imageDefault = await uploadPhoto(image[0].path);
    } else {
      imageDefault = { public_id: waifu.public_id, secure_url: waifu.image_url };
    }

    if (fav_img) {
      if (waifu.fav_public_id) await cloudinary.v2.uploader.destroy(waifu.fav_public_id);

      imageFavorite = await uploadPhoto(fav_img[0].path);
    } else {
      imageFavorite = { public_id: waifu.fav_public_id, secure_url: waifu.fav_image_url };
    }

    await sequelize.query(`
      UPDATE waifus
      SET
        name = '${name}',
        nickname = '${nickname}',
        age = ${age},
        servant = ${servant},
        public_id = '${imageDefault.public_id}',
        image_url = '${imageDefault.secure_url}',
        fav_public_id = '${imageFavorite.public_id}',
        fav_image_url = '${imageFavorite.secure_url}',
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

router.post('/span_specific', async (req, res) => {
  const { waifu_id, chat_id } = req.body;

  // return res.status(200).json({ message: 'llegue a la llamada' });

  const t = await sequelize.transaction();

  try {
    await sequelize.query(`
      INSERT INTO actives
      SET
        waifu_id = ${waifu_id},
        chat_id = ${chat_id},
        attempts = 10
      `,
      { tramsaction: t }
    );

    return res.status(201).json({ message: 'Waifu spanmed' });
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

async function deleteBetsActives(chat_id, franchise_id, t) {
  const sql =
    `SELECT 
      b.id,
      b.franchise_id,
      b.active,
      b.quantity,
      ui.chat_id,
      u.nickname,
      ui.id user_info_id 
    FROM 
      bets b 
      INNER JOIN user_infos ui ON b.user_info_id = ui.id
      INNER JOIN users u ON u.id = ui.user_id
    WHERE 
      ui.chat_id = ${chat_id}`;

  const bets = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  const betsActives = await Promise.all(bets.filter(bet => bet.active == true));
  const betsUnactive = await Promise.all(bets.filter(bet => bet.active == false));

  console.log(betsActives, betsUnactive)

  const betsWinners = await Promise.all(betsActives.filter(bet => bet.franchise_id === franchise_id));
  const betsLosers = await Promise.all(betsActives.filter(bet => bet.franchise_id !== franchise_id));

  let winners = [];
  let losers = [];

  if (betsWinners.length > 0) {
    winners = await Promise.all(betsWinners.map(async winner => {
      await sequelize.query(
        `UPDATE user_infos
        SET 
          points = points + ${winner.quantity * 10},
          total_bets_won = total_bets_won + 1,
          total_bets_points_won = total_bets_points_won + ${winner.quantity * 10}
        WHERE id = ${winner.user_info_id}`,
        { type: sequelize.QueryTypes.UPDATE, transaction: t }
      );
      return `@${winner.nickname} ha ganado ${winner.quantity * 10}.`
    }));
  }

  if (betsLosers.length > 0) {
    losers = await Promise.all(betsLosers.map(async loser => {
      await sequelize.query(
        `UPDATE user_infos 
        SET total_bets_lost = total_bets_lost + 1
        WHERE id = ${loser.user_info_id}`,
        { type: sequelize.QueryTypes.UPDATE, transaction: t }
      );
      return `@${loser.nickname}`
    }));
  }

  const idToDelete = await Promise.all(betsActives.map(bet => bet.id));
  await Bet.destroy({ where: { id: idToDelete } }, { transaction: t });

  if (betsUnactive.length > 0) {
    const idToIpdate = await Promise.all(betsUnactive.map(bet => bet.id));
    const query =
      `UPDATE bets
      SET active = ${true}
      WHERE id IN (${idToIpdate})`;

    await sequelize.query(query, { type: sequelize.QueryTypes.UPDATE, transaction: t });
  }

  return { winners, losers };
}

module.exports = router;
