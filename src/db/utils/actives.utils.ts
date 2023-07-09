import moment from "moment";
import { Op } from "sequelize";

import db from "../models/";
import { ActiveModel, ActivesOutput } from "../models/active.model";
import { ChatModel } from "../models/chat.model";
import { WaifuRarityModel } from "../models/waifu_rarity.model";
import { WaifuModel } from "../models/waifu.model";
import { FranchiseModel } from "../models/franchise.model";

const create = async (chatId: number, waifuRarityId: number) => {
  const t = await db.transaction();
  try {
    const chat = await ActiveModel.create(
      {
        chatId,
        waifuRarityId,
        attempts: moment().add(10, "minute").toDate(),
      },
      { transaction: t }
    );

    await t.commit();
    return chat;
  } catch (error) {
    await t.rollback();
    logger.error(`${error}: File actives.utils; Function create`);
    throw error;
  }
};

const getPass = async () => {
  try {
    const activesPass = await ActiveModel.findAll({
      where: { attempts: { [Op.lte]: new Date() } },
    });

    return activesPass;
  } catch (error) {
    logger.error(`${error}: File actives.utils; Function getPass`);
    throw error;
  }
};

const getWaifuByChatIdOrActiveId = async (chatId: number) => {
  try {
    const result = (await ActiveModel.findOne({
      include: [
        { model: ChatModel, as: "Chat", where: { id: chatId } },
        {
          model: WaifuRarityModel,
          as: "WaifuRarity",
          include: [
            {
              model: WaifuModel,
              as: "Waifu",
              include: [{ model: FranchiseModel, as: "Franchise" }],
            },
          ],
        },
      ],
      where: { id: chatId },
    })) as ActivesOutput;

    console.log(result);

    return result;
  } catch (error) {
    logger.error(
      `${error}: File actives.utils; Function getWaifuByChatIdOrActiveId`
    );
    throw error;
  }
};

export default { create, getPass, getWaifuByChatIdOrActiveId };
