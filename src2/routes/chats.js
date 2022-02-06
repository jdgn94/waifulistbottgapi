const Chats = require('../db/models').chat;
const Actives = require('../db/models').active;
const db = require('../db/models');
const express = require('express');

const router = express.Router();
const sequelize = db.sequelize;

router.post('/add_chat', async (req, res) => {
  const { chatId } = req.body;
  try {
    const exist = await Chats.findOne({ where: { chat_id_tg: chatId } });
    if (!exist) {
      const chat = await Chats.create({ chat_id_tg: chatId, message_limit: 100, message_quantity: 0 });

      if (chat.dataValues.id) return res.status(200).send({ message: 'Genial, el chat se ha registrado satisfactoriamente, que empiece el juego, aqui va la primera waifu' });
      else return res.status(500).send({ message: 'Ocurrio un Error al registrar el chat, intentelo mas tarde' });
    } else return res.status(201).send({ message: 'Este chat ya esta registrado, no es necesario que se vuelva a correr el comando /start' });
  } catch (error) {
    return res.status(500).send('Ocurrio un error inesperado');
  }
});

router.get('/top', async (req, res) => {
  const { chatId } = req.query;
  try {
    const users = await sequelize.query(`
      SELECT
        u.nickname,
        SUM(wl.quantity) quantity
      FROM
        users u
        INNER JOIN waifu_lists wl ON u.id = wl.user_id
        INNER JOIN chats c ON c.id = wl.chat_id
      WHERE
        c.chat_id_tg = ${chatId}
      GROUP BY wl.user_id
      ORDER BY quantity DESC
      LIMIT 10
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(users);
    if (users.length == 0) return res.status(201).send();
    return res.status(200).send({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/:chatId', async (req, res) => {
  const { chatId } = req.params;
  try {
    const chat = await Chats.findOne({ where: { chat_id_tg: chatId } });
    if (!chat) return res.status(201).send();
    const active = await Actives.findOne({ where: { chat_id: chat.dataValues.id } });
    if (active != null) return res.status(201).send();
    await sequelize.query(`
      UPDATE chats
      SET message_quantity = message_quantity + 1
      WHERE id = ${chat.dataValues.id}
    `, { type: sequelize.QueryTypes.UPDATE });

    if (chat.message_quantity + 1 >= chat.message_limit) return res.status(200).send()
    return res.status(201).send();
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
});

router.put('/change_time', async (req, res) => {
  const { chatId, quantity } = req.body;
  try {
    await sequelize.query(`
      UPDATE chats
      SET message_limit = ${quantity}
      WHERE chat_id_tg = '${chatId}'
    `, { type: sequelize.QueryTypes.UPDATE });

    return res.status(200).send();
  } catch (error) {
    console.error(error)
    return res.status(500).send();
  }
});

module.exports = router;