"use strict";

import { Model, Sequelize, Optional, literal, DataTypes } from "sequelize";

interface WaifuTypeAttributes {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WaifuTypeCreationAttributes
  extends Optional<WaifuTypeAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface WaifuTypeInstance
  extends Model<WaifuTypeAttributes, WaifuTypeCreationAttributes>,
    WaifuTypeAttributes {}

export default (sequelize: Sequelize) => {
  const WaifuTypeModel = sequelize.define<WaifuTypeInstance>("waifu_type", {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING },
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
  return WaifuTypeModel;
};
