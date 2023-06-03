"use strict";

import { Model, Sequelize, Optional, literal, DataTypes } from "sequelize";
import Chat from "./chat";
import Waifu from "./waifu";

interface ActiveAttributes {
  id: number;
  chatId: number;
  waifuId: number;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ActiveCreationAttributes
  extends Optional<
    ActiveAttributes,
    "id" | "attempts" | "createdAt" | "updatedAt"
  > {}

export interface ActiveInstance
  extends Model<ActiveAttributes, ActiveCreationAttributes>,
    ActiveAttributes {}

export default (sequelize: Sequelize) => {
  const ChatModel = Chat(sequelize);
  const WaifuModel = Waifu(sequelize);

  const ActiveModel = sequelize.define<ActiveInstance>("active", {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatId: { type: DataTypes.INTEGER },
    waifuId: { type: DataTypes.INTEGER },
    attempts: { type: DataTypes.INTEGER, defaultValue: 10 },
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

  ActiveModel.hasMany(ChatModel, { foreignKey: "chatId" });
  ActiveModel.hasMany(WaifuModel, { foreignKey: "waifuId" });

  return ActiveModel;
};
