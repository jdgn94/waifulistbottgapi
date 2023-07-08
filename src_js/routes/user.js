const express = require('express');
const { sequelize } = require('../models');
const Users = require('../models').user;
const Chats = require('../models').chat;
const userInfos = require('../models').user_info;
const utilUserInfo = require('../utils/userInfo');

const router = express.Router();

router.get('/profile', async (req, res) => {
  const { chatId, userId } = req.query;
  console.log(req.query);
  try {
    const user = await Users.findOne({ where: { user_id_tg: userId } });
    if (!user) return res.status(201).send();
    const chat = await Chats.findOne({ where: { chat_id_tg: chatId } });

    const totalWaifus = await sequelize.query(`SELECT COUNT(*) total FROM waifu_lists wl WHERE wl.user_id = ${user.id} AND wl.chat_id = ${chat.id} LIMIT 1`, { type: sequelize.QueryTypes.SELECT });

    let profile = await userInfos.findOne({ where: { user_id: user.id, chat_id: chat.id } });
    if (!profile) profile = await createProfile(user.id, chat.id, totalWaifus[0].total);
    console.log(profile);

    const data = { profile: profile, totalWaifus: totalWaifus[0].total };
    return res.status(200).send(data);
  } catch (error) {
    return res.status(500).send();
  }
});

async function createProfile (userId, chatId, totalWaifus) {
  let exp = 0,
      limit_exp = 100,
      level = 1;

  for (i = 1; i < totalWaifus; i++) {
    const expTemp = exp;
    const addExp = await utilUserInfo.numberRandom(13, 17);
    exp = (exp + addExp) % limit_exp;
    level = exp < expTemp ? level + 1 : level;
    limit_exp = (parseInt(level / 5) * 25) + 100;
  }

  console.log("estoy justo aqui");
  console.log(exp, limit_exp, level);
  const profile = await userInfos.create({ user_id: userId, chat_id: chatId, level, limit_exp, exp, points: totalWaifus });
  return profile;
}

module.exports = router;