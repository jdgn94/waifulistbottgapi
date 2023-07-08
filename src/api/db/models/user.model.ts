import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { UserInfoModel } from "./user_info.model";
import { UserSpecialListModel } from "./user_special_list.model";
import { WaifuListModel } from "./waifu_list.model";

interface UserAttributes {
  id: number;
  userIdTg: string;
  nickname: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserInput
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface UserOutput
  extends Model<UserAttributes, UserInput>,
    UserAttributes {
  UserInfo?: UserInfoModel;
  UserSpecialLists?: UserSpecialListModel[];
  WaifuLists?: WaifuListModel[];
}

export class UserModel
  extends Model<UserAttributes, UserInput>
  implements UserAttributes
{
  public id!: number;
  public userIdTg!: string;
  public nickname!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  UserModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userIdTg: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      nickname: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
        onUpdate: "NOW()",
      },
    },
    {
      tableName: "users",
      timestamps: false,
      paranoid: true,
      modelName: "Users",
      sequelize,
    }
  );
};

export default createModel;
