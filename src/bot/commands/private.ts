import { Context } from "telegraf";

import i18n from "../../config/i18n";
import menuButton from "../utils/menu_button";

import db from "../../db/models/";
import usersUtils from "../../db/utils/users.utils";
import chatsUtils from "../../db/utils/chats.utils";
import userChatsUtils from "../../db/utils/user_chats.utils";

const start = async (ctx: Context) => {
  const successCreate = await _createChantAndUser(ctx);
  if (!successCreate) throw "unexpected error to create private chat";

  const name = ctx.message?.from.first_name ?? "no name";
  ctx.reply(i18n.__("initPrivate", { name }), menuButton.mainMenuButtons());
};

const _createChantAndUser = async (ctx: Context) => {
  const t = await db.transaction();
  try {
    const chat = await chatsUtils.findOrCreate(
      ctx.message!.chat.id,
      ctx.message!.chat.type,
      t
    );
    const user = await usersUtils.findOrCreate(
      ctx.from!.id,
      ctx.from!.username!,
      t
    );
    await userChatsUtils.findOrCreate(user.id, chat[0].id, t);

    await t.commit();
    return true;
  } catch (error) {
    await t.rollback();
    logger.error(`${error}: File private; Function _createChatAndUser`);
    return false;
  }
};

export default { start };
