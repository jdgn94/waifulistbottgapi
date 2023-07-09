import { Context } from "telegraf";

import db from "../../db/models/";
import chatsUtils from "../../db/utils/chats.utils";

import { sendWaifu } from "../utils/utils";
import i18n from "../../config/i18n";

const start = async (ctx: Context) => {
  const t = await db.transaction();
  try {
    const chat = await chatsUtils.findOrCreate(
      ctx.message!.chat.id,
      ctx.message!.chat.type,
      t
    );
    if (chat[1]) {
      ctx.sendMessage(i18n.__("initGroupNew"));
      sendWaifu(ctx);
    } else {
      ctx.sendMessage(i18n.__("initGroupExist"));
    }

    await t.commit();
  } catch (error) {
    await t.rollback();
    logger.error(`${error}: File group; Function start`);
  }
};

const protect = async (ctx: Context) => {
  // const t = await db.transaction();
  // const regExp = new RegExp(/[\s_.,-]/);

  try {
    const message = ctx.message!;
    if ("text" in message) {
      const { text } = message;
      console.log(text);
    }
  } catch (error) {
    logger.error(`${error}: File group; Function protect`);
  }
};

export default { start, protect };
