'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

import UserInfo from './user_info';
import Franchise from './franchise';

interface BetAttributes {
  id: number;
  user_info_id: number;
  franchise_id: number;
  quantity: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BetCreationAttributes extends Optional<BetAttributes, 'id' | 'createdAt' | 'updatedAt'> { }

export interface BetInstance extends Model<BetAttributes, BetCreationAttributes>, BetAttributes { }

export default (sequelize: Sequelize) => {
  const UserInfoModel = UserInfo(sequelize);
  const FranchiseModel = Franchise(sequelize);

  const BetModel = sequelize.define<BetInstance>('bet', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_info_id: { type: DataTypes.INTEGER },
    franchise_id: { type: DataTypes.INTEGER },
    quantity: { type: DataTypes.INTEGER },
    active: { type: DataTypes.BOOLEAN },
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

  BetModel.hasMany(UserInfoModel, { foreignKey: 'user_info_id' });
  BetModel.hasMany(FranchiseModel, { foreignKey: 'franchise_id' });

  return BetModel;
};