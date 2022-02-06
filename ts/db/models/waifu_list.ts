'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

interface WaifuListAttributes {
  id: number;
  chat_id: number;
  user_id: number;
  waifu_id: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WaifuListCreationAttributes extends Optional<WaifuListAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export interface WaifuListInstance extends Model<WaifuListAttributes, WaifuListCreationAttributes>, WaifuListAttributes { }

export default (sequelize: Sequelize) => {
  const WaifuListModel = sequelize.define<WaifuListInstance>('waifu_list', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    chat_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER },
    waifu_id: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER },
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

  WaifuListModel.hasMany(sequelize.models.chat, { foreignKey: 'chat_id' });
  WaifuListModel.hasMany(sequelize.models.user, { foreignKey: 'user_id' });
  WaifuListModel.hasMany(sequelize.models.waifu, { foreignKey: 'waifu_id' });

  return WaifuListModel;
};