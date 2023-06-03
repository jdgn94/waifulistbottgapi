"use strict";

import { Model, Sequelize, Optional, literal, DataTypes } from "sequelize";

import Franchise from "./franchise";
import WaifuType from "./waifu_type";

interface WaifuAttributes {
  id: number;
  name: string;
  nickname: string;
  age: number;
  servant: boolean;
  waifuTypeId: number;
  franchiseId: number;
  publicId: string;
  imageUrl: string;
  favPublicId: string;
  favImageUrl: string;
  summerImageId: string;
  summerImageUrl: string;
  winterImageId: string;
  winterImageUrl: string;
  springImageId: string;
  springImageUrl: string;
  fallImageId: string;
  fallImageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WaifuCreationAttributes
  extends Optional<WaifuAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface WaifuInstance
  extends Model<WaifuAttributes, WaifuCreationAttributes>,
    WaifuAttributes {}

export default (sequelize: Sequelize) => {
  const FranchiseModel = Franchise(sequelize);
  const WaifuTypeModel = WaifuType(sequelize);

  const WaifuModel = sequelize.define<WaifuInstance>("waifu", {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING },
    nickname: { type: DataTypes.STRING },
    age: { type: DataTypes.INTEGER },
    servant: { type: DataTypes.BOOLEAN },
    waifuTypeId: { type: DataTypes.INTEGER },
    franchiseId: { type: DataTypes.INTEGER },
    publicId: { type: DataTypes.STRING },
    imageUrl: { type: DataTypes.STRING },
    favPublicId: { type: DataTypes.STRING },
    favImageUrl: { type: DataTypes.STRING },
    summerImageId: { type: DataTypes.STRING },
    summerImageUrl: { type: DataTypes.STRING },
    winterImageId: { type: DataTypes.STRING },
    winterImageUrl: { type: DataTypes.STRING },
    springImageId: { type: DataTypes.STRING },
    springImageUrl: { type: DataTypes.STRING },
    fallImageId: { type: DataTypes.STRING },
    fallImageUrl: { type: DataTypes.STRING },
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

  WaifuModel.hasMany(WaifuTypeModel, { foreignKey: "waifuTypeId" });
  WaifuModel.hasMany(FranchiseModel, { foreignKey: "franchiseId" });

  return WaifuModel;
};
