import { Sequelize } from "sequelize";

import configs from "../config/config";

import createFranchise from "./franchise.model";
import createChat from "./chat.model";
import createWaifuType from "./waifu_type.model";
import createImageType from "./image_type.model";
import createWaifu from "./waifu.model";
import createWaifuImage from "./waifu_image.model";
import createRarity from "./rarity.model";
import createWaifuRarity from "./waifu_rarity.model";
import createUser from "./user.model";
import createWaifuList from "./waifu_list.model";
import createWaifuFavoriteList from "./waifu_favorite_list.model";
import createActive from "./active.model";
import createTrade from "./trade.model";
import createUserInfo from "./user_info.model";
import createSpecialImage from "./special_image.model";
import createSpecialImageRelation from "./special_image_relation.model";
import createBet from "./bet.model";

import insertFranchises from "../seeds/franchises";
import insertWaifuTypes from "../seeds/waifu_types";
import insertImageTypes from "../seeds/image_types";
import insertRarities from "../seeds/rarities";
import insertWaifusAndImages from "../seeds/waifus";
import insertSpecialImagesAndRelations from "../seeds/special_images";

let config;
switch (process.env.NODE_ENV) {
  case "production":
    config = configs.production;
    break;
  case "test":
    config = configs.test;
    break;
  default:
    config = configs.development;
    break;
}

let sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config.options,
    port: parseInt(config.port),
    pool: config.pool,
    dialectOptions: config.dialectOptions,
    define: config.define,
  }
);

// create tables
createFranchise(sequelize);
createWaifuType(sequelize);
createImageType(sequelize);
createWaifu(sequelize);
createRarity(sequelize);
createWaifuImage(sequelize);
createWaifuRarity(sequelize);
createChat(sequelize);
createUser(sequelize);
createWaifuList(sequelize);
createWaifuFavoriteList(sequelize);
createActive(sequelize);
createTrade(sequelize);
createUserInfo(sequelize);
createSpecialImage(sequelize);
createSpecialImageRelation(sequelize);
createBet(sequelize);

// insert seeds
export const insertMigrations = async () => {
  await insertFranchises();
  await insertWaifuTypes();
  await insertImageTypes();
  await insertRarities();
  await insertWaifusAndImages();
  await insertSpecialImagesAndRelations();
};

export default sequelize;
