import { Context } from "telegraf";

import privateCommands from "./private";
import groupCommands from "./group";

import i18n from "../../config/i18n";
import { chatIsGroup, commandOnlyOnGroup, sendWaifu } from "../utils/utils";

const start = async (ctx: Context) => {
  try {
    if (chatIsGroup(ctx)) {
      await groupCommands.start(ctx);
      return;
    } else if (ctx.chat?.type === "private") {
      await privateCommands.start(ctx);
      return;
    } else {
      logger.error("Message receive from invalid chat type.");
      ctx.sendMessage("Bye.");
    }
  } catch (error) {
    logger.error(error);
    ctx.reply(i18n.__("unexpectedError"));
    throw error;
  }
};

const span = async (ctx: Context) => {
  await sendWaifu(ctx);
};

const protect = async (ctx: Context) => {
  try {
    if (!chatIsGroup(ctx)) {
      commandOnlyOnGroup(ctx);
      return;
    }

    await groupCommands.protect(ctx);
  } catch (error) {
    logger.error(`${error}: File index; Function protect`);
  }
};

export default { start, span, protect };
