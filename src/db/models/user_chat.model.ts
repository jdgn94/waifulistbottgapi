import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { UserModel } from "./user.model";
import { ChatModel } from "./chat.model";

interface UserChatAttributes {
  id: number;
  chatId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserChatInput
  extends Optional<UserChatAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface UserChatOutput
  extends Model<UserChatAttributes, UserChatInput>,
    UserChatAttributes {
  Chats?: ChatModel[];
  Users?: UserModel[];
}

export class UserChatModel
  extends Model<UserChatAttributes, UserChatInput>
  implements UserChatAttributes
{
  public id!: number;
  public chatId!: number;
  public userId!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  UserChatModel.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      chatId: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: { model: ChatModel, key: "id" },
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: { model: UserModel, key: "id" },
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
      tableName: "user_chats",
      timestamps: false,
      paranoid: true,
      modelName: "UserChats",
      indexes: [
        {
          name: "user_chats",
          fields: [{ name: "chat_id" }, { name: "user_id" }],
          unique: true,
        },
      ],
      sequelize,
    }
  );

  UserChatModel.hasMany(UserModel, {
    foreignKey: "id",
    sourceKey: "userId",
    constraints: false,
  });
  UserChatModel.hasMany(ChatModel, {
    foreignKey: "id",
    sourceKey: "chatId",
    constraints: false,
  });

  UserModel.hasMany(UserChatModel, {
    foreignKey: "userId",
    sourceKey: "id",
    constraints: false,
  });
  ChatModel.hasMany(UserChatModel, {
    foreignKey: "chatId",
    sourceKey: "id",
    constraints: false,
  });
};

export default createModel;
