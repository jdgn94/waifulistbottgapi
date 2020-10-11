'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class active extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  active.init({
    chat_id: DataTypes.INTEGER,
    waifu_id: DataTypes.INTEGER,
    attempts: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'active',
  });
  return active;
};