const Waifu = require('../models').waifu;
const db = require('../models');
const fs = require('fs-extra');
const cloudinary = require('cloudinary');
const express = require('express');

const router = express.Router();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

router.get('/', async (req, res) => {
  const waifus = await db.sequelize.query(`
    SELECT
      *
    FROM
      view_waifus
  `,
  { type: db.sequelize.QueryTypes.SELECT });
  res.status(200).send(waifus);
})

router.post('/create', async (req, res) => {
  console.log("Estoy creando");
  const { name, nickname, age, waifu_type_id, servant, franchise_id } = req.body;

  const result = await cloudinary.v2.uploader.upload(
    req.file.path,
    { folder: "Waifu List Bot Telegram" }
  );

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
  await fs.unlink(req.file.path);
  return res.status(200).send('creando')
})

module.exports = router;