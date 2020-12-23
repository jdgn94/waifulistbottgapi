const Franchise = require('../models').franchise;
const db = require('../models');
const express = require('express');
const { route } = require('./waifus');

const sequelize = db.sequelize;
const router = express.Router();

router.get('/', async (req, res) => {
  let { name, page, id } = req.query;
  if (!name) name = '';
  if (!page) page = 1;
  try {
    const franchises = await sequelize.query(`
      SELECT
        id,
        name,
        nickname
      FROM
        franchises f
      WHERE
        ${ id > 0 ? 'id = ' + id + ' AND' : '' }
        LOWER(f.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${name.toLowerCase()}%'
      LIMIT 20 OFFSET ${(page - 1) * 20}
    `, { type: sequelize.QueryTypes.SELECT });

    const totalItems = await sequelize.query(`
      SELECT
        COUNT(*) total_items
      FROM
        franchises f
      WHERE
        ${ id > 0 ? 'id = ' + id + ' AND' : '' }
        (LOWER(f.name) LIKE '%${name.toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${name.toLowerCase()}%')
    `, { type: sequelize.QueryTypes.SELECT });

    const totalPages = Math.ceil(totalItems[0].total_items / 20);
    return res.status(200).send({franchises, totalPages});
  } catch (error) {
    return res.status(200).send(error);
  }
});

router.post('/create', async (req, res) => {
  const { name, nickname } = req.body;
  try {
    await Franchise.create({ name, nickname });
    return res.status(200).send('created');
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const franchise = await Franchise.findOne({ where: { id }});
    return res.status(200).send(franchise);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.put('/:id', async (req, res) => {
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