import fs from "fs-extra";
import * as Cloudinary from "cloudinary";
import { Router, Request, Response } from "express";
import { QueryTypes, Transaction } from "sequelize";
import moment from "moment";

import sequelize from "../db/models";
import { addExpUser } from "../utils/userInfo";
import WaifuModel from "../db/models/waifu.model";
import ActiveModel from "../db/models/active.model";
import ChatModel from "../db/models/chat.model";
import UserModel from "../db/models/user.model";
import UserInfoModel from "../db/models/user_info.model";
import BetModel from "../db/models/bet.model";
import WaifuListModel from "../db/models/waifu_list.model";
import WaifuFavoriteListModel from "../db/models/waifu_favorite_list.model";

const router = Router();
const Waifu = WaifuModel;
const Active = ActiveModel;
const Chat = ChatModel;
const User = UserModel;
const UserInfo = UserInfoModel;
const Bet = BetModel;
const WaifuList = WaifuListModel;
const WaifuFavoriteList = WaifuFavoriteListModel;

const cloudinary = Cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.get("/", async (req: Request, res: Response) => {
  const { name = "", page = 1, franchiseId, id, limit = true } = req.query;
  try {
    const waifus = await sequelize.query(
      `
      SELECT
        w.id,
        w.name,
        w.nickname,
        w.age,
        w.servant,
        w.imageUrl,
        wt.name AS waifu_type_name,
        f.name AS franchise_name,
        f.nickname AS franchise_nickname
      FROM
        waifus AS w
        INNER JOIN waifu_types AS wt ON wt.id = w.waifuTypeId
        INNER JOIN franchises AS f ON f.id = w.franchiseId
      WHERE
        ${id ? "w.id = " + id + " AND" : ""}
        ${franchiseId ? "f.id = " + franchiseId + " AND" : ""}
        (LOWER(w.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(w.nickname) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(w.age) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(wt.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(f.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${String(name).toLowerCase()}%')
      ORDER BY
        f.name ASC, w.name ASC
        ${limit ? "LIMIT 20 OFFSET " + (Number(page) - 1) * 20 : ""}
    `,
      { type: QueryTypes.SELECT }
    );

    const totalItems: any = await sequelize.query(
      `
      SELECT COUNT(*) AS total_items
      FROM
        waifus AS w
        INNER JOIN waifu_types AS wt ON wt.id = w.waifuTypeId
        INNER JOIN franchises AS f ON f.id = w.franchiseId
      WHERE
        ${id ? "w.id = " + id + " AND" : ""}
        ${franchiseId ? "f.id = " + franchiseId + " AND" : ""}
        (LOWER(w.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(w.nickname) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(w.age) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(wt.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(f.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${String(name).toLowerCase()}%')
    `,
      { type: QueryTypes.SELECT }
    );

    const totalPages = Math.ceil(totalItems[0].total_items / 20);
    return res.status(200).json({ waifus, totalPages });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get("/active", async (req: Request, res: Response) => {
  try {
    const waifus = await sequelize.query(
      `
      SELECT
        a.id,
        a.chatId,
        w.name waifu_name,
        w.nickname waifu_nickname,
        w.imageUrl,
        f.name franchise_name,
        f.nickname franchise_nickname
      FROM
        actives a
        INNER JOIN waifus w ON a.waifuId = w.id
        INNER JOIN franchises f on w.franchiseId = f.id
      ORDER BY
        chatId
    `,
      { type: QueryTypes.SELECT }
    );

    return res.status(200).send(waifus);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get("/active", async (req: Request, res: Response) => {
  try {
    const waifus = await sequelize.query(
      `
      SELECT
        w.name,
        w.nickname
      FROM
        actives a
        INNER JOIN waifus w ON a.waifuId = w.id
    `,
      { type: QueryTypes.SELECT }
    );

    return res.status(200).send(waifus);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post("/create", async (req: Request, res: Response) => {
  const { name, nickname, age, waifuTypeId, servant, franchiseId } = req.body;
  const { image, favImg, fallImg, springImg, summerImg, winterImg } =
    req.files as any;

  try {
    const imageDefault = await uploadPhoto(image[0].path);
    const imageFavorite = favImg
      ? await uploadPhoto(favImg[0].path)
      : { publicId: null, secure_url: null };
    const imageFall = fallImg
      ? await uploadPhoto(fallImg[0].path)
      : { publicId: null, secure_url: null };
    const imageSpring = springImg
      ? await uploadPhoto(springImg[0].path)
      : { publicId: null, secure_url: null };
    const imageSummer = summerImg
      ? await uploadPhoto(summerImg[0].path)
      : { publicId: null, secure_url: null };
    const imageWinter = winterImg
      ? await uploadPhoto(winterImg[0].path)
      : { publicId: null, secure_url: null };

    await Waifu.create({
      name,
      nickname,
      age,
      waifuTypeId,
      servant,
      franchiseId,
      publicId: imageDefault.publicId,
      imageUrl: imageDefault.secure_url,
      favPublicId: imageFavorite.publicId,
      favImageUrl: imageFavorite.secure_url,
      fallImageId: imageFall.publicId,
      fallImageUrl: imageFall.secure_url,
      springImageId: imageSpring.publicId,
      springImageUrl: imageSpring.secure_url,
      summerImageId: imageSummer.publicId,
      summerImageUrl: imageSummer.secure_url,
      winterImageId: imageWinter.publicId,
      winterImageUrl: imageWinter.secure_url,
    });

    return res.status(200).send();
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get("/send_waifu", async (req: Request, res: Response) => {
  const { chatId, franchise } = req.query;
  const t = await sequelize.transaction();
  try {
    const chat = await Chat.findOne({ where: { chatIdTg: chatId as string } });
    if (!chat) return res.status(205).send();
    const active = await Active.findOne({ where: { chatId: chat.id } });
    if (active) return res.status(201).send();
    await chat.update({ messageQuantity: 0 }, { transaction: t });
    const waifusQuantities = await Waifu.count();
    const waifuId = Math.round(
      Math.random() * (1 - waifusQuantities) + waifusQuantities
    );
    const waifu = await Waifu.findOne({ where: { id: waifuId } });
    if (!waifu) return res.status(205).send();

    const timeSpire = moment().add(10, "minutes").fromNow();
    await Active.create({
      chatId: chat.id,
      waifuId: waifu.id,
      attempts: new Date(timeSpire),
    });
    return res.status(200).send({ waifu: waifu });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.post("/protecc", async (req: Request, res: Response) => {
  const { message } = req.body;
  const t = await sequelize.transaction();
  const regExp = new RegExp(/[\s_.,-]/);
  try {
    const text = message.text.split(regExp);
    const data: any = await sequelize.query(
      `
      SELECT
        w.id,
        w.name,
        w.nickname,
        w.age,
        w.favImageUrl,
        wt.id waifuTypeId,
        wt.name waifu_type_name,
        f.id franchiseId,
        f.name franchise_name,
        f.nickname franchise_nickname,
        c.id chatId,
        c.chatIdTg,
        a.id active_id
      FROM
        actives a
        INNER JOIN chats c ON c.id = a.chatId
        INNER JOIN waifus w ON w.id = a.waifuId
        INNER JOIN waifu_types wt ON wt.id = w.waifuTypeId
        INNER JOIN franchises f ON f.id = w.franchiseId
      WHERE
        c.chatIdTg = '${message.chat.id}'
    `,
      { type: QueryTypes.SELECT }
    );
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

    let messageResponse = "";
    let resultBets = {};
    let additionalMessage: any;
    const extras = {
      userId: 0,
      chatId: 0,
      waifuId: waifu.id,
      newWaifu: false,
    };

    if (match) {
      let user = await User.findOne({ where: { userIdTg: message.from.id } });
      const chat = await Chat.findOne({ where: { chatIdTg: message.chat.id } });
      if (!chat) return res.status(205).send();
      let userInfo;
      if (user) {
        userInfo = await UserInfo.findOne({ where: { userId: user.id } });
        console.log("datos del usuario en el mensaje", message.from);
        await user.update({
          nickname: `${message.from.username || message.from.first_name}`,
        });
      } else {
        user = await User.create(
          {
            userIdTg: message.from.id,
            nickname: `${message.from.username || message.from.first_name}`,
          },
          { transaction: t }
        );
      }

      const waifuInList = await WaifuList.findOne({
        where: { userId: user.id, waifuId: waifu.id },
        transaction: t,
      });

      if (!waifuInList) {
        await WaifuList.create(
          { userId: user.id, waifuId: waifu.id, quantity: 1 },
          { transaction: t }
        );
      } else {
        await sequelize.query(
          `UPDATE waifu_lists
          SET quantity = quantity + 1
          WHERE id = ${waifuInList.id} `,
          { type: QueryTypes.UPDATE, transaction: t }
        );
      }

      const expType = {
        type: "newWaifu",
        imgFavorite:
          waifu.favImageUrl != "" && waifu.favImageUrl != null ? true : false,
      };
      if (userInfo) {
        additionalMessage = await addExpUser(userInfo.id, expType, t);
      } else {
        userInfo = await UserInfo.create(
          {
            userId: user.id,
          },
          { transaction: t }
        );
        additionalMessage = await addExpUser(userInfo.id, expType, t);
      }

      // await sequelize.query(`DELETE FROM actives WHERE id = ${waifu.active_id}`, { type: sequelize.QueryTypes.DELETE, transaction: t });
      await Active.destroy({ where: { id: waifu.active_id }, transaction: t });

      messageResponse = `Has agregado a ${waifu.name}${
        waifu.nickname.length > 0 ? " (" + waifu.nickname + ")" : ""
      } de la serie ${waifu.franchise_name}${
        waifu.franchise_nickname.length > 0
          ? " (" + waifu.franchise_nickname + ")"
          : ""
      }, ahora aparecerá en tu lista`;
      extras.userId = user.id;
      extras.chatId = chat.id;
      extras.newWaifu = true;

      switch (waifu.type) {
        case 1:
          messageResponse += ".\ndéjame decirte que es una loli";
          break;
        case 3:
          messageResponse += ".\nte gustan las tetas grande ¿eh?";
          break;
        case 4:
          messageResponse += ".\nDios mio mira el tamaño de esas tetas";
        case 5:
          messageResponse += ".\nNo soy nadie para opinar sobre tus gustos";
          break;
        default:
          break;
      }
      if (waifu.age > 0 && waifu.age < 17) {
        messageResponse += `... pero es menor de edad, el FBI te esta vigilando`;
      } else if (waifu.age == 17) {
        messageResponse += `... déjame decirte que todavía es ilegal así que estas bajo vigilancia`;
      } else if (waifu.age > 17 && waifu.age < 50) {
        messageResponse += ` esta es completamente legal, no te preocupes`;
      } else {
        messageResponse += " pero... ¿acaso sabes cual es su edad?";
      }

      resultBets = await deleteBetsActives(waifu.chatId, waifu.franchiseId, t);
    } else {
      messageResponse = "No ese no es su nombre";
      const active = await Active.findOne({ where: { id: waifu.active_id } });
      if (!active) return res.status(205).send();
      if (active.attempts > new Date()) {
        await Active.decrement(
          { attempts: 1 },
          { where: { id: waifu.active_id }, transaction: t }
        );
      } else {
        messageResponse +=
          ", lo siento, se acabo el tiempo. Sera para la proxima";
        await Active.destroy({
          where: { id: waifu.active_id },
          transaction: t,
        });
      }
    }
    messageResponse += "\n" + additionalMessage;
    await t.commit();
    return res
      .status(200)
      .json({ message: messageResponse, extras, bets: resultBets });
  } catch (error) {
    console.error(error);
    t.rollback();
    return res.status(500).send(error);
  }
});

router.post("/change_favorite", async (req: Request, res: Response) => {
  const { waifuNumber, position, chatId, userId } = req.body;
  const t = await sequelize.transaction();
  try {
    const waifu: any = await sequelize.query(
      `
      SELECT
        wl.id,
        IF(w.nickname = '', w.name, CONCAT(w.name, ' (', w.nickname, ')')) name,
        IF(f.nickname = '', f.name, CONCAT(f.name, ' (', f.nickname, ')')) franchise
      FROM
        waifu_lists wl
        INNER JOIN waifus w ON w.id = wl.waifuId
        INNER JOIN franchises f ON f.id = w.franchiseId
        INNER JOIN chats c ON c.id = wl.chatId
        INNER JOIN users u ON u.id = wl.userId
      WHERE
        u.userIdTg = '${userId}' AND
        c.chatIdTg = '${chatId}' AND
        wl.quantity > 0
      ORDER BY f.name ASC, w.name ASC
      LIMIT 1 OFFSET ${waifuNumber - 1}
    `,
      { type: QueryTypes.SELECT }
    );

    if (waifu.length == 0) return res.status(201).send();

    const list: any = await sequelize.query(
      `
      SELECT
        wfl.id id,
        wfl.position,
        wl.id waifuListId
      FROM
        waifu_favorite_lists wfl
        INNER JOIN waifu_lists wl ON wl.id = wfl.waifuListId
        INNER JOIN chats c ON c.id = wl.chatId
        INNER JOIN users u ON u.id = wl.userId
      WHERE
        c.chatIdTg = ${chatId} AND
        u.userIdTg = ${userId} AND
        wl.quantity > 0
      ORDER BY wfl.position ASC
    `,
      { type: QueryTypes.SELECT }
    );

    const userInfo: any = await sequelize.query(
      `
      SELECT
        ui.level
      FROM
        user_infos ui
        INNER JOIN chats c ON ui.chatId = c.id
        INNER JOIN users u ON u.id = ui.userId
      WHERE
        c.chatIdTg = ${chatId} AND
        u.userIdTg = ${userId}
    `,
      { type: QueryTypes.SELECT }
    );

    let newList = [];
    let insert = false;

    const waifusNoSelected = list.filter(
      (item: any) => item.waifuListId != waifu[0].id
    );
    const waifuSelected: any = list.filter(
      (item: any) => item.waifuListId == waifu[0].id
    );
    if (waifuSelected.length > 1) {
      for (let i = 1; i < waifuSelected.length; i++) {
        await WaifuFavoriteList.destroy({
          where: { id: waifuSelected[i].id },
          transaction: t,
        });
      }
    }

    waifusNoSelected.forEach((item: any, index: number) => {
      if (position - 1 == index) {
        insert = true;
        if (waifuSelected.length > 0) {
          newList.push({
            id: waifuSelected[0].id,
            waifuListId: waifuSelected[0].waifuListId,
            position: index + 1,
          });
        } else {
          newList.push({
            id: null,
            waifuListId: waifu[0].id,
            position: index + 1,
          });
        }
        newList.push({
          id: item.id,
          waifuListId: item.waifuListId,
          position: index + 2,
        });
      } else if (insert) {
        newList.push({
          id: item.id,
          waifuListId: item.waifuListId,
          position: index + 2,
        });
      } else {
        newList.push({
          id: item.id,
          waifuListId: item.waifuListId,
          position: index + 1,
        });
      }
    });
    if (!insert)
      newList.push({
        id: null,
        waifuListId: waifu[0].id,
        position: list.length + 1,
      });

    const totalAvailable = (Math.trunc(userInfo[0].level / 5) + 1) * 10;
    if (
      newList.length > totalAvailable &&
      newList[totalAvailable - 1].id !== null
    ) {
      await WaifuFavoriteList.destroy({
        where: { id: newList[totalAvailable - 1].id! },
        transaction: t,
      });
      newList.pop();
    }

    newList.forEach(async (item) => {
      if (item.id == null) {
        await WaifuFavoriteList.create(
          { waifuListId: item.waifuListId, position: item.position },
          { transaction: t }
        );
      } else {
        await WaifuFavoriteList.update(
          { position: item.position },
          { where: { id: item.id }, transaction: t }
        );
      }
    });

    const waifuName = `${waifu[0].name} de la franquicia ${waifu[0].franchise}`;
    return res.status(200).send({
      message: `Se ha agregado a ${waifuName} a tú lista de favoritos`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const waifu = await sequelize.query(
      `
      SELECT
        w.id,
        w.name,
        w.nickname,
        w.age,
        w.servant,
        w.imageUrl,
        w.favImageUrl,
        wt.id AS waifuTypeId,
        wt.name AS waifu_type_name,
        f.id AS franchiseId,
        f.name AS franchise_name,
        f.nickname AS franchise_nickname
      FROM
        waifus AS w
        INNER JOIN waifu_types AS wt ON wt.id = w.waifuTypeId
        INNER JOIN franchises AS f ON f.id = w.franchiseId
      WHERE
        w.id = ${id}
    `,
      { type: QueryTypes.SELECT }
    );

    return res.status(200).send(waifu[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, nickname, age, waifuTypeId, franchiseId, servant } = req.body;
  const { image, favImg, fallImg, springImg, summerImg, winterImg } =
    req.files as any;
  const t = await sequelize.transaction();
  console.log(req.files);
  try {
    const waifu = await Waifu.findOne({ where: { id } });
    if (!waifu) return res.status(205).send();
    let imageDefault,
      imageFavorite,
      imageFall,
      imageSummer,
      imageWinter,
      imageSpring;

    if (image) {
      await cloudinary.v2.uploader.destroy(waifu.publicId);
      imageDefault = await uploadPhoto(image[0].path);
    } else {
      imageDefault = { publicId: waifu.publicId, secure_url: waifu.imageUrl };
    }

    if (favImg) {
      if (waifu.favPublicId)
        await cloudinary.v2.uploader.destroy(waifu.favPublicId);
      imageFavorite = await uploadPhoto(favImg[0].path);
    } else {
      imageFavorite = {
        publicId: waifu.favPublicId,
        secure_url: waifu.favImageUrl,
      };
    }

    if (fallImg) {
      if (waifu.fallImageId)
        await cloudinary.v2.uploader.destroy(waifu.fallImageId);
      imageFall = await uploadPhoto(fallImg[0].path);
    } else {
      imageFall = {
        publicId: waifu.fallImageId,
        secure_url: waifu.fallImageUrl,
      };
    }

    if (springImg) {
      if (waifu.springImageId)
        await cloudinary.v2.uploader.destroy(waifu.springImageId);
      imageSpring = await uploadPhoto(springImg[0].path);
    } else {
      imageSpring = {
        publicId: waifu.springImageId,
        secure_url: waifu.springImageUrl,
      };
    }

    if (summerImg) {
      if (waifu.summerImageId)
        await cloudinary.v2.uploader.destroy(waifu.summerImageId);
      imageSummer = await uploadPhoto(summerImg[0].path);
    } else {
      imageSummer = {
        publicId: waifu.summerImageId,
        secure_url: waifu.summerImageUrl,
      };
    }

    if (winterImg) {
      if (waifu.winterImageId)
        await cloudinary.v2.uploader.destroy(waifu.winterImageId);
      imageWinter = await uploadPhoto(winterImg[0].path);
    } else {
      imageWinter = {
        publicId: waifu.winterImageId,
        secure_url: waifu.winterImageUrl,
      };
    }

    await Waifu.update(
      {
        name,
        nickname,
        age,
        servant,
        publicId: imageDefault.publicId,
        imageUrl: imageDefault.secure_url,
        favPublicId: imageFavorite.publicId,
        favImageUrl: imageFavorite.secure_url,
        fallImageId: imageFall.publicId,
        fallImageUrl: imageFall.secure_url,
        springImageId: imageSpring.publicId,
        springImageUrl: imageSpring.secure_url,
        summerImageId: imageSummer.publicId,
        summerImageUrl: imageSummer.secure_url,
        winterImageId: imageWinter.publicId,
        winterImageUrl: imageWinter.secure_url,
        waifuTypeId,
        franchiseId,
      },
      { where: { id }, transaction: t }
    );

    return res.status(200).send("update");
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.post("/span_specific", async (req: Request, res: Response) => {
  const { waifuId, chatId } = req.body;
  const t = await sequelize.transaction();

  try {
    await Active.create({ waifuId, chatId }, { transaction: t });

    return res.status(201).json({ message: "Waifu spammed" });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

async function uploadPhoto(path: string) {
  const result = await cloudinary.v2.uploader.upload(path, {
    folder: "Waifu List Bot Telegram",
  });

  await fs.unlink(path);
  return result;
}

async function deleteBetsActives(
  chatId: number,
  franchiseId: number,
  t: Transaction
) {
  const sql = `SELECT
      b.id,
      b.franchiseId,
      b.active,
      b.quantity,
      ui.chatId,
      u.nickname,
      ui.id user_info_id
    FROM
      bets b
      INNER JOIN user_infos ui ON b.user_info_id = ui.id
      INNER JOIN users u ON u.id = ui.userId
    WHERE
      ui.chatId = ${chatId}`;

  const bets: any = await sequelize.query(sql, { type: QueryTypes.SELECT });

  const betsActives = await Promise.all(
    bets.filter((bet: any) => bet.active == true)
  );
  const betsInactive = await Promise.all(
    bets.filter((bet: any) => bet.active == false)
  );

  console.log(betsActives, betsInactive);

  const betsWinners = await Promise.all(
    betsActives.filter((bet) => bet.franchiseId === franchiseId)
  );
  const betsLosers = await Promise.all(
    betsActives.filter((bet) => bet.franchiseId !== franchiseId)
  );

  let winners = {};
  let losers = {};

  if (betsWinners.length > 0) {
    winners = await Promise.all(
      betsWinners.map(async (winner) => {
        await UserInfo.increment(
          {
            points: winner.quantity * 10,
            totalBetsWon: 1,
            totalBetsPointsWon: winner.quantity * 10,
          },
          {
            where: { id: winner.userInfoId },
            transaction: t,
          }
        );
        return `@${winner.nickname} ha ganado ${winner.quantity * 10}.`;
      })
    );
  }

  if (betsLosers.length > 0) {
    losers = await Promise.all(
      betsLosers.map(async (loser) => {
        await UserInfo.increment(
          { totalBetsLost: 1 },
          { where: { id: loser.user_info_id }, transaction: t }
        );
        return `@${loser.nickname}`;
      })
    );
  }

  const idToDelete = await Promise.all(betsActives.map((bet) => bet.id));
  await Bet.destroy({ where: { id: idToDelete }, transaction: t });

  if (betsInactive.length > 0) {
    const idToUpdate = await Promise.all(betsInactive.map((bet) => bet.id));
    await Bet.update(
      { active: true },
      { where: { id: idToUpdate }, transaction: t }
    );
  }

  return { winners, losers };
}

export default router;
