import { Transaction } from "sequelize";

import db from "../../db/models";
import { UserInfoModel, UserInfoOutput } from "../../db/models/user_info.model";
import { WaifuRarityOutput } from "../models/waifu_rarity.model";
import { UserModel } from "../models/user.model";

import { getRandom } from "../../bot/utils/utils";
import i18n from "../../config/i18n";

const findOrCreate = async (userId: number, t: Transaction | null) => {
  const trans = t ?? (await db.transaction());
  try {
    const userInfo = await UserInfoModel.findOrCreate({
      where: { userId: userId },
      defaults: {
        userId: userId,
      },
      transaction: t,
    });

    if (!t) await trans.commit();

    return userInfo;
  } catch (error) {
    if (!t) await trans.rollback();
    logger.error(`${error}: File user_infos.utils; Function findOrCreate`);
    throw error;
  }
};

const addExp = async (
  userInfoId: number,
  type: "new" | "change" | "exist" | "max",
  waifuRarity: WaifuRarityOutput,
  t: Transaction
) => {
  try {
    let userInfo = (await UserInfoModel.findOne({
      include: [{ model: UserModel, as: "User" }],
      where: { id: userInfoId },
      transaction: t,
    })) as UserInfoOutput;
    if (!userInfo) throw "User info not found";

    const rarityName = waifuRarity.Rarity!.name;
    let minExp: number;
    let maxExp: number;

    if (type === "new" || type === "max") {
      minExp = rarityName === "Normal" ? 1 : rarityName === "Rare" ? 5 : 10;
      maxExp = rarityName === "Normal" ? 4 : rarityName === "Rare" ? 9 : 14;
    } else if (type === "exist") {
      minExp = Math.round(
        (rarityName === "Normal" ? 1 : rarityName === "Rare" ? 5 : 10) * 0.5
      );
      maxExp = Math.round(
        (rarityName === "Normal" ? 4 : rarityName === "Rare" ? 9 : 14) * 0.5
      );
    } else if (type === "change") {
      return null;
    } else {
      return null;
    }
    const addExp = getRandom(minExp, maxExp);
    const newExp = (userInfo.exp + addExp) % userInfo.limitExp;
    const newLevel =
      newExp < userInfo.exp ? userInfo.level + 1 : userInfo.level;
    const newLimitExp = Math.trunc(newLevel / 5) * 25 + 100;
    const newPoints = userInfo.points + 1;
    const newFavoritePages = Math.trunc(newLevel / 5);

    await userInfo.update(
      {
        exp: newExp,
        level: newLevel,
        limitExp: newLimitExp,
        points: newPoints,
        favoritePages: userInfo.favoritePagesPurchases + 1 + newFavoritePages,
      },
      { transaction: t }
    );
    return _messageExp(
      addExp,
      newLevel,
      userInfo.level,
      newLimitExp,
      userInfo.User!.nickname,
      `${waifuRarity.Waifu!.name}${
        waifuRarity.Waifu!.nickname
          ? " (" + waifuRarity.Waifu!.nickname + ")"
          : ""
      }`,
      `${waifuRarity.Waifu!.Franchise!.name}${
        waifuRarity.Waifu!.Franchise!.nickname
          ? " (" + waifuRarity.Waifu!.Franchise!.nickname + ")"
          : ""
      }`
    );
  } catch (error) {
    logger.error(`${error}: File user_info.utils; Function: addExp`);
    throw error;
  }
};

const _messageExp = (
  exp: number,
  newLevel: number,
  oldLevel: number,
  totalPages: number,
  userName: string,
  waifuName: string,
  franchiseName: string
) => {
  let message = i18n.__("waifuProtect", {
    userName,
    waifuName,
    franchiseName,
    exp: exp.toString(),
  });
  if (newLevel > oldLevel) {
    message += `\n${i18n.__("newLevel", { newLevel: newLevel.toString() })}`;
    if (newLevel % 5 == 0) {
      message += ` ${i18n.__("newPage", {
        totalPages: totalPages.toString(),
      })}`;
    }
    message += "\\.";
  }
  return message;
};

export default { findOrCreate, addExp };
