import { Context } from "telegraf";

import { InputMedia } from "telegraf/typings/core/types/typegram";
import { MediaGroup } from "telegraf/typings/telegram-types";

import chatsUtils from "../../db/utils/chats.utils";
import waifusUtils from "../../db/utils/waifus.utils";
import activesUtils from "../../db/utils/actives.utils";

import i18n from "../../config/i18n";

import bot from "../../bot/";
import { Transaction } from "sequelize";

const getLanguage = async (ctx: Context) => {
  try {
    const chatId = ctx.message?.chat.id;

    if (chatId) {
      const chat = await chatsUtils.findByIdTg(chatId, null);
      return chat?.language ?? "en";
    }
    return;
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const addMessageCount = async (ctx: Context) => {
  try {
    if (!chatIsGroup(ctx)) return;
    if (await _waifuActiveInChat(ctx)) return;
    return await addCountToChat(ctx);
  } catch (error) {
    global.logger.error(error);
    throw error;
  }
};

const chatIsGroup = (ctx: Context) => {
  return ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
};

const addCountToChat = async (ctx: Context) => {
  try {
    const send = await chatsUtils.addCounter(ctx.chat!.id, null);

    if (send) {
      logger.debug(
        "Tengo que enviar la waifu, debo preparar el nuevo algoritmo"
      );
      await sendWaifu(ctx, null);
    }
  } catch (error) {
    logger.error(`${error}: File utils; Function addCountToChat`);
  }
};

const commandOnlyOnGroup = async (ctx: Context) => {
  return ctx.reply(i18n.__("commandOnlyOnGroup"));
};

const sendWaifu = async (ctx: Context, t: Transaction | null) => {
  try {
    const chat = await chatsUtils.findByIdTg(ctx.chat!.id, t);
    if (!chat) return;
    const imageType = _getWaifuType();
    const waifuImage = await waifusUtils.getRandomWaifuByType(imageType);
    if (!waifuImage) return;

    await activesUtils.create(chat.id, waifuImage.WaifuRarity!.id, t);

    const imageToSend: InputMedia[] = [
      {
        type: "photo",
        media: waifuImage.publicUrl,
        caption: i18n.__("waifuSender"),
      },
    ];

    sendImages(ctx, imageToSend);
  } catch (error) {
    logger.error(`${error}: File utils; Function sendWaifu`);
    throw error;
  }
};

const sendImages = (ctx: Context, images: InputMedia[]) => {
  ctx.sendMediaGroup(images as MediaGroup);
};

const getRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const verifyActives = async () => {
  const activesToDelete = await activesUtils.getPass();
  await _deleteActives(activesToDelete.map((active) => active.id));
};

const sendNewMessageOnChat = async (chatId: number, message: string) => {
  await bot.telegram.sendMessage(chatId, message, { parse_mode: "MarkdownV2" });
};

const _getWaifuType = () => {
  const randomNumber = getRandom(0, 100);

  if (randomNumber % 7 === 0) {
    return 2;
  }

  return 1;
};

const _waifuActiveInChat = async (ctx: Context) => {
  const active = await activesUtils.getWaifuByChatIdOrActiveId(ctx.chat!.id);
  if (active) return true;
  return false;
};

const _deleteActives = async (ids: number[]) => {
  try {
    const totalToDelete = ids.length;

    for (let i = 0; i < totalToDelete; i++) {
      const activeToDelete = await activesUtils.getWaifuByChatIdOrActiveId(
        ids[i]
      );

      if (!activeToDelete) return;
      const waifuName = activeToDelete.WaifuRarity!.Waifu!.name;
      const franchiseName = activeToDelete.WaifuRarity!.Waifu!.Franchise!.name;

      const message = i18n.__("waifuScape", {
        waifuName,
        franchiseName,
      });
      await activesUtils.destroy(ids[i], null);

      await sendNewMessageOnChat(activeToDelete.Chat!.chatIdTg, message);
    }
  } catch (error) {
    logger.error(error);
  }
};

export {
  getLanguage,
  addMessageCount,
  chatIsGroup,
  commandOnlyOnGroup,
  sendWaifu,
  sendImages,
  getRandom,
  verifyActives,
  sendNewMessageOnChat,
};
