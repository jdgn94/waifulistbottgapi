const Waifu = require('../models').waifu;
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
  let { name, page } = req.query;
  if (!name) name = ''
  if (!page) page = 1;
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
        LOWER(w.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.nickname) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.age) LIKE '%${name.toLowerCase()}%' OR
        LOWER(wt.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${name.toLowerCase()}%'
      LIMIT 20 OFFSET ${(page - 1) * 20}
    `,
    { type: sequelize.QueryTypes.SELECT });
    
    const totalItems = await sequelize.query(`
      SELECT COUNT(*) AS total_items
      FROM 
        waifus AS w
        INNER JOIN waifu_types AS wt ON wt.id = w.waifu_type_id 
        INNER JOIN franchises AS f ON f.id = w.franchise_id 
      WHERE
        LOWER(w.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.nickname) LIKE '%${name.toLowerCase()}%' OR
        LOWER(w.age) LIKE '%${name.toLowerCase()}%' OR
        LOWER(wt.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${name.toLowerCase()}%'
    `, { type: sequelize.QueryTypes.SELECT });

    const totalPages = Math.ceil(totalItems[0].total_items / 20);
    return res.status(200).json({ waifus, totalPages });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error)
  }
});

router.post('/create', async (req, res) => {
  console.log("Estoy creando");
  const { name, nickname, age, waifu_type_id, servant, franchise_id } = req.body;
  console.log(req.body);
  console.log(req.file);

  const result = await uploadPhoto(req.file.path);
  const waifu = await Waifu.create({
    name,
    nickname,
    age,
    waifu_type_id,
    servant,
    franchise_id,
    public_id: result.public_id,
    image_url: result.secure_url
  });
  console.log(waifu);
  return res.status(200).send('creando')
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
    `,{ type: sequelize.QueryTypes.SELECT });
    
    return res.status(200).send(waifu[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, nickname, age, waifu_type_id, franchise_id } = req.body;
  try {
    const waifu = await Waifu.findOne({ where: { id } });
    let result;

    if (req.file) {
      await cloudinary.v2.uploader.destroy(waifu.public_id);
  
      result = await uploadPhoto(req.file.path);
    } else {
      result = { public_id: waifu.public_id, secure_url: waifu.image_url };
    }

    await sequelize.query(`
      UPDATE waifus
      SET
        name = '${name}',
        nickname = '${nickname}',
        age = ${age},
        public_id = '${result.public_id}',
        image_url = '${result.secure_url}',
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

async function uploadPhoto(path) {
  const result = await cloudinary.v2.uploader.upload(
    path,
    { folder: "Waifu List Bot Telegram" }
  );

  await fs.unlink(path);
  return result;
}

module.exports = router;