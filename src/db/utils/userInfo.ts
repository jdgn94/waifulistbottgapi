import { Model, Transaction } from "sequelize";
import db from "../../db/models";

const UserInfo = db.UserInfoModel;

interface expType {
  type: string;
  imgFavorite?: boolean;
}

const addExpUser = async (
  userInfoId: number,
  expType: expType,
  t: Transaction
) => {
  let userInfo = await UserInfo.findOne({ where: { id: userInfoId } });
  // INFO: tipo agreando una waifu a la lista
  if (expType.type == "newWaifu" && userInfo) {
    const addExp = expType.imgFavorite
      ? await numberRandom(20, 15)
      : await numberRandom(15, 10);
    const newExp = (userInfo.exp + addExp) % userInfo.limit_exp;
    const newLevel =
      newExp < userInfo.exp ? userInfo.level + 1 : userInfo.level;
    const newLimitExp = Math.trunc(newLevel / 5) * 25 + 100;
    const newPoints = userInfo.points + 1;

    await userInfo.update(
      {
        exp: newExp,
        level: newLevel,
        limit_exp: newLimitExp,
        points: newPoints,
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

const numberRandom = async (max: number, min: number) => {
  return await Math.round(Math.random() * (min - max) + max);
};

export { addExpUser, numberRandom };
