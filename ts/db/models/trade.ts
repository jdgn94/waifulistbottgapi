'use strict';

import { Model, Sequelize, Optional, literal, DataTypes } from 'sequelize';

interface TradeAttributes {
  id: number;
  message_id: string;
  waifu_emiter_id: number;
  waifu_receptor_id: number;
  chat_id: number;
  complete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TradeCreationAttributes extends Optional<TradeAttributes, 'id' | 'complete' | 'createdAt' | 'updatedAt'> { }

export interface TradeInstance extends Model<TradeAttributes, TradeCreationAttributes>, TradeAttributes { }

export default (sequelize: Sequelize) => {
  const TradeModel = sequelize.define<TradeInstance>('trade', {
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    message_id: { type: DataTypes.STRING },
    waifu_emiter_id: { type: DataTypes.INTEGER },
    waifu_receptor_id: { type: DataTypes.INTEGER },
    chat_id: { type: DataTypes.INTEGER },
    complete: { type: DataTypes.BOOLEAN, defaultValue: false },
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

  TradeModel.hasMany(sequelize.models.waifu, { foreignKey: 'waifu_emiter_id' });
  TradeModel.hasMany(sequelize.models.waifu, { foreignKey: 'waifu_receptor_id' });
  TradeModel.hasMany(sequelize.models.chat, { foreignKey: 'chat_id' });

  return TradeModel;
};