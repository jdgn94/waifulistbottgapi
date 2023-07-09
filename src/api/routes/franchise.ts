import { Router, Request, Response } from "express";
import { QueryTypes } from "sequelize";

import db from "../../db/models";

const sequelize = db.sequelize;
const router = Router();
const Franchise = db.FranchiseModel;

router.get("/", async (req: Request, res: Response) => {
  const { name = "", page = 1, id = 0 } = req.query;
  try {
    const franchises = await sequelize.query(
      `
      SELECT
        id,
        name,
        nickname
      FROM
        franchises f
      WHERE
        ${id > 0 ? "id = " + id + " AND" : ""}
        (LOWER(f.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${String(name).toLowerCase()}%')
      LIMIT 20 OFFSET ${(Number(page) - 1) * 20}
    `,
      { type: QueryTypes.SELECT }
    );

    const totalItems: any = await sequelize.query(
      `
      SELECT
        COUNT(*) total_items
      FROM
        franchises f
      WHERE
        ${id > 0 ? "id = " + id + " AND" : ""}
        (LOWER(f.name) LIKE '%${String(name).toLowerCase()}%' OR
        LOWER(f.nickname) LIKE '%${String(name).toLowerCase()}%')
    `,
      { type: QueryTypes.SELECT }
    );

    const totalPages = Math.ceil(totalItems[0].total_items / 20);
    return res.status(200).send({ franchises, totalPages });
  } catch (error) {
    return res.status(200).send(error);
  }
});

router.get("/list", async (req: Request, res: Response) => {
  const { franchise_number = 0, page = 1 } = req.query;

  try {
    if (franchise_number == 0) {
      const franchiseList = await sequelize.query(
        `
        SELECT
          f.id,
          IF(f.nickname = '', f.name, CONCAT(f.name, ' (', f.nickname, ')')) name,
          COUNT(w.id) quantity
        FROM
          franchises f
          INNER JOIN waifus w ON f.id = w.franchise_id
        GROUP BY f.id
        ORDER BY f.name
        LIMIT 20 OFFSET ${(Number(page) - 1) * 20}
      `,
        { type: QueryTypes.SELECT }
      );

      const size: any = await sequelize.query(
        `
        SELECT
          COUNT(DISTINCT f.id) total
        FROM
          franchises f
          INNER JOIN waifus w ON w.franchise_id = f.id
      `,
        { type: QueryTypes.SELECT }
      );

      const data = {
        list: franchiseList,
        page,
        totalPage: Math.ceil(size[0].total / 20),
      };

      return res.status(200).json(data);
    } else {
      const franchise: any = await sequelize.query(
        `
        SELECT
          f.id,
          IF(f.nickname = '', f.name, CONCAT(f.name, ' (', f.nickname, ')')) name,
          COUNT(w.id) quantity
        FROM
          franchises f
          INNER JOIN waifus w ON f.id = w.franchise_id
        GROUP BY f.id
        ORDER BY f.name
        LIMIT 1 OFFSET ${Number(franchise_number) - 1}
      `,
        { type: QueryTypes.SELECT }
      );

      const waifus = await sequelize.query(
        `
        SELECT
          IF(nickname = '', name, CONCAT(name, ' (', nickname, ')')) name
        FROM waifus
        WHERE franchise_id = ${franchise[0].id}
        ORDER BY name
        LIMIT 20 OFFSET ${(Number(page) - 1) * 20}
      `,
        { type: QueryTypes.SELECT }
      );

      const size: any = await sequelize.query(
        `
        SELECT
          COUNT(DISTINCT id) total
        FROM waifus
        WHERE franchise_id = ${franchise[0].id}
      `,
        { type: QueryTypes.SELECT }
      );

      const data = {
        franchise: franchise[0],
        list: waifus,
        page,
        totalPage: Math.ceil(size[0].total / 20),
      };

      return res.status(200).json(data);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

router.post("/create", async (req: Request, res: Response) => {
  const { name, nickname } = req.body;
  try {
    await Franchise.create({ name, nickname });
    return res.status(200).send("created");
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const franchise = await Franchise.findOne({ where: { id } });
    return res.status(200).send(franchise);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, nickname } = req.body;
  try {
    await sequelize.query(
      `
      UPDATE franchises
      SET name = '${name}', nickname = '${nickname}'
      WHERE id = ${id}
    `,
      { type: QueryTypes.UPDATE }
    );
    return res.status(200).send("updated");
  } catch (error) {
    return res.status(200).send(error);
  }
});

export default router;
