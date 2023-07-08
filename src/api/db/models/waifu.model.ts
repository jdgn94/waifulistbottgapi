import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { FranchiseModel } from "./franchise.model";
import { WaifuTypeModel } from "./waifu_type.model";
import { WaifuRarityModel } from "./waifu_rarity.model";

export interface WaifuAttributes {
  id: number;
  name: string;
  nickname: string | null;
  age: number;
  servant: boolean;
  waifuTypeId: number;
  franchiseId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WaifuInput
  extends Optional<WaifuAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface WaifuOutput
  extends Model<WaifuAttributes, WaifuInput>,
    WaifuAttributes {
  Franchise?: FranchiseModel;
  WaifuRarities?: WaifuRarityModel[];
  WaifuType?: WaifuTypeModel;
}

export class WaifuModel
  extends Model<WaifuAttributes, WaifuInput>
  implements WaifuAttributes
{
  public id!: number;
  public name!: string;
  public nickname!: string;
  public age!: number;
  public servant!: boolean;
  public waifuTypeId!: number;
  public franchiseId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  WaifuModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nickname: {
        type: DataTypes.STRING,
      },
      age: {
        type: DataTypes.INTEGER,
      },
      servant: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      waifuTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: WaifuTypeModel, key: "id" },
      },
      franchiseId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: FranchiseModel, key: "id" },
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
      tableName: "waifus",
      timestamps: false,
      paranoid: true,
      modelName: "Waifus",
      sequelize,
    }
  );

  WaifuModel.hasOne(WaifuTypeModel, {
    foreignKey: "id",
    sourceKey: "waifuTypeId",
    as: "WaifuType",
  });
  WaifuModel.hasOne(FranchiseModel, {
    foreignKey: "id",
    sourceKey: "franchiseId",
    as: "Franchise",
  });

  WaifuTypeModel.hasMany(WaifuModel, {
    foreignKey: "waifuTypeId",
    sourceKey: "id",
  });
  FranchiseModel.hasMany(WaifuModel, {
    foreignKey: "franchiseId",
    sourceKey: "id",
  });
};

export default createModel;
