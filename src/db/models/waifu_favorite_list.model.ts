import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { WaifuListModel } from "./waifu_list.model";

interface WaifuFavoriteListAttributes {
  id: number;
  waifuListId: number;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WaifuFavoriteListInput
  extends Optional<
    WaifuFavoriteListAttributes,
    "id" | "createdAt" | "updatedAt"
  > {}

export interface WaifuFavoriteListOutput
  extends Model<WaifuFavoriteListAttributes, WaifuFavoriteListInput>,
    WaifuFavoriteListAttributes {
  WaifuLists?: WaifuListModel;
}

export class WaifuFavoriteListModel
  extends Model<WaifuFavoriteListAttributes, WaifuFavoriteListInput>
  implements WaifuFavoriteListInput
{
  public id!: number;
  public waifuListId!: number;
  public position!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  WaifuFavoriteListModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      waifuListId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: WaifuListModel, key: "id" },
      },
      position: {
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
      tableName: "waifu_favorite_lists",
      timestamps: false,
      paranoid: true,
      modelName: "WaifuFavoriteLists",
      sequelize,
    }
  );

  WaifuFavoriteListModel.hasOne(WaifuListModel, {
    foreignKey: "id",
    sourceKey: "waifuListId",
    as: "WaifuList",
    constraints: false,
  });

  WaifuListModel.hasMany(WaifuFavoriteListModel, {
    foreignKey: "waifuListId",
    sourceKey: "id",
    constraints: false,
  });
};

export default createModel;
