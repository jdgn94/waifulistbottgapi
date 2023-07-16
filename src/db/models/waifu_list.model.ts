import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { UserModel } from "./user.model";
import { WaifuRarityModel } from "./waifu_rarity.model";
import { TradeModel } from "./trade.model";
import { WaifuFavoriteListModel } from "./waifu_favorite_list.model";

interface WaifuListAttributes {
  id: number;
  userId: number;
  waifuRarityId: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WaifuListInput
  extends Optional<WaifuListAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface WaifuListOutput
  extends Model<WaifuListAttributes, WaifuListInput>,
    WaifuListAttributes {
  User?: UserModel;
  WaifuRarity?: WaifuRarityModel;
  WaifuEmitters?: TradeModel[];
  WaifuReceptors?: TradeModel[];
  WaifuFavoriteLists?: WaifuFavoriteListModel[];
}

export class WaifuListModel
  extends Model<WaifuListAttributes, WaifuListInput>
  implements WaifuListAttributes
{
  public id!: number;
  public userId!: number;
  public waifuRarityId!: number;
  public quantity!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  WaifuListModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: { model: UserModel, key: "id" },
      },
      waifuRarityId: {
        type: DataTypes.INTEGER.UNSIGNED,
        references: { model: WaifuRarityModel, key: "id" },
      },
      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
        onUpdate: "NOW()",
      },
    },
    {
      tableName: "waifu_lists",
      timestamps: false,
      paranoid: true,
      modelName: "WaifuLists",
      indexes: [
        {
          name: "waifu_lists",
          unique: true,
          fields: [{ name: "user_id" }, { name: "waifu_rarity_id" }],
        },
      ],
      sequelize,
    }
  );

  WaifuListModel.hasOne(UserModel, {
    foreignKey: "id",
    sourceKey: "userId",
    as: "User",
    constraints: false,
  });
  WaifuListModel.hasOne(WaifuRarityModel, {
    foreignKey: "id",
    sourceKey: "waifuRarityId",
    as: "WaifuRarity",
    constraints: false,
  });

  UserModel.hasMany(WaifuListModel, {
    foreignKey: "userId",
    sourceKey: "id",
    constraints: false,
  });
  WaifuRarityModel.hasMany(WaifuListModel, {
    foreignKey: "waifuRarityId",
    sourceKey: "id",
    constraints: false,
  });
};

export default createModel;
