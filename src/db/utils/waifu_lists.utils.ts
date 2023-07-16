import { Context } from "telegraf";

import db from "../models";
import { WaifuListModel } from "../models/waifu_list.model";

import activesUtils from "./actives.utils";
import usersUtils from "./users.utils";
import userInfosUtils from "./user_infos.utils";
import userChatsUtils from "./user_chats.utils";

const addActiveWaifu = async (ctx: Context) => {
  const t = await db.transaction();
  try {
    let typeInsert: "exist" | "new" | "max";
    const active = await activesUtils.getWaifuByChatIdOrActiveId(ctx.chat!.id);
    if (active === null) return;
    const user = await usersUtils.findOrCreate(
      ctx.from!.id,
      ctx.from!.username ?? ctx.from!.first_name,
      t
    );

    const waifuOnList = await WaifuListModel.findOne({
      where: { waifuRarityId: active.waifuRarityId, userId: user.id },
      transaction: t,
    });

    if (waifuOnList && waifuOnList.quantity < 10) {
      waifuOnList.increment({ quantity: 1 }, { transaction: t });
      typeInsert = "exist";
    } else if (waifuOnList && waifuOnList.quantity >= 10) {
      typeInsert = "max";
    } else {
      await WaifuListModel.create(
        { userId: user.id, waifuRarityId: active.waifuRarityId, quantity: 1 },
        { transaction: t }
      );
      typeInsert = "new";
    }

    await userChatsUtils.findOrCreate(active.chatId, user.id, t);

    const message = await userInfosUtils.addExp(
      user.UserInfo!.id,
      typeInsert,
      active.WaifuRarity!,
      t
    );

    await activesUtils.destroy(active.id, t);
    if (message)
      ctx.reply(message!.replace("-", "\\-"), {
        reply_to_message_id: ctx.message!.message_id,
        parse_mode: "MarkdownV2",
      });
    await t.commit();
    return;
  } catch (error) {
    await t.rollback();
    logger.error(`${error}: File: waifu_lists.model; Function: addActiveWaifu`);
  }
};

export default { addActiveWaifu };
