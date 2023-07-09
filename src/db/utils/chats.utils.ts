import { Transaction } from "sequelize";

import db from "../../db/models";
import { ChatModel } from "../../db/models/chat.model";

const findOrCreate = async (
  chatId: number,
  chatType: "private" | "group" | "supergroup",
  t: Transaction | null
) => {
  const trans = t ?? (await db.transaction());
  try {
    const chat = await ChatModel.findOrCreate({
      where: { chatIdTg: chatId },
      defaults: {
        chatIdTg: chatId,
        language: "en",
        messageLimit: 100,
        messageQuantity: 0,
        chatType: chatType,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      transaction: t,
    });

    if (!t) await trans.commit();

    return chat;
  } catch (error) {
    if (!t) await trans.rollback();
    logger.error(`${error}: File chats.utils; Function findOrCreate`);
    throw error;
  }
};

const findByIdTg = async (chatIdTg: number) => {
  return await ChatModel.findOne({ where: { chatIdTg } });
};

const addCounter = async (chatIdTg: number, t: Transaction | null) => {
  const trans = t ?? (await db.transaction());
  try {
    const chat = await findByIdTg(chatIdTg);

    if (!chat) throw "No chat found";

    const sendWaifu = chat.messageQuantity >= chat.messageLimit - 1;

    await chat.update(
      {
        messageQuantity: sendWaifu ? 0 : chat.messageQuantity + 1,
      },
      { transaction: trans }
    );

    if (!t) await trans.commit();
    return sendWaifu;
  } catch (error) {
    if (!t) await trans.rollback();
    logger.error(`${error}: File chats.utils; Function addCounter`);
    throw error;
  }
};

export default { findOrCreate, findByIdTg, addCounter };
