"use strict";

import { Model, Sequelize, Optional, literal, DataTypes } from "sequelize";

interface WaifuListAttributes {
  id: number;
  chatId: number;
  userId: number;
  waifuId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WaifuListCreationAttributes
  extends Optional<WaifuListAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface WaifuListInstance
  extends Model<WaifuListAttributes, WaifuListCreationAttributes>,
    WaifuListAttributes {}

export default (sequelize: Sequelize) => {
  const WaifuListModel = sequelize.define<WaifuListInstance>("waifu_list", {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatId: { type: DataTypes.INTEGER },
    userId: { type: DataTypes.INTEGER },
    waifuId: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER },
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

  WaifuListModel.hasMany(sequelize.models.chat, { foreignKey: "chatId" });
  WaifuListModel.hasMany(sequelize.models.user, { foreignKey: "userId" });
  WaifuListModel.hasMany(sequelize.models.waifu, { foreignKey: "waifIid" });

  return WaifuListModel;
};
