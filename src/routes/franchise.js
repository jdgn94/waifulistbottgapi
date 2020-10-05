const Franchises = require('../models/franchise');
const express = require('express');
const router = express.Router();

router.get('/search', async (req, res) => {
  console.log(req.query);
  return res.status(200).send('hola vale')
})