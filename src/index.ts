import dotenv from "dotenv";
if (process.env.NODE_ENV !== "producction") dotenv.config();

import api from "./api/";
import bot from "./bot/";
import db /* , { insertMigrations } */ from "./db/models";
import { verifyActives } from "./bot/utils/utils";

const main = async () => {
  try {
    logger.info("connecting to db...");
    await db.authenticate();
    await db.sync({ force: false });

    // await insertMigrations();

    const port = await api.get("port");
    api.listen(port);

    logger.info(`server on port: ${port}`);
    bot.launch();
    logger.info(`bot launched`);

    setInterval(verifyActives, 10000);
  } catch (err) {
    console.error(err);
    logger.error(err);
  }
};

main();
