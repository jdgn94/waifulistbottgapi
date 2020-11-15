'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_info extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user_info.init({
    user_id: DataTypes.INTEGER,
    chat_id: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
    exp: DataTypes.INTEGER,
    limit_exp: DataTypes.INTEGER,
    level: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'user_info',
  });
  return user_info;
};