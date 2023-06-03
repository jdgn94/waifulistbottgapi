"use strict";

import { Model, Sequelize, Optional, literal, DataTypes } from "sequelize";

import User from "./user";
import Chat from "./chat";

interface UserInfoAttributes {
  id: number;
  userId: number;
  chatId: number;
  points: number;
  exp: number;
  limitExp: number;
  level: number;
  favoritePages: number;
  favoritePagesPurchases: number;
  expMultipler: number;
  expMultiplerExpire: Date;
  totalBets: number;
  totalBetsWon: number;
  totalBetsLost: number;
  totalBetsPoints: number;
  totalBetsPointsWon: number;
  jail: boolean;
  jailExpire: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserInfoCreationAttributes
  extends Optional<
    UserInfoAttributes,
    | "id"
    | "exp"
    | "level"
    | "limitExp"
    | "points"
    | "favoritePages"
    | "favoritePagesPurchases"
    | "expMultipler"
    | "expMultiplerExpire"
    | "totalBets"
    | "totalBetsWon"
    | "totalBetsLost"
    | "totalBetsPoints"
    | "totalBetsPointsWon"
    | "jail"
    | "jailExpire"
    | "createdAt"
    | "updatedAt"
  > {}

export interface UserInfoInstance
  extends Model<UserInfoAttributes, UserInfoCreationAttributes>,
    UserInfoAttributes {}

export default (sequelize: Sequelize) => {
  const UserModel = User(sequelize);
  const ChatModel = Chat(sequelize);

  const UserInfoModel = sequelize.define<UserInfoInstance>("user_info", {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: { type: DataTypes.INTEGER },
    chatId: { type: DataTypes.INTEGER },
    points: { type: DataTypes.INTEGER },
    exp: { type: DataTypes.INTEGER, defaultValue: 0 },
    limitExp: { type: DataTypes.INTEGER, defaultValue: 100 },
    level: { type: DataTypes.INTEGER, defaultValue: 1 },
    favoritePages: { type: DataTypes.INTEGER, defaultValue: 1 },
    favoritePagesPurchases: { type: DataTypes.INTEGER, defaultValue: 0 },
    expMultipler: { type: DataTypes.INTEGER, defaultValue: 1 },
    expMultiplerExpire: { type: DataTypes.DATE, defaultValue: null },
    totalBets: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalBetsWon: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalBetsLost: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalBetsPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
    totalBetsPointsWon: { type: DataTypes.INTEGER, defaultValue: 0 },
    jail: { type: DataTypes.BOOLEAN, defaultValue: false },
    jailExpire: { type: DataTypes.DATE, defaultValue: null },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: literal("CURRENT_TIMESTAMP()"),
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: literal(
        "CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()"
      ),
    },
  });

  UserInfoModel.hasMany(UserModel, { foreignKey: "userId" });
  UserInfoModel.hasMany(ChatModel, { foreignKey: "chatId" });

  return UserInfoModel;
};
