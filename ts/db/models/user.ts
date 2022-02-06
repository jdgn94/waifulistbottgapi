'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

import Chat from './chat';

interface UserAttributes {
  id: number;
  chat_id: number;
  user_id_tg: string;
  nickname: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'chat_id' | 'createdAt' | 'updatedAt'> { }

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes { }

export default (sequelize: Sequelize) => {
  const ChatModel = Chat(sequelize);

  const UserModel = sequelize.define<UserInstance>('user', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    chat_id: { type: DataTypes.INTEGER },
    user_id_tg: { type: DataTypes.STRING },
    nickname: { type: DataTypes.STRING },
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

  UserModel.hasMany(ChatModel, { foreignKey: 'chat_id' });

  return UserModel;
};