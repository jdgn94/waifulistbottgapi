import { Router, Request, Response } from "express";
import { QueryTypes } from "sequelize";

import db from "../../db/models";
import { numberRandom } from "../utils/userInfo";

const router = Router();
const sequelize = db.sequelize;
const Users = db.UserModel;
const Chats = db.ChatModel;
const UserInfos = db.UserInfoModel;

router.get("/profile", async (req: Request, res: Response) => {
  const { chatId, userId } = req.query;
  console.log(req.query);
  try {
    const user = await Users.findOne({ where: { user_id_tg: userId } });
    if (!user) return res.status(201).send();
    const chat = await Chats.findOne({ where: { chat_id_tg: chatId } });
    if (!chat) return res.status(201).send();

    const totalWaifus: any = await sequelize.query(
      `SELECT COUNT(*) total FROM waifu_lists wl WHERE wl.user_id = ${user.id} AND wl.chat_id = ${chat.id} LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    let profile = await UserInfos.findOne({
      where: { user_id: user.id, chat_id: chat.id },
    });
    if (!profile)
      profile = await createProfile(user.id, chat.id, totalWaifus[0].total);
    console.log(profile);

    const data = { profile: profile, totalWaifus: totalWaifus[0].total };
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send();
  }
});

async function createProfile(
  userId: number,
  chatId: number,
  totalWaifus: number
) {
  const t = await sequelize.transaction();
  let exp = 0,
    limit_exp = 100,
    level = 1;

  for (var i = 1; i < totalWaifus; i++) {
    const expTemp = exp;
    const addExp = await numberRandom(13, 17);
    exp = (exp + addExp) % limit_exp;
    level = exp < expTemp ? level + 1 : level;
    limit_exp = Math.trunc(level / 5) * 25 + 100;
  }

  console.log("estoy justo aqui");
  console.log(exp, limit_exp, level);
  const profile = await UserInfos.create(
    {
      user_id: userId,
      chat_id: chatId,
      points: totalWaifus,
      exp,
      limit_exp,
      level,
      favorite_pages: Math.trunc(level / 5) + 1,
      favorite_pages_purchases: 0,
    },
    { transaction: t }
  );
  return profile;
}

export default router;
