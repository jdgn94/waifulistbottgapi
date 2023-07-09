import { Transaction } from "sequelize";

import db from "../../db/models";
import { UserChatModel } from "../../db/models/user_chat.model";

const findOrCreate = async (
  userId: number,
  chatId: number,
  t: Transaction | null
) => {
  const trans = t ?? (await db.transaction());
  try {
    const userChats = await UserChatModel.findOrCreate({
      where: { userId, chatId },
      defaults: {
        userId,
        chatId,
      },
      transaction: trans,
    });

    if (!t) await trans.commit();

    return userChats;
  } catch (error) {
    if (!t) await trans.rollback();
    logger.error(`${error}: File user_chats.utils; Function findOrCreate`);
    throw error;
  }
};

export default { findOrCreate };
