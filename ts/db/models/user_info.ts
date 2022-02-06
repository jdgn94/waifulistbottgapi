'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

import User from './user';
import Chat from './chat';

interface UserAttibutes {
  id: number;
  user_id: number;
  chat_id: number;
  points: number;
  exp: number;
  limit_exp: number;
  level: number;
  favorite_pages: number;
  favorite_pages_purchases: number;
  exp_multipler: number;
  exp_multipler_expire: Date;
  total_bets: number;
  total_bets_won: number;
  total_bets_lost: number;
  total_bets_points: number;
  total_bets_points_won: number;
  jail: boolean;
  jail_expire: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserInfoCreationAttributes extends Optional<UserAttibutes, 'id' | 'exp' | 'level' | 'limit_exp' | 'points' | 'favorite_pages' | 'favorite_pages_purchases' | 'exp_multipler' | 'exp_multipler_expire'
  | 'total_bets' | 'total_bets_won' | 'total_bets_lost' | 'total_bets_points' | 'total_bets_points_won' | 'jail' | 'jail_expire' | 'createdAt' | 'updatedAt'> { }

export interface UserInfoInstance extends Model<UserAttibutes, UserInfoCreationAttributes>, UserAttibutes { }

export default (sequelize: Sequelize) => {
  const UserModel = User(sequelize);
  const ChatModel = Chat(sequelize);

  const UserInfoModel = sequelize.define<UserInfoInstance>('user_info', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: { type: DataTypes.INTEGER },
    chat_id: { type: DataTypes.INTEGER },
    points: { type: DataTypes.INTEGER },
    exp: { type: DataTypes.INTEGER, defaultValue: 0 },
    limit_exp: { type: DataTypes.INTEGER, defaultValue: 100 },
    level: { type: DataTypes.INTEGER, defaultValue: 1 },
    favorite_pages: { type: DataTypes.INTEGER, defaultValue: 1 },
    favorite_pages_purchases: { type: DataTypes.INTEGER, defaultValue: 0 },
    exp_multipler: { type: DataTypes.INTEGER, defaultValue: 1 },
    exp_multipler_expire: { type: DataTypes.DATE, defaultValue: null },
    total_bets: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_bets_won: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_bets_lost: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_bets_points: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_bets_points_won: { type: DataTypes.INTEGER, defaultValue: 0 },
    jail: { type: DataTypes.BOOLEAN, defaultValue: false },
    jail_expire: { type: DataTypes.DATE, defaultValue: null },
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

  UserInfoModel.hasMany(UserModel, { foreignKey: 'user_id' });
  UserInfoModel.hasMany(ChatModel, { foreignKey: 'chat_id' });

  return UserInfoModel;
}