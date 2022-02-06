'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

import Franchise from './franchise';
import WaifuType from './waifu_type';

interface WaifuAttributes {
  id: number;
  name: string;
  nickname: string;
  age: number;
  servant: boolean;
  waifu_type_id: number;
  franchise_id: number;
  public_id: string;
  image_url: string;
  fav_public_id: string;
  fav_image_url: string;
  summer_image_id: string;
  summer_image_url: string;
  winter_image_id: string;
  winter_image_url: string;
  spring_image_id: string;
  spring_image_url: string;
  fall_image_id: string;
  fall_image_url: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WaifuCreationAttributes extends Optional<WaifuAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export interface WaifuInstance extends Model<WaifuAttributes, WaifuCreationAttributes>, WaifuAttributes { }

export default (sequelize: Sequelize) => {
  const FranchiseModel = Franchise(sequelize);
  const WaifuTypeModel = WaifuType(sequelize);

  const WaifuModel = sequelize.define<WaifuInstance>('waifu', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: { type: DataTypes.STRING },
    nickname: { type: DataTypes.STRING },
    age: { type: DataTypes.INTEGER },
    servant: { type: DataTypes.BOOLEAN },
    waifu_type_id: { type: DataTypes.INTEGER },
    franchise_id: { type: DataTypes.INTEGER },
    public_id: { type: DataTypes.STRING },
    image_url: { type: DataTypes.STRING },
    fav_public_id: { type: DataTypes.STRING },
    fav_image_url: { type: DataTypes.STRING },
    summer_image_id: { type: DataTypes.STRING },
    summer_image_url: { type: DataTypes.STRING },
    winter_image_id: { type: DataTypes.STRING },
    winter_image_url: { type: DataTypes.STRING },
    spring_image_id: { type: DataTypes.STRING },
    spring_image_url: { type: DataTypes.STRING },
    fall_image_id: { type: DataTypes.STRING },
    fall_image_url: { type: DataTypes.STRING },
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

  WaifuModel.hasMany(WaifuTypeModel, { foreignKey: 'waifu_type_id' });
  WaifuModel.hasMany(FranchiseModel, { foreignKey: 'franchise_id' });

  return WaifuModel;
};