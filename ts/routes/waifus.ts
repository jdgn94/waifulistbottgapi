import fs from 'fs-extra';
import * as Cloudinary from 'cloudinary';
import { Router, Request, Response } from 'express';
import { QueryTypes, Transaction } from 'sequelize';

import db from '../db/models';
import { addExpUser } from '../utils/userInfo';

const router = Router();
const sequelize = db.sequelize;
const Waifu = db.WaifuModel;
const Franchise = db.FranchiseModel;
const Active = db.ActiveModel;
const Chat = db.ChatModel;
const User = db.UserModel;
const UserInfo = db.UserInfoModel;
const Bet = db.BetModel;
const WaifuList = db.WaifuListModel;
const WaifuFavoriteList = db.WaifuFavoriteListModel;

const cloudinary = Cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

router.get('/', async (req: Request, res: Response) => {
  const { name = '', page = 1, franchise_id, id, limit = true } = req.query;
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
        ${id ? 'w.id = ' + id + ' AND' : ''}
        ${franchise_id ? 'f.id = ' + franchise_id + ' AND' : ''}
        (LOWER(w.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(w.nickname) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(w.age) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(wt.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(f.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${String(name).toLowerCase()}%')
      ORDER BY
        f.name ASC, w.name ASC
        ${limit ? 'LIMIT 20 OFFSET ' + ((Number(page) - 1) * 20) : ''}
    `,
      { type: QueryTypes.SELECT });

    const totalItems: any = await sequelize.query(`
      SELECT COUNT(*) AS total_items
      FROM
        waifus AS w
        INNER JOIN waifu_types AS wt ON wt.id = w.waifu_type_id
        INNER JOIN franchises AS f ON f.id = w.franchise_id
      WHERE
        ${id ? 'w.id = ' + id + ' AND' : ''}
        ${franchise_id ? 'f.id = ' + franchise_id + ' AND' : ''}
        (LOWER(w.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(w.nickname) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(w.age) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(wt.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(f.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${String(name).toLowerCase()}%')
    `, { type: QueryTypes.SELECT });

    const totalPages = Math.ceil(totalItems[0].total_items / 20);
    return res.status(200).json({ waifus, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error)
  }
});

router.get('/active', async (req: Request, res: Response) => {
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
    `, { type: QueryTypes.SELECT });

    return res.status(200).send(waifus)
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get('/active', async (req: Request, res: Response) => {
  try {
    const waifus = await sequelize.query(`
      SELECT
        w.name,
        w.nickname
      FROM
        actives a
        INNER JOIN waifus w ON a.waifu_id = w.id
    `, { type: QueryTypes.SELECT });

    return res.status(200).send(waifus)
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post('/create', async (req: Request, res: Response) => {
  const { name, nickname, age, waifu_type_id, servant, franchise_id } = req.body;
  const { image, fav_img, fall_img, spring_img, summer_img, winter_img } = req.files as any;

  try {
    const imageDefault = await uploadPhoto(image[0].path);
    const imageFavorite = fav_img ? await uploadPhoto(fav_img[0].path) : { public_id: null, secure_url: null };
    const imageFall = fall_img ? await uploadPhoto(fall_img[0].path) : { public_id: null, secure_url: null };
    const imageSpring = spring_img ? await uploadPhoto(spring_img[0].path) : { public_id: null, secure_url: null };
    const imageSummer = summer_img ? await uploadPhoto(summer_img[0].path) : { public_id: null, secure_url: null };
    const imageWinter = winter_img ? await uploadPhoto(winter_img[0].path) : { public_id: null, secure_url: null };

    await Waifu.create({
      name,
      nickname,
      age,
      waifu_type_id,
      servant,
      franchise_id,
      public_id: imageDefault.public_id,
      image_url: imageDefault.secure_url,
      fav_public_id: imageFavorite.public_id,
      fav_image_url: imageFavorite.secure_url,
      fall_image_id: imageFall.public_id,
      fall_image_url: imageFall.secure_url,
      spring_image_id: imageSpring.public_id,
      spring_image_url: imageSpring.secure_url,
      summer_image_id: imageSummer.public_id,
      summer_image_url: imageSummer.secure_url,
      winter_image_id: imageWinter.public_id,
      winter_image_url: imageWinter.secure_url,
    });

    return res.status(200).send()
  } catch (error) {
    console.error(error);
    return res.status(500).send(error)
  }
});

router.get('/send_waifu', async (req: Request, res: Response) => {
  const { chatId, franchise } = req.query;
  const t = await sequelize.transaction();
  try {
    const chat = await Chat.findOne({ where: { chat_id_tg: chatId } });
    if (!chat) return res.status(205).send();
    const active = await Active.findOne({ where: { chat_id: chat.id } });
    if (active) return res.status(201).send();
    // await sequelize.query(`UPDATE chats SET message_quantity = 0 WHERE id = ${chat.id}`, { type: QueryTypes.UPDATE });
    await chat.update({ message_quantity: 0 }, { transaction: t });
    // const waifusQuantities = await sequelize.query(`SELECT COUNT(*) total FROM waifus`, { type: QueryTypes.SELECT });
    const waifusQuantities = await Waifu.count();
    const waifuId = Math.round(Math.random() * (1 - waifusQuantities) + waifusQuantities);
    const waifu = await Waifu.findOne({ where: { id: waifuId } });
    if (!waifu) return res.status(205).send();
    await Active.create({ chat_id: chat.id, waifu_id: waifu.id, attempts: 10 });
    return res.status(200).send({ waifu: waifu });
  } catch (error) {
    console.error(error)
    return res.status(500).send()
  }
});

router.post('/protecc', async (req: Request, res: Response) => {
  const { message } = req.body;
  const t = await sequelize.transaction();
  const regExp = new RegExp(/[\s_.,-]/)
  try {
    const text = message.text.split(regExp);
    const data: any = await sequelize.query(`
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
    `, { type: QueryTypes.SELECT });
    if (data.length == 0) return res.status(201).send();
    const waifu = data[0];
    const { name, nickname } = waifu;
    const nicknameArr = nickname.split(regExp);
    const nameArr = name.split(regExp);

    let match = false;
    if (nickname.length > 0) {
      for (var i = 1; i < text.length; i++) {
        await nicknameArr.forEach((item: any) => {
          if (item.toLowerCase() == text[i].toLowerCase()) match = true;
        });
      }
    }

    if (!match) {
      for (var i = 1; i < text.length; i++) {
        await nameArr.forEach((item: any) => {
          if (item.toLowerCase() == text[i].toLowerCase()) match = true;
        });
      }
    }

    let messageResponse = '';
    let resultBets = {};
    let aditionalMessage: any;
    const extras = {
      userId: 0,
      chatId: 0,
      waifuId: waifu.id,
      newWaifu: false,
    }

    if (match) {
      let user = await User.findOne({ where: { user_id_tg: message.from.id } });
      const chat = await Chat.findOne({ where: { chat_id_tg: message.chat.id } });
      if (!chat) return res.status(205).send();
      let userInfo;
      if (user) {
        userInfo = await UserInfo.findOne({ where: { user_id: user.id } });
        console.log("datos del usuario en el mensaje", message.from);
        await user.update({ nickname: `${message.from.username || message.from.first_name}` })
      } else {
        user = await User.create({ user_id_tg: message.from.id, nickname: `${message.from.username || message.from.first_name}` }, { transaction: t });
      }

      const waifuInList = await WaifuList.findOne({ where: { user_id: user.id, chat_id: chat.id, waifu_id: waifu.id }, transaction: t });

      if (!waifuInList) {
        await WaifuList.create({ user_id: user.id, chat_id: chat.id, waifu_id: waifu.id, quantity: 1 }, { transaction: t });
      } else {
        await sequelize.query(
          `UPDATE waifu_lists
          SET quantity = quantity + 1
          WHERE id = ${waifuInList.id} `,
          { type: QueryTypes.UPDATE, transaction: t }
        );
      }

      const expType = { type: 'newWaifu', imgFavorite: waifu.fav_image_url != '' && waifu.fav_image_url != null ? true : false };
      if (userInfo) {
        aditionalMessage = await addExpUser(userInfo.id, expType, t);
      } else {
        userInfo = await UserInfo.create({
          user_id: user.id,
          chat_id: chat.id
        }, { transaction: t });
        aditionalMessage = await addExpUser(userInfo.id, expType, t);
      }

      // await sequelize.query(`DELETE FROM actives WHERE id = ${waifu.active_id}`, { type: sequelize.QueryTypes.DELETE, transaction: t });
      await Active.destroy({ where: { id: waifu.active_id }, transaction: t });

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
      if (!active) return res.status(205).send();
      if (active.attempts > 1) {
        messageResponse += `, apurense solo quedan ${active.attempts - 1}`;
        await Active.decrement({ attempts: 1 }, { where: { id: waifu.active_id }, transaction: t });
      } else {
        messageResponse += ', lo siento, se acabaron los intentos. Sera para la proxima';
        await Active.destroy({ where: { id: waifu.active_id }, transaction: t });
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

router.post('/change_favorite', async (req: Request, res: Response) => {
  const { waifuNumber, position, chatId, userId } = req.body;
  const t = await sequelize.transaction();
  try {
    const waifu: any = await sequelize.query(`
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
    `, { type: QueryTypes.SELECT });

    if (waifu.length == 0) return res.status(201).send();

    const list: any = await sequelize.query(`
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
    `, { type: QueryTypes.SELECT });

    const userInfo: any = await sequelize.query(`
      SELECT
        ui.level
      FROM
        user_infos ui
        INNER JOIN chats c ON ui.chat_id = c.id
        INNER JOIN users u ON u.id = ui.user_id
      WHERE
        c.chat_id_tg = ${chatId} AND
        u.user_id_tg = ${userId}
    `, { type: QueryTypes.SELECT });

    let newList = [];
    let insert = false;

    const waifusNoSelected = list.filter((item: any) => item.waifu_list_id != waifu[0].id);
    const waifuSelected: any = list.filter((item: any) => item.waifu_list_id == waifu[0].id);
    if (waifuSelected.length > 1) {
      for (let i = 1; i < waifuSelected.length; i++) {
        await WaifuFavoriteList.destroy({ where: { id: waifuSelected[i].id }, transaction: t });
      }
    }

    waifusNoSelected.forEach((item: any, index: number) => {
      if (position - 1 == index) {
        insert = true;
        if (waifuSelected.length > 0) {
          newList.push({ id: waifuSelected[0].id, waifu_list_id: waifuSelected[0].waifu_list_id, position: index + 1 });
        } else {
          newList.push({ id: null, waifu_list_id: waifu[0].id, position: index + 1 });
        }
        newList.push({ id: item.id, waifu_list_id: item.waifu_list_id, position: index + 2 });
      } else if (insert) {
        newList.push({ id: item.id, waifu_list_id: item.waifu_list_id, position: index + 2 });
      } else {
        newList.push({ id: item.id, waifu_list_id: item.waifu_list_id, position: index + 1 });
      }
    });
    if (!insert) newList.push({ id: null, waifu_list_id: waifu[0].id, position: list.length + 1 });

    const totalAvailable = (Math.trunc(userInfo[0].level / 5) + 1) * 10;
    if (newList.length > totalAvailable) {
      // await sequelize.query(`DELETE FROM waifu_favorite_lists WHERE waifu_list_id = ${newList[totalAvailable - 1].waifu_list_id}`, { type: sequelize.QueryTypes.DELETE });
      await WaifuFavoriteList.destroy({ where: { id: newList[totalAvailable - 1].id }, transaction: t });
      newList.pop();
    }

    newList.forEach(async item => {
      if (item.id == null) {
        await WaifuFavoriteList.create({ waifu_list_id: item.waifu_list_id, position: item.position }, { transaction: t });
      } else {
        await WaifuFavoriteList.update({ position: item.position }, { where: { id: item.id }, transaction: t });
      }
    });

    const waifuName = `${waifu[0].name} de la franquicia ${waifu[0].franchise}`
    return res.status(200).send({ message: `Se ha agregado a ${waifuName} a tú lista de favoritos` });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
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
    `, { type: QueryTypes.SELECT });

    return res.status(200).send(waifu[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, nickname, age, waifu_type_id, franchise_id, servant } = req.body;
  const { image, fav_img, fall_img, spring_img, summer_img, winter_img } = req.files as any;
  const t = await sequelize.transaction();
  console.log(req.files);
  try {
    const waifu = await Waifu.findOne({ where: { id } });
    if (!waifu) return res.status(205).send();
    let imageDefault, imageFavorite, imageFall, imageSummer, imageWinter, imageSpring;

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

    if (fall_img) {
      if (waifu.fall_image_id) await cloudinary.v2.uploader.destroy(waifu.fall_image_id);
      imageFall = await uploadPhoto(fall_img[0].path);
    } else {
      imageFall = { public_id: waifu.fall_image_id, secure_url: waifu.fall_image_url };
    }

    if (spring_img) {
      if (waifu.spring_image_id) await cloudinary.v2.uploader.destroy(waifu.spring_image_id);
      imageSpring = await uploadPhoto(spring_img[0].path);
    } else {
      imageSpring = { public_id: waifu.spring_image_id, secure_url: waifu.spring_image_url };
    }

    if (summer_img) {
      if (waifu.summer_image_id) await cloudinary.v2.uploader.destroy(waifu.summer_image_id);
      imageSummer = await uploadPhoto(summer_img[0].path);
    } else {
      imageSummer = { public_id: waifu.summer_image_id, secure_url: waifu.summer_image_url };
    }

    if (winter_img) {
      if (waifu.winter_image_id) await cloudinary.v2.uploader.destroy(waifu.winter_image_id);
      imageWinter = await uploadPhoto(winter_img[0].path);
    } else {
      imageWinter = { public_id: waifu.winter_image_id, secure_url: waifu.winter_image_url };
    }

    await Waifu.update({
      name,
      nickname,
      age,
      servant,
      public_id: imageDefault.public_id,
      image_url: imageDefault.secure_url,
      fav_public_id: imageFavorite.public_id,
      fav_image_url: imageFavorite.secure_url,
      fall_image_id: imageFall.public_id,
      fall_image_url: imageFall.secure_url,
      spring_image_id: imageSpring.public_id,
      spring_image_url: imageSpring.secure_url,
      summer_image_id: imageSummer.public_id,
      summer_image_url: imageSummer.secure_url,
      winter_image_id: imageWinter.public_id,
      winter_image_url: imageWinter.secure_url,
      waifu_type_id,
      franchise_id
    }, { where: { id }, transaction: t });

    return res.status(200).send('update');
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.post('/span_specific', async (req: Request, res: Response) => {
  const { waifu_id, chat_id } = req.body;
  const t = await sequelize.transaction();

  try {
    await Active.create({ waifu_id, chat_id }, { transaction: t });

    return res.status(201).json({ message: 'Waifu spanmed' });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

async function uploadPhoto(path: string) {
  const result = await cloudinary.v2.uploader.upload(
    path,
    { folder: "Waifu List Bot Telegram" }
  );

  await fs.unlink(path);
  return result;
}

async function deleteBetsActives(chat_id: number, franchise_id: number, t: Transaction) {
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

  const bets: any = await sequelize.query(sql, { type: QueryTypes.SELECT });

  const betsActives = await Promise.all(bets.filter((bet: any) => bet.active == true));
  const betsUnactive = await Promise.all(bets.filter((bet: any) => bet.active == false));

  console.log(betsActives, betsUnactive)

  const betsWinners = await Promise.all(betsActives.filter(bet => bet.franchise_id === franchise_id));
  const betsLosers = await Promise.all(betsActives.filter(bet => bet.franchise_id !== franchise_id));

  let winners = {};
  let losers = {};

  if (betsWinners.length > 0) {
    winners = await Promise.all(betsWinners.map(async winner => {
      await UserInfo.increment({
        points: winner.quantity * 10,
        total_bets_won: 1,
        total_bets_points_won: winner.quantity * 10
      }, {
        where: { id: winner.user_info_id },
        transaction: t
      });
      return `@${winner.nickname} ha ganado ${winner.quantity * 10}.`
    }));
  }

  if (betsLosers.length > 0) {
    losers = await Promise.all(betsLosers.map(async loser => {
      await UserInfo.increment({ total_bets_lost: 1 }, { where: { id: loser.user_info_id }, transaction: t });
      return `@${loser.nickname}`
    }));
  }

  const idToDelete = await Promise.all(betsActives.map(bet => bet.id));
  await Bet.destroy({ where: { id: idToDelete }, transaction: t });

  if (betsUnactive.length > 0) {
    const idToIpdate = await Promise.all(betsUnactive.map(bet => bet.id));
    await Bet.update({ active: true }, { where: { id: idToIpdate }, transaction: t });
  }

  return { winners, losers };
}

export default router;
