'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

import SpecialImage from './special_image';
import User from './user';
import Chat from './chat';

interface UserSpecialListAttributes {
  id: number;
  special_images_id: number;
  user_id: number;
  chat_id: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UserSpecialListCreationAttributes extends Optional<UserSpecialListAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export interface UserSpecialListInstance extends Model<UserSpecialListAttributes, UserSpecialListCreationAttributes>, UserSpecialListAttributes { }

export default (sequelize: Sequelize) => {
  const SpecialImageModel = SpecialImage(sequelize);
  const UserModel = User(sequelize);
  const ChatModel = Chat(sequelize);

  const UserSpecialListModel = sequelize.define<UserSpecialListInstance>('user_special_list', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    special_images_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER },
    chat_id: { type: DataTypes.INTEGER },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: literal('CURRENT_TIMESTAMP()')
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: literal('CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()')
    }
  });

  UserSpecialListModel.hasMany(SpecialImageModel, { foreignKey: 'special_images_id' });
  UserSpecialListModel.hasMany(UserModel, { foreignKey: 'user_id' });
  UserSpecialListModel.hasMany(ChatModel, { foreignKey: 'chat_id' });

  return UserSpecialListModel;
};
