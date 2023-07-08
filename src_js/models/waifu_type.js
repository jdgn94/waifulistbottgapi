'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class waifu_type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  waifu_type.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'waifu_type',
  });
  return waifu_type;
};