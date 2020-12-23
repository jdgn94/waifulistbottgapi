const express = require('express');
const { sequelize } = require('../models');
const SpecialImage = require('../models').special_image;
const SpecialImageRelation = require('../models').special_image_relation;
const fs = require('fs-extra');
const cloudinary = require('cloudinary');

const router = express.Router();

router.get('/', async (req, res) => {
  let { name, page } = req.params;
  if (!name) name = '';
  if (!page) page = 1;

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
    LIMIT 20 OFFSET ${ 20 * (page - 1) }
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
    GROUP BY si.id
  `, { type: sequelize.QueryTypes.SELECT });

  const totalPage = Math.ceil(specials[0].total / 20);
  return res.status(200).send({ specials: specialsList, totalPage });
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
      image_url: defaultImage. secure_url
    }, { transaction: t });
    
    let insert = [];
    await waifuIds.forEach(async id => await insert.push({ special_image_id: special.id, waifu_id: id}));
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
      const defaultImage = await uploadPhoto(image[0].path);
      await SpecialImage.update(
        { 
          public_id: defaultImage.public_id,
          image_url: defaultImage. secure_url
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

router.post('/addSpecial', async (req, res) =>  {});

async function uploadPhoto(path) {
  const result = await cloudinary.v2.uploader.upload(
    path,
    { folder: "Waifu List Bot Special Telegram" }
  );

  await fs.unlink(path);
  return result;
}

module.exports = router;