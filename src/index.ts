import dotenv from "dotenv";
if (process.env.NODE_ENV !== "producction") dotenv.config();

import api from "./api/";
import db, { insertMigrations } from "./api/db/models";

const main = async () => {
  try {
    logger.info("connecting to db...");
    await db.authenticate();
    await db.sync({ force: false });

    await insertMigrations();

    const port = await api.get("port");
    api.listen(port);

    logger.info(`server on port: ${port}`);
  } catch (err) {
    console.error(err);
    logger.error(err);
  }
};

main();
