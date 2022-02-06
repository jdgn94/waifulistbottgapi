'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

interface FranchiseAttributes {
  id: number;
  name: string;
  nickname: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FranchiseCreationAttributes extends Optional<FranchiseAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export interface FranchiseInstance extends Model<FranchiseAttributes, FranchiseCreationAttributes>, FranchiseAttributes { }

export default (sequelize: Sequelize) => {
  const FranchiseModel = sequelize.define<FranchiseInstance>('franchise', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: { type: DataTypes.STRING },
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
  return FranchiseModel;
};