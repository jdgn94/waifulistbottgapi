import { Transaction } from "sequelize";

import { UserInfoModel } from "../../db/models/user_info.model";

interface expType {
  type: string;
  imgFavorite?: boolean;
}

const addExpUser = async (
  userInfoId: number,
  expType: expType,
  t: Transaction
) => {
  let userInfo = await UserInfoModel.findOne({ where: { id: userInfoId } });
  // INFO: tipo agregando una waifu a la lista
  if (expType.type == "newWaifu" && userInfo) {
    const addExp = expType.imgFavorite
      ? numberRandom(20, 15)
      : numberRandom(10, 5);
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
        favoritePages: newFavoritePages,
      },
      { transaction: t }
    );
    return await messageExp(addExp, newLevel, userInfo.level, newLimitExp);
  } else if (expType.type == "change") {
    return null;
  } else {
    return null;
  }
};

const messageExp = async (
  exp: number,
  newLevel: number,
  oldLevel: number,
  newLimit: number
) => {
  let message = `Has ganado ${exp} puntos de experiencia.`;
  if (newLevel > oldLevel) {
    message += `\nFelicidades subiste al nivel ${newLevel}`;
    if (newLevel % 5 == 0) {
      message += ` y has obtenido un una página nueva en favoritos para un total de ${newLimit} páginas`;
    }
    message += ".";
  }
  return message;
};

const numberRandom = (max: number, min: number) => {
  return Math.round(Math.random() * (min - max) + max);
};

export { addExpUser, numberRandom };
