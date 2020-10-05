const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');
const fs = require('fs-extra');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

router.get('/', async (req, res) => {
  return res.status(200).send('mostrar todas las waifus');
});

router.post('/add-waifu', async (req, res) => {
  console.log(req.body);
  const { name, nickname, franchise } = req.body;

  const result = await cloudinary.v2.uploader.upload(
    req.file.path,
    { folder: "Waifu List Bot Telegram" }
  );

  // const waifu = new Waifu({
  //   name,
  //   nickname,
  //   franchise: franchise[1],
  //   imageId: result.public_id,
  //   imageURL: result.secure_url
  // })

  return res.status(200).send('agregar una waifu');
});

router.get('/search-franchise', async (req, res) => {
  const { text } = req.query;
  
  return res.status(200).send('buscar una franquicia');
})

router.post('/add-franchise', (req, res) => {
  return res.status(200).send('agregar una franquicia');
})



module.exports = router;