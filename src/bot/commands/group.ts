import { Context } from "telegraf";

import db from "../../db/models/";
import chatsUtils from "../../db/utils/chats.utils";

import { sendWaifu } from "../utils/utils";
import i18n from "../../config/i18n";
import activesUtils from "../../db/utils/actives.utils";
import waifuListsUtils from "../../db/utils/waifu_lists.utils";

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
      await sendWaifu(ctx, t);
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
  const regExpSeparate = new RegExp(/[\s_.,-]/);

  try {
    const message = ctx.message!;
    if ("text" in message) {
      const { text } = message;
      const textSeparated = text.split(regExpSeparate);

      const active = await activesUtils.getWaifuByChatIdOrActiveId(
        message.chat.id
      );
      if (!active) return;

      const waifuName = active.WaifuRarity!.Waifu!.name;
      const waifuNickname = active.WaifuRarity!.Waifu!.nickname;

      const waifuNameSeparated = waifuName.split(regExpSeparate);
      let waifuNicknameSeparated = [] as string[];
      if (waifuNickname != null)
        waifuNicknameSeparated = waifuNickname!.split(regExpSeparate);

      let nameCorrect = false;
      for (let j = 0; j < textSeparated.length; j++) {
        const actualText = textSeparated[j].toLowerCase();
        if (nameCorrect) break;
        for (let i = 0; i < waifuNameSeparated.length; i++) {
          const nameVerify = new RegExp(waifuNameSeparated[i].toLowerCase());
          if (nameVerify.test(actualText)) {
            nameCorrect = true;
            break;
          }
        }
        if (nameCorrect) break;
        for (let i = 0; i < waifuNicknameSeparated.length; i++) {
          const nicknameVerify = new RegExp(
            waifuNicknameSeparated[i].toLowerCase()
          );
          if (nicknameVerify.test(actualText)) {
            nameCorrect = true;
            break;
          }
        }
      }

      if (nameCorrect) {
        await waifuListsUtils.addActiveWaifu(ctx);
      } else {
        ctx.reply(i18n.__("noWaifuMatch"), {
          reply_to_message_id: ctx.message!.message_id,
        });
      }
    }
  } catch (error) {
    logger.error(`${error}: File group; Function protect`);
  }
};

export default { start, protect };
