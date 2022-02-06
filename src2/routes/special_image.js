const express = require('express');
const { sequelize } = require('../db/models');
const SpecialImage = require('../db/models').special_image;
const SpecialImageRelation = require('../db/models').special_image_relation;
const WaifuList = require('../db/models').waifu_list;
const UserSpecialList = require('../db/models').user_special_list;
const User = require('../db/models').user;
const Chat = require('../db/models').chat;
const fs = require('fs-extra');
const cloudinary = require('cloudinary');

const router = express.Router();

router.get('/', async (req, res) => {
  const { name = '', page = 1 } = req.query;
  console.log(name, page);

  const specialsList = await sequelize.query(`
    SELECT
      si.id,
      si.image_url,
      IF(f.nickname = '', f.name, CONCAT(f.name, ' - ', f.nickname)) franchise,
      COUNT(sir.id) waifus_quantity
    FROM 
      special_images si 
      INNER JOIN special_image_relations sir ON si.id = sir.special_image_id
      INNER JOIN waifus w ON w.id = sir.waifu_id
      INNER JOIN franchises f ON si.franchise_id = f.id
    WHERE
      f.name LIKE "%${name}%" OR
      f.nickname LIKE "%${name}%"
    GROUP BY si.id
    LIMIT 20 OFFSET ${20 * (page - 1)}
  `, { type: sequelize.QueryTypes.SELECT });

  const specials = await sequelize.query(`
    SELECT
      COUNT(si.id) total
    FROM 
      special_images si
      INNER JOIN franchises f ON si.franchise_id = f.id
    WHERE
      f.name LIKE "%${name}%" OR
      f.nickname LIKE "%${name}%"
  `, { type: sequelize.QueryTypes.SELECT });

  const totalPage = Math.ceil(specials[0].total / 20);
  return res.status(200).send({ specials: specialsList, totalPage });
});

router.get('/list', async (req, res) => {
  const { chatId, userId, page = 1 } = req.query;

  try {
    const user = await User.findOne({ where: { user_id_tg: userId } });
    const chat = await Chat.findOne({ where: { chat_id_tg: chatId } });
    console.log(user, chat);

    const list = await sequelize.query(`
      SELECT 
        si.id,
        si.image_url, 
        si.public_id,
        IF(f.nickname = '', f.name, CONCAT(f.name, ' (', f.nickname, ')')) franchise
      FROM 
        user_special_lists usl 
        INNER JOIN special_images si ON si.id = usl.special_images_id 
        INNER JOIN franchises f ON f.id = si.franchise_id
      WHERE 
        usl.user_id = ${user.id} AND
        usl.chat_id = ${chat.id}
      LIMIT 10 OFFSET ${(page - 1) * 10}
    `, { type: sequelize.QueryTypes.SELECT });

    const listId = await Promise.all(await list.map(item => item.id));

    const waifus = await sequelize.query(`
      SELECT
        sir.special_image_id id,
        IF(w.nickname = '', w.name, CONCAT(w.name, ' (', w.nickname, ')')) name
      FROM 
        special_image_relations sir 
        INNER JOIN waifus w ON sir.waifu_id = w.id
      WHERE 
        sir.special_image_id IN (${listId.join(',')})
      ORDER BY
        w.name
    `, { type: sequelize.QueryTypes.SELECT });

    const specialList = await Promise.all(
      await list.map(async item => {
        const waifusTemp = await waifus.filter(waifu => waifu.id == item.id);
        const waifusTempName = await Promise.all(waifusTemp.map(waifu => waifu.name));
        item.name = waifusTempName.join(', ');
        return item;
      })
    );

    const total = await sequelize.query(`
      SELECT 
        COUNT(*) size
      FROM 
        user_special_lists
      WHERE 
        user_id = ${user.id} AND
        chat_id = ${chat.id}
    `, { type: sequelize.QueryTypes.SELECT });

    if (list.length === 0) return res.status(205).send();

    const data = {
      list: specialList,
      actualPage: page,
      totalPages: Math.ceil(total[0].size / 10)
    };
    return res.status(200).json(data)
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const special = await SpecialImage.findOne({ where: { id } });
  const waifus = await SpecialImageRelation.findAll({ where: { special_image_id: id } });

  return res.status(200).send({ special, waifus });
});

router.post('/create', async (req, res) => {
  let { waifuIds, franchiseId } = req.body;
  const { image } = req.files;
  waifuIds = waifuIds.split(',');

  const t = await sequelize.transaction();
  try {
    const defaultImage = await uploadPhoto(image[0].path);
    const special = await SpecialImage.create({
      franchise_id: franchiseId,
      public_id: defaultImage.public_id,
      image_url: defaultImage.secure_url
    }, { transaction: t });

    let insert = [];
    await waifuIds.forEach(async id => await insert.push({ special_image_id: special.id, waifu_id: id }));
    await SpecialImageRelation.bulkCreate(insert, { transaction: t });

    await t.commit();
    return res.status(201).send('success');
  } catch (error) {
    await t.rollback()
    console.log(error);
    return res.status(500).send(error);
  }
});

router.post('/edit', async (req, res) => {
  const { waifuIds, franchiseId, specialId } = req.body;
  const { image } = req.files;
  const t = await sequelize.transaction();
  try {
    const specialData = await SpecialImage.findOne({ where: { id: specialId } });
    const waifusSpecialDefault = await SpecialImageRelation.findAll({ where: { special_image_id: specialId } });
    console.log(specialData);
    console.log(waifusSpecialDefault);
    if (franchiseId !== specialData.franchise_id) {
      await SpecialImage.update({ franchise_id: franchiseId }, { where: { id: specialId } }, { transaction: t });
    }

    let waifusSpecialDefaultIds = []
    let waifusDeleted = [];
    for (let index = 0; index < waifusSpecialDefault.length; index++) {
      await waifusSpecialDefaultIds.push(waifusSpecialDefault[index].id)
      const position = await waifuIds.indexOf(waifusSpecialDefault[index].id);
      if (position === -1) await waifusDeleted.push(waifusSpecialDefault[index].id);
    }

    let newWaifus = [];
    for (let index = 0; index < waifuIds.length; index++) {
      const exist = await waifusSpecialDefaultIds.indexOf(waifuIds[index]);
      if (exist === -1) await newWaifus.push(waifuIds[index]);
    }

    if (waifusDeleted.length > 0) {
      SpecialImageRelation.destroy({ where: { id: waifusDeleted } }, { transaction: t });
    }

    if (newWaifus.length > 0) {
      let insert = [];
      await newWaifus.forEach(async id => await insert.push({ special_image_id: specialId, waifu_id: id }));
      await SpecialImageRelation.bulkCreate(insert, { transaction: t });
    }

    if (image) {
      const newImage = await uploadPhoto(image[0].path);
      await cloudinary.v2.uploader.destroy(specialData.public_id);
      await SpecialImage.update(
        {
          public_id: newImage.public_id,
          image_url: newImage.secure_url
        },
        { where: { id: specialId } },
        { transaction: t }
      );
    }

    await t.commit();
    return res.status(201).send('');
  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(500).send(error);
  }
});

router.post('/add_special', async (req, res) => {
  const { userId, chatId, waifuId } = req.body;
  const t = await sequelize.transaction();
  let addList = false;

  try {
    const waifuInSpecial = await SpecialImageRelation.findAll({ where: { waifu_id: waifuId } });
    if (!waifuInSpecial) return res.status(205).send();

    console.log("datos de la waifu en el especial", waifuInSpecial);

    for (let i = 0; i < waifuInSpecial.length; i++) {
      const specialId = waifuInSpecial[i].special_image_id;
      const specialAllWaifus = await SpecialImageRelation.findAll({ where: { special_image_id: specialId } });
      // console.log("estas son las waifus especiales", specialAllWaifus);
      let specialAllWaifusIds = [];
      for (let i = 0; i < specialAllWaifus.length; i++) {
        await specialAllWaifusIds.push(specialAllWaifus[i].waifu_id);
      }
      console.log(specialAllWaifusIds);

      const waifusUser = await WaifuList.findAll({ where: { waifu_id: specialAllWaifusIds, user_id: userId, chat_id: chatId } });
      console.log(waifusUser);

      // throw 'hola vale'
      if (specialAllWaifusIds.length === waifusUser.length) {
        await UserSpecialList.create({ user_id: userId, chat_id: chatId, special_images_id: specialId }, { transaction: t });
        addList = true;
      }
    }

    await t.commit();
    if (addList) return res.status(200).send('se ha agregado una nueva imagen a tu listado especial');
    return res.status(205).send();
  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(500).send(error);
  }
});

async function uploadPhoto(path) {
  const result = await cloudinary.v2.uploader.upload(
    path,
    { folder: "Waifu List Bot Special Telegram" }
  );

  await fs.unlink(path);
  return result;
}

module.exports = router;