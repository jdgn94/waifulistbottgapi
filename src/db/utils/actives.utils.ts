import moment from "moment";
import { Op, Transaction } from "sequelize";

import db from "../models/";
import { ActiveModel, ActivesOutput } from "../models/active.model";
import { ChatModel } from "../models/chat.model";
import { WaifuRarityModel } from "../models/waifu_rarity.model";
import { WaifuModel } from "../models/waifu.model";
import { FranchiseModel } from "../models/franchise.model";
import { RarityModel } from "../models/rarity.model";

const create = async (
  chatId: number,
  waifuRarityId: number,
  t: Transaction | null
) => {
  const trans = t ?? (await db.transaction());
  try {
    const chat = await ActiveModel.create(
      {
        chatId,
        waifuRarityId,
        attempts: moment().add(10, "minute").toDate(),
      },
      { transaction: trans }
    );

    if (!t) await trans.commit();
    return chat;
  } catch (error) {
    if (!t) await trans.rollback();
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
    const result = ((await ActiveModel.findOne({
      include: [
        { model: ChatModel, as: "Chat" },
        {
          model: WaifuRarityModel,
          as: "WaifuRarity",
          include: [
            {
              model: WaifuModel,
              as: "Waifu",
              include: [{ model: FranchiseModel, as: "Franchise" }],
            },
            {
              model: RarityModel,
              as: "Rarity",
            },
          ],
        },
      ],
      where: { id: chatId },
    })) ||
      (await ActiveModel.findOne({
        include: [
          { model: ChatModel, as: "Chat", where: { chatIdTg: chatId } },
          {
            model: WaifuRarityModel,
            as: "WaifuRarity",
            include: [
              {
                model: WaifuModel,
                as: "Waifu",
                include: [{ model: FranchiseModel, as: "Franchise" }],
              },
              {
                model: RarityModel,
                as: "Rarity",
              },
            ],
          },
        ],
      }))) as ActivesOutput | null;

    return result;
  } catch (error) {
    logger.error(
      `${error}: File actives.utils; Function getWaifuByChatIdOrActiveId`
    );
    throw error;
  }
};

const destroy = async (id: number, t: Transaction | null) => {
  const trans = t ?? (await db.transaction());
  try {
    await ActiveModel.destroy({ where: { id }, transaction: trans });

    if (!t) await trans.commit();
  } catch (error) {
    if (!t) await trans.rollback();
    logger.error(error);
  }
};

export default { create, getPass, getWaifuByChatIdOrActiveId, destroy };
