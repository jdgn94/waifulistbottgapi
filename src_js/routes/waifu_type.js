const WaifuTypes = require('../models').waifu_type;
const db = require('../models');
const express = require('express');
const router = express.Router();
const sequelize = db.sequelize;

router.get('/', async (req, res) => {
  let { name, page } = req.query;
  if (!name) name = '';
  if (!page) page = 1;
  try {
    const types = await sequelize.query(`
      SELECT
        id,
        name
      FROM
        waifu_types
      WHERE
        LOWER(name) LIKE '%${name.toLowerCase()}%'
      LIMIT 20 OFFSET ${(page - 1) * 20}
    `, { type: db.sequelize.QueryTypes.SELECT });

    const totalItems = await sequelize.query(`
      SELECT
        COUNT(*) total_items
      FROM
        waifu_types
      WHERE
        LOWER(name) LIKE '%${name.toLowerCase()}%'
    `, { type: db.sequelize.QueryTypes.SELECT });

    const totalPages = Math.ceil(totalItems[0].total_items / 20);
    return res.status(200).send({ types, totalPages });
  } catch (error) {
    console.error(error)
    return res.status(500).send(error)
  }
});

router.post('/create', async (req, res) => {
  const { name } = req.body;
  try {
    await WaifuTypes.create({ name });
    return res.status(200).send('created');
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const type = await WaifuTypes.findOne({ where: { id } });
    return res.status(200).send(type);
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await sequelize.query(`
      UPDATE waifu_types
      SET name = '${name}'
      WHERE id = ${id}
    `, { type: sequelize.QueryTypes.UPDATE })
    return res.status(200).send('updated');
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
});

module.exports = router;