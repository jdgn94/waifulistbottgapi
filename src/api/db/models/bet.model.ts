import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { UserInfoModel } from "./user_info.model";
import { FranchiseModel } from "./franchise.model";

interface BetAttributes {
  id: number;
  userInfoId: number;
  franchiseId: number;
  quantity: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BetInput
  extends Optional<BetAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface BetOutput
  extends Model<BetAttributes, BetInput>,
    BetAttributes {
  UserInfo?: UserInfoModel;
  Franchise?: FranchiseModel;
}

export class BetModel
  extends Model<BetAttributes, BetInput>
  implements BetAttributes
{
  public id!: number;
  public userInfoId!: number;
  public franchiseId!: number;
  public quantity!: number;
  public active!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  BetModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userInfoId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: UserInfoModel, key: "id" },
      },
      franchiseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: FranchiseModel, key: "id" },
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
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
      tableName: "bets",
      timestamps: false,
      paranoid: true,
      modelName: "Bets",
      sequelize,
    }
  );

  BetModel.hasOne(UserInfoModel, {
    foreignKey: "id",
    sourceKey: "userInfoId",
    as: "UserInfo",
  });
  BetModel.hasOne(FranchiseModel, {
    foreignKey: "id",
    sourceKey: "franchiseId",
    as: "Franchise",
  });

  UserInfoModel.hasMany(BetModel, {
    foreignKey: "userInfoId",
    sourceKey: "id",
  });
  FranchiseModel.hasMany(BetModel, {
    foreignKey: "franchiseId",
    sourceKey: "id",
  });
};

export default createModel;
