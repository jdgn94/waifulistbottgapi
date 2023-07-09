import { Transaction } from "sequelize";

import db from "../../db/models";
import { UserInfoModel } from "../../db/models/user_info.model";

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

export default { findOrCreate };
