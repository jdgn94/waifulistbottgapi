"use strict";

import { Sequelize, ModelStatic } from "sequelize";

import ActiveModel, { ActiveInstance } from "./active";
import BetModel, { BetInstance } from "./bet";
import ChatModel, { ChatInstance } from "./chat";
import FranchiseModel, { FranchiseInstance } from "./franchise";
import SpecialImageRelationModel, {
  SpecialImageRelationInstance,
} from "./special_image_relation";
import SpecialImageModel, { SpecialImageInstance } from "./special_image";
import TradeModel, { TradeInstance } from "./trade";
import UserInfoModel, { UserInfoInstance } from "./user_info";
import UserSpecialListModel, {
  UserSpecialListInstance,
} from "./user_special_list";
import UserModel, { UserInstance } from "./user";
import WaifuFavoriteListModel, {
  WaifuFavoriteListInstance,
} from "./waifu_favorite_list";
import WaifuListModel, { WaifuListInstance } from "./waifu_list";
import WaifuTypeModel, { WaifuTypeInstance } from "./waifu_type";
import WaifuModel, { WaifuInstance } from "./waifu";

interface SequelizeInterface {
  sequelize: Sequelize;
  ActiveModel: ModelStatic<ActiveInstance>;
  BetModel: ModelStatic<BetInstance>;
  ChatModel: ModelStatic<ChatInstance>;
  FranchiseModel: ModelStatic<FranchiseInstance>;
  SpecialImageRelationModel: ModelStatic<SpecialImageRelationInstance>;
  SpecialImageModel: ModelStatic<SpecialImageInstance>;
  TradeModel: ModelStatic<TradeInstance>;
  UserInfoModel: ModelStatic<UserInfoInstance>;
  UserSpecialListModel: ModelStatic<UserSpecialListInstance>;
  UserModel: ModelStatic<UserInstance>;
  WaifuFavoriteListModel: ModelStatic<WaifuFavoriteListInstance>;
  WaifuListModel: ModelStatic<WaifuListInstance>;
  WaifuTypeModel: ModelStatic<WaifuTypeInstance>;
  WaifuModel: ModelStatic<WaifuInstance>;
}

var config;
switch (process.env.NODE_ENV) {
  case "production":
    config = require(__dirname + "/../config/config.js").production;
    break;
  case "test":
    config = require(__dirname + "/../config/config.js").test;
    break;
  default:
    config = require(__dirname + "/../config/config.js").development;
    break;
}
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db: SequelizeInterface = {
  sequelize,
  ActiveModel: ActiveModel(sequelize),
  BetModel: BetModel(sequelize),
  ChatModel: ChatModel(sequelize),
  SpecialImageRelationModel: SpecialImageRelationModel(sequelize),
  SpecialImageModel: SpecialImageModel(sequelize),
  FranchiseModel: FranchiseModel(sequelize),
  TradeModel: TradeModel(sequelize),
  UserInfoModel: UserInfoModel(sequelize),
  UserSpecialListModel: UserSpecialListModel(sequelize),
  UserModel: UserModel(sequelize),
  WaifuFavoriteListModel: WaifuFavoriteListModel(sequelize),
  WaifuListModel: WaifuListModel(sequelize),
  WaifuTypeModel: WaifuTypeModel(sequelize),
  WaifuModel: WaifuModel(sequelize),
};

Object.values(db).forEach((model: any) => {
  if (model.associate) {
    model.associate(db);
  }
});

export default db;
