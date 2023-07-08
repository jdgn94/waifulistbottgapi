// const WaifuTypes = require('../db/models').waifu_type;
// const db = require('../db/models');
// const express = require('express');
// const router = express.Router();
// const sequelize = db.sequelize;
import { Router, Request, Response } from 'express';
import { QueryTypes, Op } from 'sequelize'

import db from '../db/models';

const router = Router();
const sequelize = db.sequelize;
const WaifuTypes = db.WaifuTypeModel;
const Waifus = db.WaifuModel;

router.get('/', async (req: Request, res: Response) => {
  const { name = '', page = 1 } = req.query;
  try {
    const types = await WaifuTypes.findAll({
      attributes: ['id', 'name'],
      where: { name: { [Op.like]: `%${String(name).toLowerCase()}%` } },
      limit: 20,
      offset: (Number(page) - 1) * 20, order: [['name', 'ASC']]
    });

    const totalItems = await WaifuTypes.count({
      where: { name: { [Op.like]: `%${String(name).toLowerCase()}%` } }
    });

    const totalPages = Math.ceil(totalItems / 20);
    return res.status(200).send({ types, totalPages });
  } catch (error) {
    console.error(error)
    return res.status(500).send(error)
  }
});

router.post('/create', async (req: Request, res: Response) => {
  const { name = '' } = req.body;
  try {
    if (!name) throw "Debe introducir un nombre para poder crear";
    await WaifuTypes.create({ name });
    return res.status(200).send('created');
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const type = await WaifuTypes.findOne({ where: { id } });
    return res.status(200).send(type);
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    await WaifuTypes.update({ name }, { where: { id } });

    return res.status(200).send('updated');
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
});

export default router;