"use strict";

import { Model, Sequelize, Optional, literal, DataTypes } from "sequelize";

import SpecialImage from "./special_image";
import User from "./user";
import Chat from "./chat";

interface UserSpecialListAttributes {
  id: number;
  specialImagesId: number;
  userId: number;
  chatId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserSpecialListCreationAttributes
  extends Optional<
    UserSpecialListAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

export interface UserSpecialListInstance
  extends Model<UserSpecialListAttributes, UserSpecialListCreationAttributes>,
    UserSpecialListAttributes {}

export default (sequelize: Sequelize) => {
  const SpecialImageModel = SpecialImage(sequelize);
  const UserModel = User(sequelize);
  const ChatModel = Chat(sequelize);

  const UserSpecialListModel = sequelize.define<UserSpecialListInstance>(
    "user_special_list",
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      specialImagesId: { type: DataTypes.INTEGER },
      userId: { type: DataTypes.INTEGER },
      chatId: { type: DataTypes.INTEGER },
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
    }
  );

  UserSpecialListModel.hasMany(SpecialImageModel, {
    foreignKey: "specialImagesId",
  });
  UserSpecialListModel.hasMany(UserModel, { foreignKey: "userId" });
  UserSpecialListModel.hasMany(ChatModel, { foreignKey: "chatId" });

  return UserSpecialListModel;
};
