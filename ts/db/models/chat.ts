"use strict";

import { Model, Sequelize, Optional, literal, DataTypes } from "sequelize";

interface ChatAttributes {
  id: number;
  chatIdTg: string;
  messageLimit: number;
  messageQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatCreationAttributes
  extends Optional<ChatAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface ChatInstance
  extends Model<ChatAttributes, ChatCreationAttributes>,
    ChatAttributes {}

export default (sequelize: Sequelize) => {
  const ChatModel = sequelize.define<ChatInstance>("chat", {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatIdTg: { type: DataTypes.STRING },
    messageLimit: { type: DataTypes.INTEGER },
    messageQuantity: { type: DataTypes.INTEGER },
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
  return ChatModel;
};
