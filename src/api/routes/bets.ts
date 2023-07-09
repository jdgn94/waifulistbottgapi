import { Router, Request, Response } from "express";
import { QueryTypes } from "sequelize";

import db from "../../db/models";

const router = Router();
const sequelize = db.sequelize;
const Chats = db.ChatModel;
const Actives = db.ActiveModel;
const Bets = db.BetModel;

router.get("/", async (req: Request, res: Response) => {
  console.log("-------------------------------");
  console.log(db);
  console.log("-------------------------------");
  const { chat_id } = req.query;
  console.log(chat_id);

  try {
    const query = `SELECT
        u.nickname user_nickname,
        IF(f.nickname = '', f.name, CONCAT(f.name, ' (', f.nickname, ')')) franchise_name,
        b.quantity points
      FROM
        bets b
        INNER JOIN user_infos ui ON ui.id = b.user_info_id
        INNER JOIN users u ON u.id = ui.user_id
        INNER JOIN franchises f ON b.franchise_id = f.id
        INNER JOIN chats c ON c.id = ui.chat_id
      WHERE
        b.active = true AND
        c.chat_id_tg = ${chat_id}`;

    const bets: any = await sequelize.query(query, { type: QueryTypes.SELECT });

    const message = await Promise.all(
      bets.map(
        (bet: any) =>
          `@${bet.user_nickname} aposto por ${bet.franchise_name} un total de ${bet.points} punto(s).`
      )
    );

    return res.status(200).json({ message });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

router.post("/create", async (req: Request, res: Response) => {
  const { chatId, userId, franchise, quantity } = req.body;

  const t = await sequelize.transaction();
  const typeSelect = { type: QueryTypes.SELECT };
  try {
    let query = `SELECT
        ui.*
      FROM
        user_infos ui
        INNER JOIN users u ON u.id = ui.user_id
        INNER JOIN chats c ON c.id = ui.chat_id
      WHERE
        u.user_id_tg = ${userId} AND
        c.chat_id_tg = ${chatId}
      LIMIT 1`;

    const profiles = await sequelize.query(query, typeSelect);
    const profile: any = profiles[0];
    // console.log(profile);

    if (profile.points < quantity)
      throw new Error(
        "No hay los pustos necesarios para realizar esta apuesta"
      );

    query = `SELECT
        f.id,
        IF(f.nickname = '', f.name, CONCAT(f.name, ' (', f.nickname, ')')) name
      FROM
        franchises f
        INNER JOIN waifus w ON f.id = w.franchise_id
      GROUP BY f.id
      ORDER BY f.name
      LIMIT 1 OFFSET ${franchise - 1}`;

    const franchises = await sequelize.query(query, typeSelect);
    const franchiseData: any = franchises[0];

    if (!franchiseData)
      throw new Error(
        "No se encontro la franquicia especificada a la cual quieres apostar"
      );

    query = `SELECT
          *
        FROM
          actives
        WHERE chat_id = ${profile.chat_id}
        LIMIT 1`;

    const actives = await sequelize.query(query, typeSelect);
    const active: any = actives[0];

    const activeBet = !active;
    console.log("activar apuesta?", activeBet);

    await Bets.create(
      {
        user_info_id: profile.id,
        franchise_id: franchiseData.id,
        active: activeBet,
        quantity,
      },
      { transaction: t }
    );

    await sequelize.query(
      `UPDATE
        user_infos
      SET
        points = points - ${quantity},
        total_bets = total_bets + 1,
        total_bets_points = total_bets_points + ${quantity}
      WHERE id = ${profile.id}`,
      {
        type: QueryTypes.UPDATE,
        transaction: t,
      }
    );

    await t.commit();
    return res
      .status(200)
      .json({
        message: `Has apostado por la franquicia ${
          franchiseData.name
        } un total de ${quantity} punto(s), si ganas obtendras ${
          quantity * 10
        } puntos.`,
      });
  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(400).json({ message: error });
  }
});

export default router;
