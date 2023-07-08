import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { ActiveModel } from "./active.model";
import { TradeModel } from "./trade.model";

interface ChatAttributes {
  id: number;
  chatIdTg: string;
  messageLimit: number;
  messageQuantity: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatInput
  extends Optional<ChatAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface ChatOutput
  extends Model<ChatAttributes, ChatInput>,
    ChatAttributes {
  Actives?: ActiveModel[];
  Trades?: TradeModel[];
}

export class ChatModel
  extends Model<ChatAttributes, ChatInput>
  implements ChatAttributes
{
  public id!: number;
  public chatIdTg!: string;
  public messageLimit!: number;
  public messageQuantity!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  ChatModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      chatIdTg: {
        type: DataTypes.STRING,
        unique: true,
      },
      messageLimit: {
        type: DataTypes.INTEGER,
      },
      messageQuantity: {
        type: DataTypes.INTEGER,
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
      tableName: "chats",
      timestamps: false,
      paranoid: true,
      modelName: "Chats",
      sequelize,
    }
  );
};

export default createModel;
