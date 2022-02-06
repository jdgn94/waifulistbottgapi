'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

import Waifu from './waifu';

interface WaifuFavoriteListAttributes {
  id: number;
  waifu_list_id: number;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WaifuFavoriteListCreationAttributes extends Optional<WaifuFavoriteListAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export interface WaifuFavoriteListInstance extends Model<WaifuFavoriteListAttributes, WaifuFavoriteListCreationAttributes>, WaifuFavoriteListAttributes { }

export default (sequelize: Sequelize) => {
  const WaifuModel = Waifu(sequelize);

  const WaifuFavoriteListModel = sequelize.define<WaifuFavoriteListInstance>('waifu_favorite_list', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    waifu_list_id: { type: DataTypes.INTEGER },
    position: { type: DataTypes.INTEGER },
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

  WaifuFavoriteListModel.hasMany(WaifuModel, { foreignKey: 'waifu_list_id' });

  return WaifuFavoriteListModel;
};