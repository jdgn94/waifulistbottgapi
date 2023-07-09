import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { ActiveModel } from "./active.model";
import { TradeModel } from "./trade.model";
import { UserChatModel } from "./user_chat.model";

interface ChatAttributes {
  id: number;
  chatIdTg: number;
  messageLimit: number;
  messageQuantity: number;
  language: string;
  chatType: "group" | "supergroup" | "private";
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
  UserChats?: UserChatModel[];
}

export class ChatModel
  extends Model<ChatAttributes, ChatInput>
  implements ChatAttributes
{
  public id!: number;
  public chatIdTg!: number;
  public messageLimit!: number;
  public messageQuantity!: number;
  public language!: "en" | "es";
  public chatType!: "group" | "supergroup" | "private";
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  ChatModel.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      chatIdTg: {
        type: DataTypes.INTEGER,
        unique: true,
      },
      messageLimit: {
        type: DataTypes.INTEGER,
      },
      messageQuantity: {
        type: DataTypes.INTEGER,
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: "en",
      },
      chatType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "private",
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
