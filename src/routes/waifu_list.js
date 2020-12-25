const express = require('express');
const db = require('../models');
const Trades = require('../models').trade;
const WaifuLists = require('../models').waifu_list;
const Chats = require('../models').chat;
const Users = require('../models').user;
const Profiles = require('../models').user_info;
const Waifus = require('../models').waifu;
const Franchises = require('../models').franchise;
const WaifuFavoriteLists = require('../models').waifu_favorite_list;
const Trade = require('../models').trade;

const router = express.Router();
const sequelize = db.sequelize;

router.get('/', async (req, res) => {
  const { userTgId, chatTgId } = req.query;
  let { page } = req.query;
  if (!page) page = 1;

  try {
    const waifus = await sequelize.query(`
      SELECT
        w.name,
        w.nickname,
        w.servant,
        wl.quantity,
        f.id franchise_id,
        (CASE
          WHEN f.nickname = "" THEN f.name
          ELSE CONCAT(f.name, ' - (', f.nickname, ')')
        END) franchise
      FROM
        waifu_lists wl
        INNER JOIN users u ON u.id = wl.user_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN franchises f ON f.id = w.franchise_id
      WHERE
        u.user_id_tg = '${userTgId}' AND 
        c.chat_id_tg = '${chatTgId}' AND
        wl.quantity > 0
      ORDER BY
          f.name ASC, w.name ASC
      LIMIT 20 OFFSET ${(page - 1) * 20}
    `, { type: sequelize.QueryTypes.SELECT });

    const totalItems = await sequelize.query(`
      SELECT
        COUNT(*) total_items
      FROM
        waifu_lists wl
        INNER JOIN users u ON u.id = wl.user_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN franchises f ON f.id = w.franchise_id
      WHERE
        u.user_id_tg = '${userTgId}' AND 
        c.chat_id_tg = '${chatTgId}' AND
        wl.quantity > 0
    `, { type: sequelize.QueryTypes.SELECT });

    const totalPages = Math.ceil(totalItems[0].total_items / 20);
    if (waifus.length > 0) return res.status(200).send({ message:"Estas tu lista", waifus, page, totalPages });
    else return res.status(201).send({ message: "Lo siento pero no tienes waifus en tu lista, debes ser mas rapido que los demas", waifus });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/details', async (req, res) => {
  const { userId, chatId } = req.query;
  try {
    const total = await sequelize.query(`
      SELECT
        COUNT(*) total
      FROM
        waifu_lists wl
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN users u ON u.id = wl.user_id
      WHERE 
        u.user_id_tg = ${userId} AND
        c.chat_id_tg = ${chatId} AND
        wl.quantity > 0
      ORDER BY c.id
    `, { type: sequelize.QueryTypes.SELECT });

    const indefinides = await sequelize.query(`
      SELECT
        COUNT(*) indefinides
      FROM
        waifu_lists wl
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN users u ON u.id = wl.user_id
      WHERE 
        u.user_id_tg = ${userId} AND
        c.chat_id_tg = ${chatId} AND
        w.age = 0 AND
        wl.quantity > 0
    `, { type: sequelize.QueryTypes.SELECT });

    const ilegals = await sequelize.query(`
      SELECT
        COUNT(*) ilegals
      FROM
        waifu_lists wl
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN users u ON u.id = wl.user_id
      WHERE 
        u.user_id_tg = ${userId} AND
        c.chat_id_tg = ${chatId} AND
        w.age > 0 AND w.age < 18 AND
        wl.quantity > 0
    `, { type: sequelize.QueryTypes.SELECT });

    const legals = await sequelize.query(`
      SELECT
        COUNT(*) legals
      FROM
        waifu_lists wl
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN users u ON u.id = wl.user_id
      WHERE 
        u.user_id_tg = ${userId} AND
        c.chat_id_tg = ${chatId} AND
        w.age > 17 AND
        wl.quantity > 0
    `, { type: sequelize.QueryTypes.SELECT });
  
    const data = {
      totals: total.length > 0 ? total[0].total: 0,
      indefinides: indefinides.length > 0 ? indefinides[0].indefinides : 0,
      ilegals: ilegals.length > 0 ? ilegals[0].ilegals : 0,
      legals: legals.length > 0 ? legals[0].legals : 0
    }
    let message = '';
  
    if (data.ilegals > data.indefinides && data.ilegals > data.legals) message = 'Dejame decirte que estas en problemas, te gustan mucho las ilegales cuidado con el #FBI que te tiene bien vigilado, aqui el total de waifus en tu lista: ';
    else if (data.legals > data.indefinides && data.legals > data.ilegals) message = 'Dejame decirte que estas en lo legal, no tengo nada que decir solo que aqui esta la cantidad de waifus en tu lista: ';
    else if(data.indefinides > data.legals && data.indefinides > data.ilegals) message = 'Dejame decirte que no estas en problemas pero no sabía que tus gustos eran hacia las mayores, aqui el numero total de tus waifus: ';
    else if (data.ilegals == data.indefinides && data.ilegals == data.legals) message = 'Tu eres una persona completamente neutral, me agradas mucho, aqui esta la cantidad total de tus waifus: ';
    else if (data.ilegals == data.indefinides || data.ilegals == data.legals) message = 'Tus gustos son un tanto extraño, el #FBI te tiene en su lista aunque solo te vigilan aveces, aqui esta la cantidad de waifus que tienes: ';
    else message = 'Las que mas te mas tienes son legales, exelente eres una persona que va por el camino correcto de la vida, aqui el numero de tus waifus: ';

    return res.status(200).send({ message, legals: data.legals, ilegals: data.ilegals, indefinides: data.indefinides, totals: data.totals });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/favorites', async (req, res) => {
  console.log("llegue a la llamada de los favoritos");
  const { chatId, userId, page } = req.query;
  try {
    const waifus = await sequelize.query(`
      SELECT
        (CASE
          WHEN w.nickname != '' THEN CONCAT(w.name, ' - (', w.nickname, ')')
          ELSE w.name
        END) name,
        (CASE
          WHEN f.nickname != '' THEN CONCAT(f.name, ' - (', f.nickname, ')')
          ELSE f.name
        END) franchise,
        w.public_id,
        w.image_url,
        w.fav_public_id,
        w.fav_image_url,
        wfl.position
      FROM
        waifu_favorite_lists wfl
        INNER JOIN waifu_lists wl ON wl.id = wfl.waifu_list_id
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN franchises f ON f.id = w.franchise_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN users u ON u.id = wl.user_id
      WHERE
        c.chat_id_tg = '${chatId}' AND
        u.user_id_tg = '${userId}' AND
        wl.quantity > 0
      ORDER BY
        wfl.position ASC
      LIMIT 10 OFFSET ${(page - 1) * 10};
    `, { type: sequelize.QueryTypes.SELECT });

    const totalItems = await sequelize.query(`
      SELECT
        COUNT(wfl.id) total
      FROM
        waifu_favorite_lists wfl
        INNER JOIN waifu_lists wl ON wl.id = wfl.waifu_list_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN users u ON u.id = wl.user_id
      WHERE
        c.chat_id_tg = '${chatId}' AND
        u.user_id_tg = '${userId}' AND
        wl.quantity > 0
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(totalItems);

    const totalPages = parseInt(totalItems[0].total / 10) + 1;

    console.log(waifus);
    if (waifus.length > 0) return res.status(200).json({ waifus, totalPages, actualPage: page });
    return res.status(201).send({ message: 'Parece que todavia no has agregado ninguna waifu a esta lista, lo puedes hacer por el comando /addfavorite <numero en tu lista> <posición>' });
  } catch (error) {
    console.error(error)
    return res.status(500).send();
  }
});

router.get('/favorites_details', async (req, res) => {
  const { chatId, userId } = req.query;
  try {
    const result = await sequelize.query(`
      SELECT 
        SUM(IF(w.age > 17, 1, 0)) legals,
        SUM(IF(w.age > 0 AND w.age < 18, 1, 0)) ilegals,
        SUM(IF(w.age = 0, 1, 0))indefinides
      FROM 
        waifu_favorite_lists wfl 
        INNER JOIN waifu_lists wl ON wfl.waifu_list_id = wl.id 
        INNER JOIN waifus w ON w.id = wl.waifu_id 
        INNER JOIN users u ON u.id =wl.user_id 
        INNER JOIN chats c ON c.id = wl.chat_id 
      WHERE 
        u.user_id_tg = '${userId}' AND 
        c.chat_id_tg = '${chatId}'
      LIMIT 1
    `, { type: sequelize.QueryTypes.SELECT });

    const { legals, ilegals, indefinides } = result[0];
    let message = `Legales: ${legals}\nIlegales: ${ilegals}\nIndefinidas: ${indefinides}\n`;
    if (legals > ilegals && legals > indefinides) {
      message += '\nNo estas en problemas, lo que más te gustan son legales 👍';
    } else if (ilegals > legals && ilegals > indefinides) {
      message += '\nAmigo, sera mejor que vivas bien escondido, la 🇺🇳 te anda buscando';
    } else if (indefinides > ilegals && indefinides > legals) {
      message += '\nNo estas en problemas pero... no sabia que te gustabas la mayores';
    } else {
      message += '\nTus guston son algo extraños, no se como calificarte';
    } 
    return res.status(200).send({ message });
  } catch (error) {
    console.error(error);
    return res.status(500).send();
  }
});

router.get('/trade_info', async (req, res) => {
  const { messageId } = req.query;
  try {
    const messageInfo = await sequelize.query(`
      SELECT 
        t.chat_id chat_id,
        ue.id user_emiter_id,
        ue.nickname user_emiter_name,
        wle.waifu_id waifu_emiter_id,
        ur.id user_receptor_id,
        wlr.waifu_id waifu_receptor_id,
        ur.nickname user_receptor_name
      FROM 
        trades t 
        INNER JOIN waifu_lists wle ON t.waifu_emiter_id = wle.id
        INNER JOIN users ue ON ue.id = wle.user_id 
        INNER JOIN waifu_lists wlr ON t.waifu_receptor_id = wlr.id 
        INNER JOIN users ur ON ur.id = wlr.user_id 
      WHERE
        t.message_id = ${messageId}
      LIMIT 1
    `, { type: sequelize.QueryTypes.SELECT });
    
    const data = {
      chatId: messageInfo[0].chat_id,
      user_emiter_id: messageInfo[0].user_emiter_id,
      user_emiter_name: messageInfo[0].user_emiter_name,
      waifu_emiter_id: messageInfo[0].waifu_emiter_id,
      user_receptor_id: messageInfo[0].user_receptor_id,
      user_receptor_name: messageInfo[0].user_receptor_name,
      waifu_receptor_id: messageInfo[0].waifu_receptor_id
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).send()
  }
});

router.put('/deleted_favorite', async (req, res) => {
  const { position, userIdTg, chatIdTg } = req.body;
  const t = await sequelize.transaction();
  try {
    const chat = await Chats.findOne({ where: { chat_id_tg: chatIdTg }});
    const user = await Users.findOne({ where: { user_id_tg: userIdTg }});
    const waifuToDelete = await sequelize.query(`
      SELECT
        wfl.id,
        IF(w.nickname = '', w.name, CONCAT(w.name, ' (', w.nickname, ')')) name,
        IF(f.nickname = '', f.name, CONCAT(f.name, ' (', f.nickname, ')')) franchise
      FROM
        waifu_favorite_lists wfl
        INNER JOIN waifu_lists wl ON wfl.waifu_list_id = wl.id
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN franchises f ON f.id = w.franchise_id
      WHERE
        wfl.position = ${position} AND 
        wl.user_id = ${chat.id} AND 
        wl.chat_id = ${user.id}
      LIMIT 1
    `, { type: sequelize.QueryTypes.SELECT });
    
    if (waifuToDelete.length < 1) return res.status(200).send({ message: 'No tienes una waifu en esa posicion' });
    await WaifuFavoriteLists.destroy({ where: { id: waifuToDelete[0].id }}, { transaction: t });
    const allWaifus = await sequelize.query(`
      SELECT
        wfl.id,
        wfl.position
      FROM
        waifu_favorite_lists wfl
        INNER JOIN waifu_lists wl ON wfl.waifu_list_id = wl.id
      WHERE
      wl.user_id = ${chat.id} AND 
      wl.chat_id = ${user.id}
      ORDER BY wfl.position
    `, { type: sequelize.QueryTypes.SELECT });

    const newPositionAllWaifus = await reasingPos(allWaifus);
    console.log('-------------------------------------------');
    console.log('-------------------------------------------');
    console.log("id de waifus con sus nuevas posiciones", newPositionAllWaifus);
    console.log('-------------------------------------------');
    console.log('-------------------------------------------');
    await WaifuFavoriteLists.bulkCreate(newPositionAllWaifus, { transaction: t, updateOnDuplicate: ['position'] });
    
    await t.commit();
    const waifuName = `${waifuToDelete[0].name} de la franquicia ${waifuToDelete[0].franchise}`;
    return res.status(200).send({ message: `Se ha eliminado de la lista de favoritos a ${waifuName}`})
  } catch (error) {
    console.error(error);
    await t.rollback()
    return res.status(500).send('')
  }
})

router.put('/trade_proposition', async (req, res) => {
  console.log(req.body);
  const { myWaifuNumber, otherWaifuNumber, chatId, userId, otherUserId } = req.body;
  try {
    const users = await sequelize.query(`
      SELECT id, user_id_tg
      FROM users
      WHERE user_id_tg = '${userId}' || user_id_tg = '${otherUserId}'
    `, { type: sequelize.QueryTypes.SELECT });
  
    const chat = await sequelize.query(`SELECT id FROM chats WHERE chat_id_tg = '${chatId}' LIMIT 1`, { type: sequelize.QueryTypes.SELECT });
  
    console.log(users);
    let myUser, otherUser;
    await users.forEach(item => {
      console.log(item);
      if (item.user_id_tg == userId.toString()) myUser = item;
      else otherUser = item;
    });
  
    const query = `
      SELECT 
        wl.id,
        wl.user_id,
        (CASE
          WHEN w.nickname = "" THEN w.name
          ELSE CONCAT(w.name, ' - (', w.nickname, ')')
        END) name,
        (CASE
          WHEN f.nickname = "" THEN f.name
          ELSE CONCAT(f.name, ' - (', f.nickname, ')')
        END) franchise
      FROM 
        waifu_lists wl
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN franchises f ON f.id = w.franchise_id
      WHERE
    `;

    console.log(chat);
  
    const myWaifu = await sequelize.query(`
      ${query}
        wl.user_id = ${myUser.id} AND 
        wl.chat_id = ${chat[0].id} AND
        wl.quantity > 0
      ORDER BY f.name ASC, w.name ASC
      LIMIT 1 OFFSET ${myWaifuNumber - 1};
    `, { type: sequelize.QueryTypes.SELECT });
  
    const otherWaifu = await sequelize.query(`
      ${query}
        wl.user_id = ${otherUser.id} AND 
        wl.chat_id = ${chat[0].id} AND
        wl.quantity > 0
      ORDER BY f.name ASC, w.name ASC
      LIMIT 1 OFFSET ${otherWaifuNumber - 1};
    `, { type: sequelize.QueryTypes.SELECT });

    
    if (myWaifu.length == 0) return res.status(201).send({ message: `Tu no tienes una waifu en la posición ${myWaifuNumber} para poder intercambiar`});
    else if (otherWaifu.length == 0) return res.status(201).send({ message: `Con quien quieres intercambiar no tiene una waifu en la posición ${otherWaifuNumber}` });
    
    const trade = await Trades.create({
     message_id: 0,
     waifu_emiter_id: myWaifu[0].id,
     waifu_receptor_id: otherWaifu[0].id,
     chat_id: chat[0].id
   });

    console.log(myWaifu[0], otherWaifu[0]);
    return res.status(200).send({ myWaifu: myWaifu[0], otherWaifu: otherWaifu[0], tradeId: trade.dataValues.id });
  } catch (error) {
    console.error(error)
    return res.status(500).send()
  }
});

router.put('/update_trade', async (req, res) => {
  const { messageId, tradeId } = req.body;
  try {
    await sequelize.query(`
      UPDATE trades
      SET message_id = '${messageId}'
      WHERE id = ${tradeId}
    `, { type: sequelize.QueryTypes.UPDATE });

    return res.status(200).send();
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
});

router.put('/trade_answer', async (req, res) => {
  const { answer, messageId, userTgId } = req.body;
  const t = await sequelize.transaction();
  try {
    const trade = await sequelize.query(`
      SELECT 
        t.id trade_id,
        c.id chat_id,
        ue.id user_emiter_id,
        ue.user_id_tg user_emiter_tg_id,
        wle.id waifu_emiter_list_id,
        we.id waifu_emiter_id,
        IF(we.nickname <> '', CONCAT(we.name, ' (', we.nickname, ')'), we.name) waifu_emiter_name,
        IF(fe.nickname <> '', CONCAT(fe.name, ' (', fe.nickname , ')'), fe.name) franchise_emiter_name,
        wle.quantity waifu_emiter_quantity,
        IF(wfle.id IS NULL, 0, 1) waifu_emiter_favorite,
        ur.id user_receptor_id,
        ur.user_id_tg user_receptor_tg_id,
        wlr.id waifu_receptor_list_id,
        wr.id waifu_receptor_id,
        IF(wr.nickname <> '', CONCAT(wr.name, ' (', wr.nickname, ')'), wr.name) waifu_receptor_name,
        IF(fr.nickname <> '', CONCAT(fr.name, ' (', fr.nickname, ')'), fr.name) franchise_receptor_name,
        wlr.quantity waifu_receptor_quantity,
        IF(wflr.id IS NULL, 0, 1) waifu_receptor_favorite
      FROM 
      trades t 
        INNER JOIN chats c ON t.chat_id = c.id 
        INNER JOIN waifu_lists wle ON wle.id = t.waifu_emiter_id 
        INNER JOIN waifus we ON we.id = wle.waifu_id 
        INNER JOIN franchises fe ON fe.id = we.franchise_id 
        LEFT JOIN waifu_favorite_lists wfle ON wfle.waifu_list_id = wle.id 
        INNER JOIN users ue ON ue.id = wle.user_id 
        INNER JOIN waifu_lists wlr ON wlr.id = t.waifu_receptor_id 
        INNER JOIN waifus wr ON wr.id = wlr.waifu_id 
        INNER JOIN franchises fr ON fr.id = wr.franchise_id 
        LEFT JOIN waifu_favorite_lists wflr ON wflr.waifu_list_id = wlr.id 
        INNER JOIN users ur ON ur.id = wlr.user_id 
      WHERE 
        t.message_id = ${messageId} AND
        (ue.user_id_tg = ${userTgId} OR ur.user_id_tg = ${userTgId})
      LIMIT 1;
    `,
    { type: sequelize.QueryTypes.SELECT });

    if (!trade) return res.status(401).send('No puedes intervenir en el intercambio');

    if (!answer) {
      await deleteTrade(trade[0].trade_id, t);
      return res.status(201).send();
    }

    if (userTgId.toString() == trade[0].user_emiter_tg_id.toString())
      return res.status(300).send('No tienes permiso para aceptar el intercambio ya que eres el que lo propuso');

    const chatId = trade[0].chat_id;
    const tradeId = trade[0].trade_id;
    const emiter = {
      id: trade[0].user_emiter_id,
      tg_id: trade[0].user_emiter_tg_id,
      waifu_list_id: trade[0].waifu_emiter_list_id,
      waifu_id: trade[0].waifu_emiter_id,
      waifu_name: trade[0].waifu_emiter_name,
      franchice_name: trade[0].franchise_emiter_name,
      waifu_quantity: trade[0].waifu_emiter_quantity,
      favorite: trade[0].waifu_emiter_favorite
    };
    const receptor = {
      id: trade[0].user_receptor_id,
      tg_id: trade[0].user_receptor_tg_id,
      waifu_list_id: trade[0].waifu_receptor_list_id,
      waifu_id: trade[0].waifu_receptor_id,
      waifu_name: trade[0].waifu_receptor_name,
      franchice_name: trade[0].franchise_receptor_name,
      waifu_quantity: trade[0].waifu_receptor_quantity,
      favorite: trade[0].waifu_receptor_favorite
    };

    if ((emiter.favorite && emiter.waifu_quantity < 2) || (receptor.favorite && receptor.waifu_quantity < 2)) {
      // INFO codigo 202, no se puede intercambiar debido a que uno de los 2 tiene a la waifu en favorita y la cantidad es menor a 2
      let name = '', franchise = ''
      if (emiter.waifu_quantity < 2) {
        name = emiter.waifu_name;
        franchise = emiter.franchice_name;
      }
      else {
        name = receptor.waifu_name;
        franchise = receptor.franchice_name;
      }

      await deleteTrade(tradeId, t);
      return res.status(202).send({ message: `No se puede realizar el intercambio debido a que ${name} de ${franchise} esta marcada como favorita y no se tiene un clon para poder intercambiarla` });
    } else {
      await removeWaifu(emiter.waifu_list_id, t);

      await removeWaifu(receptor.waifu_list_id, t);

      const waifuAddEmiter = await searchWaifu(receptor.waifu_id, emiter.id, chatId);
      const waifuAddReceptor = await searchWaifu(emiter.waifu_id, receptor.id, chatId);

      if (waifuAddEmiter) await addWaifu(waifuAddEmiter.id, t);
      else await createWaifu(emiter.id, receptor.waifu_id, chatId, t);

      if (waifuAddReceptor) await addWaifu(waifuAddReceptor.id, t);
      else await createWaifu(receptor.id, emiter.waifu_id, chatId, t);

      await deleteTrade(tradeId, t);
      return res.status(200).send({ message: 'El intercambio fue exitoso' });
    }

  } catch (error) {
    console.log(error);
    await t.rollback();
    return res.status(500).send();
  }
});

router.post('/add_list', async (req, res) => {
  const { userId, chatId, franchiseNumber = 0, waifuNumber = 0 } = req.body;
  const t = await sequelize.transaction();
  try {
    const user = await Users.findOne({ where: { user_id_tg: userId } });
    const chat = await Chats.findOne({ where: { chat_id_tg: chatId } });
    const profile = await Profiles.findOne({ where: { user_id: user.id, chat_id: chat.id } });
    const data = {
      user,
      chat,
      profile
    };
    if (franchiseNumber > 0) {
      if (profile.points < 10) return res.status(205).send('No posees suficientes puntos para obtener una waifu');
      
      const franchise = await sequelize.query(`
        SELECT 
          f.id,
          IF(f.nickname = '', f.name, CONCAT(f.name, ' (', f.nickname, ')')) name,
          COUNT(w.id) quantity
        FROM 
          franchises f 
          INNER JOIN waifus w ON f.id = w.franchise_id 
        GROUP BY f.id
        ORDER BY f.name
        LIMIT 1 OFFSET ${franchiseNumber - 1}
      `, { type: sequelize.QueryTypes.SELECT });
      if (franchise.length == 0) return res.status(205).send('No se encontro la franquicia')

      if (waifuNumber > 0) {
        if (profile.points < 20) return res.status(205).send();

        const waifu = await sequelize.query(`
          SELECT 
            id,
            IF(nickname = '', name, CONCAT(name, ' (', nickname, ')')) name
          FROM waifus
          WHERE franchise_id = ${franchise[0].id}
          ORDER BY name
          LIMIT 1 OFFSET ${waifuNumber - 1}
        `, { type: sequelize.QueryTypes.SELECT });

        if (waifu.length == 0) return res.status(205).send('No se encontro la waifu');

        data.franchise = franchise[0]; 
        data.waifu = waifu[0];
        data.cost = 20;
      } else {
        const waifus = await sequelize.query(`
          SELECT 
            id,
            IF(nickname = '', name, CONCAT(name, ' (', nickname, ')')) name
          FROM waifus
          WHERE franchise_id = ${franchise[0].id}
        `, { type: sequelize.QueryTypes.SELECT });

        const index = await Math.round(Math.random() * (0 - (waifus.length - 1)) + waifus.length - 1);
        const waifu = waifus[index];
        
        data.franchise = franchise[0]; 
        data.waifu = waifu;
        data.cost = 10;
      }
    } else {
      if (profile.points < 5) return res.status(205),send();

      const waifusQuantities = await sequelize.query(`SELECT COUNT(*) total FROM waifus`, { type: sequelize.QueryTypes.SELECT });
      const waifuId = Math.round(Math.random() * (1 - waifusQuantities[0].total) + waifusQuantities[0].total);
      const waifu = await Waifus.findOne({ where: { id: waifuId } });
      const franchise = await Franchises.findOne({ where: { id: waifu.franchise_id } });

      const franchiseFormated = {
        id: franchise.id,
        name: franchise.nickname == '' ? franchise.name : franchise.name + ' (' + franchise.nickname + ')'
      }

      const waifuFormated = {
        id: waifu.id,
        name: waifu.nickname == '' ? waifu.name : waifu.name + ' (' + waifu.nickname + ')'
      }

      data.franchise = franchiseFormated; 
      data.waifu = waifuFormated;
      data.cost = 5;
    }
    console.log(data);

    await sequelize.query(`UPDATE user_infos SET points = points - ${data.cost} WHERE id = ${profile.id}`, { transaction: t });

    const waifuInList = await WaifuLists.findOne({ where: { user_id: user.id, chat_id: chat.id, waifu_id: data.waifu.id } });
    if (waifuInList) {
      await sequelize.query(`UPDATE waifu_lists SET quantity = quantity + 1 WHERE id = ${waifuInList.id}`, { transaction: t });
      console.log("se actualizo la cantidad");
    } else {
      await WaifuLists.create({ chat_id: chat.id, user_id: user.id, waifu_id: data.waifu.id, quantity: 1 }, { transaction: t });
      console.log("se agrego una nueva");
    }
    await t.commit();
    return res.status(200).send(data)
  } catch (error) {
    console.error(error);
    await t.rollback();
    return res.status(500).send(error);
  }
});

async function deleteTrade(tradeId, t) {
  await sequelize.query(`DELETE FROM trades WHERE id = ${tradeId}`, { type: sequelize.QueryTypes.DELETE , transaction: t });
  await t.commit();
}

router.post('/delete_list', async (req, res) => {
  const { userId, chatId, waifuNumber = 0, quantity = 0 } = req.body;
  const t = await sequelize.transaction();

  try {
    if (waifuNumber == 0) return res.status(205).send('Debes enviar un número indicando el la waifu en tu listado');
    const user = await Users.findOne({ where: { user_id_tg: userId } });
    const chat = await Chats.findOne({ where: { chat_id_tg: chatId } });
    const profile = await Profiles.findOne({ where: { user_id: user.id, chat_id: chat.id } });

    const waifu = await sequelize.query(`
      SELECT 
        wl.id,
        IF(w.nickname = '', w.name, CONCAT(w.name, ' (', w.nickname, ')')) name,
        IF(f.nickname = '', f.name, CONCAT(f.name, ' (', f.nickname, ')')) franchise,
        wl.quantity 
      FROM 
        waifu_lists wl
        INNER JOIN waifus w ON w.id = wl.waifu_id 
        INNER JOIN franchises f ON f.id = w.franchise_id 
      WHERE
        user_id = ${user.id} AND
        chat_id = ${chat.id}
      ORDER BY f.name, w.name
      LIMIT 1 OFFSET ${waifuNumber - 1}
    `, { type: sequelize.QueryTypes.SELECT });

    if (waifu[0].quantity <= 1) return res.status(205).send(`Debes tener a ${waifu[0].name} de ${waifu[0].franchise} más de 1 vez para porder cambiarla por puntos`);

    const quantityDelete = quantity >= waifu[0].quantity ? waifu[0].quantity - 1 : quantity == 0 ? 1 : quantity;
    
    await sequelize.query(`UPDATE user_infos SET points = points + ${quantityDelete} WHERE id = ${profile.id}`, { transaction: t });
    await sequelize.query(`UPDATE waifu_lists SET quantity = quantity - ${quantityDelete} WHERE id = ${waifu[0].id}`, { transaction: t });

    const data = {
      profile,
      waifu: waifu[0],
      points: quantityDelete
    }

    await t.commit();
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    t.rollback();
    return res.status(500).send();
  }
});

async function searchWaifu(waifuId, userId, chatId) {
  const waifu = await sequelize.query(`
    SELECT
      id
    FROM
      waifu_lists
    WHERE
      user_id = ${userId} AND
      waifu_id = ${waifuId} AND
      chat_id = ${chatId}
    LIMIT 1
  `, { type: sequelize.QueryTypes.SELECT });

  return waifu.length > 0 ? waifu[0] : null;
}

async function addWaifu(waifuListId, t) {
  await sequelize.query(`
    UPDATE waifu_lists
    SET quantity = quantity + 1
    WHERE id = ${waifuListId}
  `,
  { 
    type: sequelize.QueryTypes.UPDATE,
    transaction: t
  });
  return;
}

async function removeWaifu(waifuListId, t) {
  await sequelize.query(`
    UPDATE waifu_lists
    SET quantity = quantity - 1
    WHERE id = ${waifuListId}
  `,
  {
    type: sequelize.QueryTypes.UPDATE,
    transaction: t
  });
  return;
}

async function deleteWaifu(waifuListId, t) {
  await sequelize.query(`
    DELETE FROM waifu_lists WHERE id = ${waifuListId}
  `,
  {
    type: sequelize.QueryTypes.DELETE,
    transaction: t
  });
  return
}

async function createWaifu(userId, waifuId, chatId, t) {
  await WaifuLists.create({ user_id: userId, waifu_id: waifuId, chat_id: chatId, quantity: 1 }, { transaction: t });
  return;
}

async function reasingPos(allWaifus) {
  let newPositionAllWaifus = [] ;

  const length = allWaifus.length;
  for (let index = 0; index < length; index++) {
    await newPositionAllWaifus.push({ id: allWaifus[index].id, position: index + 1 })
  }

  return newPositionAllWaifus;
}

module.exports = router;