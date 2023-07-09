import { Telegraf } from "telegraf";

import commands from "./commands/";
import i18n from "../config/i18n";

import { getLanguage, addMessageCount } from "./utils/utils";

const bot = new Telegraf(process.env.TOKEN_TG!);

// middleware
bot.use(async (ctx, next) => {
  logger.info(`new message on bot from: ${ctx.message?.from.username}`);
  console.time(`Processing update ${ctx.update.update_id}`);
  const language = await getLanguage(ctx);
  i18n.setLocale(language ?? "en");

  await addMessageCount(ctx);
  await next();
  console.timeEnd(`Processing update ${ctx.update.update_id}`);
});

// init bot
bot.command(["start", "inicio", "iniciar"], commands.start);

// main menu

// test commands
bot.command("span", commands.span);

// commands
bot.command(["protecc", "protect", "proteger", "protección"], commands.protect);

// on
bot.on("message", async (ctx) => {
  console.log(ctx.message);
  // if (await utils.verifyGroup(ctx)) await utils.addCountInChat(ctx);
  return;
});

export default bot;
