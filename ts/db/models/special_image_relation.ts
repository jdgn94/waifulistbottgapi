'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

import SpecialImage from './special_image';
import Waifu from './waifu';


interface SpecialImageRelationAttributes {
  id: number;
  special_image_id: number;
  waifu_id: number;
  createdAt: Date;
  updatedAt: Date;
}

interface SpecialImageRelationCreationAttributes extends Optional<SpecialImageRelationAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export interface SpecialImageRelationInstance extends Model<SpecialImageRelationAttributes, SpecialImageRelationCreationAttributes>, SpecialImageRelationAttributes { }

export default (sequelize: Sequelize) => {
  const WaifuModel = Waifu(sequelize);
  const SpecialImageModel = SpecialImage(sequelize);

  const SpecialImageRelationModel = sequelize.define<SpecialImageRelationInstance>('special_image_relation', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    special_image_id: { type: DataTypes.INTEGER },
    waifu_id: { type: DataTypes.INTEGER },
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

  SpecialImageRelationModel.hasMany(WaifuModel, { foreignKey: 'special_image_id' });
  SpecialImageRelationModel.hasMany(SpecialImageModel, { foreignKey: 'waifu_id' });

  return SpecialImageRelationModel;
};