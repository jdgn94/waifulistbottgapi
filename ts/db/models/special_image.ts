'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

interface SpecialImageAttributes {
  id: number;
  franchise_id: number;
  public_id: string;
  image_url: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SpecialImageCreationAttributes extends Optional<SpecialImageAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export interface SpecialImageInstance extends Model<SpecialImageAttributes, SpecialImageCreationAttributes>, SpecialImageAttributes { }

export default (sequelize: Sequelize) => {
  const SpecialImageModel = sequelize.define<SpecialImageInstance>('special_image', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    franchise_id: { type: DataTypes.INTEGER },
    public_id: { type: DataTypes.STRING },
    image_url: { type: DataTypes.STRING },
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

  SpecialImageModel.hasMany(sequelize.models.franchise, { foreignKey: 'franchise_id' });

  return SpecialImageModel;
};