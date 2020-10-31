'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class waifu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  waifu.init({
    name: DataTypes.STRING,
    nickname: DataTypes.STRING,
    age: DataTypes.INTEGER,
    servant: DataTypes.BOOLEAN,
    waifu_type_id: DataTypes.INTEGER,
    franchise_id: DataTypes.INTEGER,
    public_id: DataTypes.STRING,
    image_url: DataTypes.STRING,
    fav_public_id: DataTypes.STRING,
    fav_image_url: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'waifu',
  });
  return waifu;
};