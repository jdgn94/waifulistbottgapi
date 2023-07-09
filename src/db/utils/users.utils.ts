import { Transaction } from "sequelize";

import db from "../../db/models";
import { UserModel, UserOutput } from "../../db/models/user.model";
import { UserInfoModel } from "../../db/models/user_info.model";

import userInfosUtils from "./user_infos.utils";

const findOrCreate = async (
  userIdTg: number,
  nickname: string,
  t: Transaction | null
) => {
  const trans = t ?? (await db.transaction());
  try {
    let user = (await UserModel.findOne({
      where: { userIdTg },
      include: [{ model: UserInfoModel, as: "UserInfo" }],
    })) as UserOutput;

    if (!user) {
      user = await UserModel.create(
        {
          nickname,
          userIdTg,
        },
        { transaction: trans }
      );
      await userInfosUtils.findOrCreate(user.id, trans);
      user = (await UserModel.findOne({
        where: { userIdTg },
        include: [{ model: UserInfoModel, as: "UserInfo" }],
        transaction: trans,
      })) as UserOutput;
    }

    if (!t) await trans.commit();

    return user;
  } catch (error) {
    if (!t) await trans.rollback();
    logger.error(`${error}: File users.utils; Function findOrCreate`);
    throw error;
  }
};

export default { findOrCreate };
