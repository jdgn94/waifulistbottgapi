const express = require('express');
const db = require('../models');
const Trades = require('../models').trade;
const WaifuLists = require('../models').waifu_list;

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
        c.chat_id_tg = '${chatTgId}'
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
        c.chat_id_tg = '${chatTgId}'
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
        u.user_id_tg = ${userId} AND c.chat_id_tg = ${chatId}
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
        u.user_id_tg = ${userId} AND c.chat_id_tg = ${chatId} AND w.age = 0
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
        u.user_id_tg = ${userId} AND c.chat_id_tg = ${chatId} AND w.age > 0 AND w.age < 18
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
        u.user_id_tg = ${userId} AND c.chat_id_tg = ${chatId} AND w.age > 17
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
  console.log("llegue a la llamada de los favoritos")
  const { chatId, userId } = req.query;
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
        wfl.position
      FROM
        waifu_favorite_lists wfl
        INNER JOIN waifu_lists wl ON wl.id = wfl.waifu_list_id
        INNER JOIN waifus w ON w.id = wl.waifu_id
        INNER JOIN franchises f ON f.id = w.franchise_id
        INNER JOIN chats c ON c.id = wl.chat_id
        INNER JOIN users u ON u.id = wl.user_id
      WHERE
        c.chat_id_tg = '${chatId}' AND u.user_id_tg = '${userId}'
      ORDER BY
        wfl.position ASC
    `, { type: sequelize.QueryTypes.SELECT });

    console.log(waifus);
    if (waifus.length > 0) return res.status(200).send({ waifus });
    return res.status(201).send({ message: 'Parece que todavia no has agregado ninguna waifu a esta lista, lo puedes hacer por el comando /addfavorite <numero en tu lista> <posición>' });
  } catch (error) {
    console.error(error)
    return res.status(500).send();
  }
});

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
        wl.chat_id = ${chat[0].id}
      ORDER BY f.name ASC, w.name ASC
      LIMIT 1 OFFSET ${myWaifuNumber - 1};
    `, { type: sequelize.QueryTypes.SELECT });
  
    const otherWaifu = await sequelize.query(`
      ${query}
        wl.user_id = ${otherUser.id} AND 
        wl.chat_id = ${chat[0].id}
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
  console.log(req.body);
  const { answer, messageId, userTgId } = req.body;
  // return res.send();
  try {
    const trade = await sequelize.query(`
      SELECT
        t.id trade_id,
        ue.id user_emiter_id,
        ue.user_id_tg user_id_tg_emiter,
        wle.id list_emiter_id,
        wle.waifu_id waifu_emiter_id,
        ur.id user_receptor_id,
        ur.user_id_tg user_id_tg_receptor,
        wlr.id list_receptor_id,
        wlr.waifu_id waifu_receptor_id,
        wlr.chat_id
      FROM
        trades t
        INNER JOIN waifu_lists wle ON wle.id = t.waifu_emiter_id
        INNER JOIN users ue ON ue.id = wle.user_id
        INNER JOIN waifu_lists wlr ON wlr.id = t.waifu_receptor_id
        INNER JOIN users ur ON ur.id = wlr.user_id
      WHERE
        t.message_id = '${messageId}'
      LIMIT 1
    `, { type: sequelize.QueryTypes.SELECT });

    if (trade[0].user_id_tg_receptor != userTgId.toString()) return res.status(203).send();

    console.log("hacer lo que sigue");
    if (!answer) {
      await sequelize.query(`DELETE FROM trades WHERE id = ${trade[0].trade_id}`, { type: sequelize.QueryTypes.DELETE });
      return res.status(201).send();
    } 

    const waifusEmisor = [];
    const waifusReceptor = [];

    await waifusEmisor.push(await searhcWaifu(trade[0].user_emiter_id, trade[0].waifu_emiter_id));
    await waifusReceptor.push(await searhcWaifu(trade[0].user_receptor_id, trade[0].waifu_receptor_id));
    await waifusEmisor.push(await searhcWaifu(trade[0].user_emiter_id, trade[0].waifu_receptor_id));
    await waifusReceptor.push(await searhcWaifu(trade[0].user_receptor_id, trade[0].waifu_emiter_id));

    const idEmiter = trade[0].user_emiter_id;
    const idReceptor = trade[0].user_receptor_id
    const chatId = trade[0].chatId

    await sequelize.query(`DELETE FROM trades WHERE id = ${trade[0].trade_id}`, { type: sequelize.QueryTypes.DELETE });

    console.log(waifusEmisor, waifusReceptor);
    const favoriteEmisor = await verifyFavorite (waifusEmisor[0].id);
    const favoriteReceptor = await verifyFavorite (waifusReceptor[0].id);
    if (waifusEmisor[1] == null && waifusReceptor[1] == null) { // INFO caso 1
      if ((favoriteEmisor == null && favoriteReceptor == null) || (favoriteEmisor.quantity > 1 && favoriteReceptor == null) || (favoriteEmisor.quantity = null && favoriteReceptor > 1) || (favoriteEmisor.quantity > 1 && favoriteReceptor > 1)) {
        const evaluation = caseProcessor(0, waifusEmisor, waifusReceptor);
        switch (evaluation) {
          case 1: // ambos tiene la waifu en la posicion 1 1 vez
            await reasingWaifu(idEmiter, waifusReceptor[0].id);
            await reasingWaifu(idReceptor, waifusEmisor[0].id);
            break;
          case 2: // ambos tienen mas de 1
            await removeWaifu(waifusReceptor[0].id);
            await removeWaifu(waifusEmisor[0].id);
            await createWaifu(idReceptor, waifusEmisor[0].id, chatId);
            await createWaifu(idEmiter, waifusReceptor[0].id, chatId);
            break;
            case 3: // el emisor tiene 1 y el receptor mas de 1
            await reasingWaifu(idReceptor, waifusEmisor[0].id);
            await removeWaifu(waifusReceptor[0].id);
            await createWaifu(idEmiter, waifusReceptor[0].id, chatId)
            break;
          default: // el emisor tiene mas de 1 y el receptor solo 1
            await reasingWaifu(idEmiter, waifusReceptor[0].id);
            await removeWaifu(waifusEmisor[0].id);
            await createWaifu(idReceptor, waifusEmisor[0].id, chatId)
            break;
        }
        return res.status(200).send({ message: 'El intercambio fue exitoso' });
      } else return res.status(202).send({ message: `No se puede realizar el intercambio debido a que ${favoriteEmisor.name || favoriteReceptor.name} de ${favoriteEmisor.franchise || favoriteEmisor.franchise} esta marcada como favorita` });

    } else if (waifusEmisor[1] != null && waifusReceptor[1] == null) { // INFO caso 2
      if ((favoriteEmisor == null && favoriteReceptor == null) || (favoriteEmisor.quantity > 1 && favoriteReceptor == null) || (favoriteEmisor.quantity = null && favoriteReceptor > 1) || (favoriteEmisor.quantity > 1 && favoriteReceptor > 1)) {

        const evaluation = caseProcessor(0, waifusEmisor, waifusReceptor);
        switch(evaluation) {
          case 1: // ambos tienen uno solo
            await reasingWaifu(idReceptor, waifusEmisor[0].id);
            await deleteWaifu(waifusReceptor[0].id);
            break;
          case 2: // ambos tienes mas de 1
            await removeWaifu(waifusReceptor[0].id);
            await removeWaifu(waifusEmisor[0].id);
            await createWaifu(idReceptor, waifusEmisor[0].id, chatId);
            break;
          case 3: // el emisor tiene 1 y el receptor mas de 1
            await removeWaifu(waifusReceptor[0].id);
            await reasingWaifu(idReceptor, waifusEmisor[0].id);
            break;
          default: // el emisor tiene mas de 1 y el receptor solo 1
            await deleteWaifu(waifusReceptor[0].id);
            await removeWaifu(waifusEmisor[0].id);
            await createWaifu(idReceptor, waifusEmisor[0].id, chatId);
            break;
        }
        await addWaifu(waifusEmisor[1].id);
        return res.status(200).send({ message: 'El intercambio fue exitoso' });
      } else return res.status(202).send({ message: `No se puede realizar el intercambio debido a que ${favoriteEmisor.name || favoriteReceptor.name} de ${favoriteEmisor.franchise || favoriteEmisor.franchise} esta marcada como favorita` });

    } else if (waifusEmisor[1] == null && waifusReceptor[1] != null) { // INFO caso 3

      if ((favoriteEmisor == null && favoriteReceptor == null) || (favoriteEmisor.quantity > 1 && favoriteReceptor == null) || (favoriteEmisor.quantity = null && favoriteReceptor > 1) || (favoriteEmisor.quantity > 1 && favoriteReceptor > 1)) {
        const evaluation = caseProcessor(0, waifusEmisor, waifusReceptor);
        switch(evaluation) { 
          case 1: // ambos tiene la waifu en la posicion 1 1 vez
            await deleteWaifu(waifusEmisor[0].id);
            await reasingWaifu(idEmiter, waifusReceptor[0].id);
            break;
          case 2: // ambos tienes mas de 1
            await removeWaifu(waifusEmisor[0].id);
            await removeWaifu(waifusReceptor[0].id);
            await createWaifu(idEmiter, waifusReceptor[0].id, chatId);
            break;
          case 3: // el emisor tiene 1 y el receptor mas de 1
            await removeWaifu(waifusEmisor[0].id);
            await reasingWaifu(idEmiter, waifusReceptor[0].id);
            break;
          default: // el emisor tiene mas de 1 y el receptor solo 1
            await deleteWaifu(waifusEmisor[0].id);
            await removeWaifu(waifusReceptor[0].id);
            await createWaifu(idEmiter, waifusReceptor[0].id, chatId);
            break;
        }
        await addWaifu(waifusReceptor[1].id);
        return res.status(200).send({ message: 'El intercambio fue exitoso' });
      } else res.status(202).send({ message: `No se puede realizar el intercambio debido a que ${favoriteEmisor.name || favoriteReceptor.name} de ${favoriteEmisor.franchise || favoriteEmisor.franchise} esta marcada como favorita` });
    } else { // INFO caso 4 waifusEmisor[1] != null && waifusReceptor[1] != null

      if ((favoriteEmisor == null && favoriteReceptor == null) || (favoriteEmisor.quantity > 1 && favoriteReceptor == null) || (favoriteEmisor.quantity = null && favoriteReceptor > 1) || (favoriteEmisor.quantity > 1 && favoriteReceptor > 1)) {
        const evaluation = caseProcessor(0, waifusEmisor, waifusReceptor);
        switch(evaluation) {
          case 1: // ambos tiene la waifu en la posicion 1 1 vez
            await deleteWaifu(waifusReceptor[0].id);
            await deleteWaifu(waifusEmisor[0].id);
            break;
          case 2: // ambos tienes mas de 1
            await removeWaifu(waifusReceptor[0].id);
            await removeWaifu(waifusEmisor[0].id);
            break;
          case 3: // el emisor tiene 1 y el receptor mas de 1
            await deleteWaifu(waifusEmisor[0].id);
            await removeWaifu(waifusReceptor[0].id);
            break
          default: // el emisor tiene mas de 1 y el receptor solo 1
            await deleteWaifu(waifusReceptor[0].id);
            await removeWaifu(waifusEmisor[0].id);
            break;
        }
        await addWaifu(waifusReceptor[1].id);
        await addWaifu(waifusEmisor[1].id);
        return res.status(200).send({ message: 'El intercambio fue exitoso' });
      } else res.status(202).send({ message: `No se puede realizar el intercambio debido a que ${favoriteEmisor.name || favoriteReceptor.name} de ${favoriteEmisor.franchise || favoriteEmisor.franchise} esta marcada como favorita` });
    }
    return res.status(200).send({ message: 'El intercambio fue exitoso' });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

async function searhcWaifu(userId, waifu_list_id) {
  const waifu = await sequelize.query(`
    SELECT
      wl.id,
      wl.user_id,
      wl.waifu_id,
      wl.quantity,
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
      waifu_id = ${waifu_list_id} AND user_id = ${userId}
    LIMIT 1
  `, { type: sequelize.QueryTypes.SELECT });

  if (waifu.length > 0) return waifu[0];
  else return null;
}

async function verifyFavorite (waifuListId) {
  const favorite = await sequelize.query(`
    SELECT
      wfl.id,
      (CASE
        WHEN w.nickname = "" THEN CONCAT(w.name, ' - (', w.nickname, ')')
        ELSE w.name
      END) name,
      (CASE
        WHEN f.nickname = "" THEN CONCAT(f.name, ' - (', f.nickname, ')')
        ELSE f.name
      END)franchise
    FROM
      waifu_favorite_lists wfl
      INNER JOIN waifu_lists wl ON wfl.waifu_list_id = wl.id
      INNER JOIN waifus w ON w.id = wl.waifu_id
      INNER JOIN franchises f ON f.id = w.franchise_id
    WHERE
      wfl.waifu_list_id = ${waifuListId}
    LIMIT 1
  `, { type: sequelize.QueryTypes.SELECT });
  
  if (favorite.length > 0) return favorite[0];
  return null;
}

async function addWaifu(waifuListId) {
  await sequelize.query(`
    UPDATE waifu_lists
    SET quantity = quantity + 1
    WHERE id = ${waifuListId}
  `, { type: sequelize.QueryTypes.UPDATE });
  return;
}

async function removeWaifu(waifuListId) {
  await sequelize.query(`
    UPDATE waifu_lists
    SET quantity = quantity - 1
    WHERE id = ${waifuListId}
  `, { type: sequelize.QueryTypes.UPDATE });
  return;
}

async function deleteWaifu(waifuListId) {
  await sequelize.query(`
    DELETE FROM waifu_lists WHERE id = ${waifuListId}
  `, { type: sequelize.QueryTypes.DELETE });
  return
}

async function reasingWaifu(userId, waifuListId) {
  await sequelize.query(`
    UPDATE waifu_lists
    SET user_id = ${userId}
    WHERE id = ${waifuListId}
  `, { type: sequelize.QueryTypes.UPDATE });
  return;
}

async function createWaifu(userId, waifuId, chatId) {
  await WaifuLists.create({ user_id: userId, waifu_id: waifuId, chat_id: chatId });
  return;
}

function caseProcessor(position, waifusEmisor, waifusReceptor) {
  let caseProcess = 0;
  if (waifusEmisor[position].quantity == 1 && waifusReceptor[position].quantity == 1) caseProcess = 1;
  else if (waifusEmisor[position].quantity > 1 && waifusReceptor[position].quantity > 1) caseProcess = 2;
  else if (waifusEmisor[position].quantity == 1 && waifusReceptor[position].quantity > 1) caseProcess = 3;
  else if (waifusEmisor[position].quantity > 1 && waifusReceptor[position].quantity == 1) caseProcess = 4;
  return caseProcess;
}

module.exports = router;