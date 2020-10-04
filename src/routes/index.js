const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary');
const fs = require('fs-extra');

const Waifu = require('../models/waifu');
const Franchise = require('../models/franchise');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

router.get('/', async (req, res) => {
  const waifus = await Waifu.find().populate('franchise');
  res.render('index', { waifus });
});

router.get('/add-waifu', (req, res) => {
  res.render('addWaifu');
});

router.post('/add-waifu', async (req, res) => {
  console.log(req.body);
  const { name, nickname, franchise } = req.body;

  const result = await cloudinary.v2.uploader.upload(
    req.file.path,
    { folder: "Waifu List Bot Telegram" }
  );

  const waifu = new Waifu({
    name,
    nickname,
    franchise: franchise[1],
    imageId: result.public_id,
    imageURL: result.secure_url
  })
  await waifu.save();

  await fs.unlink(req.file.path)

  res.status(200).send();
});

router.get('/add-franchise', (req, res) => {
  res.render('addFranchise');
})

router.get('/search-franchise', async (req, res) => {
  const { text } = req.query;
  const search = new RegExp(`.*${text}.*`);
  // console.log(search);
  const franchises = await Franchise.find({ 'name': search });
  console.log(franchises);
  res.json(franchises);
})

router.post('/add-franchise', (req, res) => {
  console.log(req.body);

  const franchise = new Franchise({
    name: req.body.name,
    nickname: req.body.nickname
  }).save();
  res.send('reseivend')
})



module.exports = router;