'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class bet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  bet.init({
    user_info_id: DataTypes.INTEGER,
    franchise_id: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'bet',
  });
  return bet;
};