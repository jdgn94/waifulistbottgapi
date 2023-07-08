import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { UserModel } from "./user.model";
import { BetModel } from "./bet.model";

interface UserInfoAttributes {
  id: number;
  userId: number;
  points: number;
  freePoints: number;
  specialPoints: number;
  exp: number;
  limitExp: number;
  level: number;
  favoritePages: number;
  favoritePagesPurchases: number;
  expMultiplier: number;
  expMultiplierExpire: Date;
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

interface UserInfoInput
  extends Optional<
    UserInfoAttributes,
    | "id"
    | "exp"
    | "level"
    | "limitExp"
    | "points"
    | "freePoints"
    | "specialPoints"
    | "favoritePages"
    | "favoritePagesPurchases"
    | "expMultiplier"
    | "expMultiplierExpire"
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

export interface UserInfoOutput
  extends Model<UserInfoAttributes, UserInfoInput>,
    UserInfoAttributes {
  Bets?: BetModel[];
  User?: UserModel;
}

export class UserInfoModel
  extends Model<UserInfoAttributes, UserInfoInput>
  implements UserInfoAttributes
{
  public id!: number;
  public userId!: number;
  public points!: number;
  public freePoints!: number;
  public specialPoints!: number;
  public exp!: number;
  public limitExp!: number;
  public level!: number;
  public favoritePages!: number;
  public favoritePagesPurchases!: number;
  public expMultiplier!: number;
  public expMultiplierExpire!: Date;
  public totalBets!: number;
  public totalBetsWon!: number;
  public totalBetsLost!: number;
  public totalBetsPoints!: number;
  public totalBetsPointsWon!: number;
  public jail!: boolean;
  public jailExpire!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  UserInfoModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: true,
        references: { model: UserModel, key: "id" },
      },
      points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      freePoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      specialPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      exp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      limitExp: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      favoritePages: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      favoritePagesPurchases: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      expMultiplier: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      expMultiplierExpire: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      totalBets: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalBetsWon: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalBetsLost: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalBetsPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalBetsPointsWon: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      jail: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      jailExpire: {
        type: DataTypes.DATE,
        defaultValue: null,
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
      tableName: "user_infos",
      timestamps: false,
      paranoid: true,
      modelName: "UserInfos",
      sequelize,
    }
  );

  UserInfoModel.hasOne(UserModel, {
    foreignKey: "id",
    sourceKey: "userId",
    as: "User",
  });

  UserModel.hasOne(UserInfoModel, {
    foreignKey: "userId",
    sourceKey: "id",
    as: "UserInfo",
  });
};

export default createModel;
