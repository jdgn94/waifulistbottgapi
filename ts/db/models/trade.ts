"use strict";

import { Model, Sequelize, Optional, literal, DataTypes } from "sequelize";

interface TradeAttributes {
  id: number;
  messageId: string;
  waifuEmiterId: number;
  waifuReceptorId: number;
  chatId: number;
  complete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TradeCreationAttributes
  extends Optional<
    TradeAttributes,
    "id" | "complete" | "createdAt" | "updatedAt"
  > {}

export interface TradeInstance
  extends Model<TradeAttributes, TradeCreationAttributes>,
    TradeAttributes {}

export default (sequelize: Sequelize) => {
  const TradeModel = sequelize.define<TradeInstance>("trade", {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    messageId: { type: DataTypes.STRING },
    waifuEmiterId: { type: DataTypes.INTEGER },
    waifuReceptorId: { type: DataTypes.INTEGER },
    chatId: { type: DataTypes.INTEGER },
    complete: { type: DataTypes.BOOLEAN, defaultValue: false },
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

  TradeModel.hasMany(sequelize.models.waifu, { foreignKey: "waifuEmiterId" });
  TradeModel.hasMany(sequelize.models.waifu, {
    foreignKey: "waifuIeceptorId",
  });
  TradeModel.hasMany(sequelize.models.chat, { foreignKey: "chatId" });

  return TradeModel;
};
