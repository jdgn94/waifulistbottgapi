const Franchise = require('../models').franchise;
const db = require('../models');
const express = require('express');
const { route } = require('./waifus');

const sequelize = db.sequelize;
const router = express.Router();

router.get('/search', async (req, res) => {
  let { name, page } = req.query;
  if (!name) name = '';
  if (!page) page = 1;
  try {
    const franchises = await sequelize.query(`
      SELECT
        *
      FROM
        franchises
      WHERE
        LOWER(name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(nickname) LIKE '%${name.toLowerCase()}%'
      LIMIT 20 OFFSET ${(page - 1) * 20}
    `, { type: sequelize.QueryTypes.SELECT });

    return res.status(200).send(franchises);
  } catch (error) {
    return res.status(200).send(error);
  }
});

router.post('/create', async (req, res) => {
  console.log(req.body);
  const { name, nickname } = req.body;
  try {
    await Franchise.create({ name, nickname });
    return res.status(200).send('created');
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get('/:id', async (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  try {
    const franchise = await Franchise.findOne({ where: { id }});
    console.log(franchise);
    return res.status(200).send(franchise);
  } catch (error) {
    console.log(error)
    return res.status(500).send(error);
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, nickname } = req.body;
  try {
    await sequelize.query(`
      UPDATE franchises
      SET name = '${name}', nickname = '${nickname}'
      WHERE id = ${id}
    `, { type: sequelize.QueryTypes.UPDATE });
    return res.status(200).send('updated');
  } catch (error) {
    return res.status(200).send(error);
  }
});

module.exports =  router;