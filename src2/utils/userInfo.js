const { sequelize } = require('../db/models');
const UserInfo = require('../db/models').user_info;

const addExpUser = async (userInfoId, expType = null) => {
  let userInfo = await UserInfo.findOne({ where: { id: userInfoId } });
  // INFO: tipo agreando una waifu a la lista
  if (expType.type == 'newWaifu') {
    const addExp = expType.type.imgFavorite ? await numberRandom(20, 15) : await numberRandom(15, 10);
    const newExp = (userInfo.exp + addExp) % userInfo.limit_exp;
    const newLevel = newExp < userInfo.exp ? userInfo.level + 1 : userInfo.level;
    const newLimitExp = (parseInt(newLevel / 5) * 25) + 100;
    const newPoints = userInfo.points + 1;

    const query = `
      UPDATE user_infos
      SET
        exp = ${newExp},
        level = ${newLevel},
        limit_exp = ${newLimitExp},
        points = ${newPoints}
      WHERE
        id = ${userInfoId}
    `;

    await sequelize.query(query, { type: sequelize.QueryTypes.UPDATE });
    return await messageExp(addExp, newLevel, userInfo.level);
  } else if (expType.type == 'change') { } else { }
}

const messageExp = async (exp, newLevel, oldLevel) => {
  let message = `Has ganado ${exp} puntos de experiencia.`;
  if (newLevel > oldLevel) {
    message += `\nFelicidades subiste al nivel ${newLevel}`;
    if (newLevel % 5 == 0) {
      message += ` y has obtenido un una página nueva en favoritos para un total de ${parseInt(newLevel / 5) + 1} páginas`;
    }
    message += '.';
  }
  return message;
}

const numberRandom = async (max, min) => {
  return await Math.round(Math.random() * (min - max) + max);
}

module.exports = { addExpUser, numberRandom };