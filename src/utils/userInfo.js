const { sequelize } = require('../models');
const UserInfo = require('../models').user_info;

const addExpUser = async (userInfoId, expType = null) => {
  console.log(userInfoId, expType);
  let userInfo = await UserInfo.findOne({ where: { id: userInfoId } });
  // INFO: tipo agreando una waifu a la lista
  if (expType.type == 'newWaifu') {
    console.log(userInfo.level);
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
    let message = ''
    if (newLevel > userInfo.level) {
      message = `Felicidades subiste al nivel ${newLevel}`;
    } else {
      message = `Has ganado ${addExp} puntos de experiencia`;
      if (newLevel % 5 == 0) {
        message += ` y has obtenido un una página nueva en favoritos para un total de ${parseInt(newLevel / 5) + 1} páginas`;
      }
    }
    message += '.';
    return message;
  } else if(expType.type == 'change') {} else {}
}

const numberRandom = async (max, min) => {
  return await Math.round(Math.random() * (min - max) + max);
}

module.exports = {addExpUser, numberRandom};