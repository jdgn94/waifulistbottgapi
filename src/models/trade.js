'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class trade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  trade.init({
    message_id: DataTypes.STRING,
    waifu_emiter_id: DataTypes.INTEGER,
    waifu_receptor_id: DataTypes.INTEGER,
    chat_id: DataTypes.INTEGER,
    complete: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'trade',
  });
  return trade;
};