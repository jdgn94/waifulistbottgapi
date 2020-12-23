'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class user_special_list extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  user_special_list.init({
    special_images_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    chat_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'user_special_list',
  });
  return user_special_list;
};