import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { WaifuModel } from "./waifu.model";
import { WaifuImageModel } from "./waifu_image.model";
import { RarityModel } from "./rarity.model";
import { ActiveModel } from "./active.model";
import { SpecialImageRelationModel } from "./special_image_relation.model";
import { WaifuListModel } from "./waifu_list.model";

export interface WaifuRarityAttributes {
  id: number;
  waifuId: number;
  waifuImageId: number;
  rarityId: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WaifuRarityInput
  extends Optional<WaifuRarityAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface WaifuRarityOutput
  extends Model<WaifuRarityAttributes, WaifuRarityInput>,
    WaifuRarityAttributes {
  ActiveModel?: ActiveModel[];
  Rarity?: RarityModel;
  SpecialImageRelations?: SpecialImageRelationModel[];
  Waifu?: WaifuModel;
  WaifuImage?: WaifuImageModel;
  WaifuLists?: WaifuListModel[];
}

export class WaifuRarityModel
  extends Model<WaifuRarityAttributes, WaifuRarityInput>
  implements WaifuRarityInput
{
  public id!: number;
  public waifuId!: number;
  public waifuImageId!: number;
  public rarityId!: number;
  public points!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  WaifuRarityModel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        autoIncrement: true,
        primaryKey: true,
        field: "id",
      },
      waifuId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: WaifuModel, key: "id" },
      },
      waifuImageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: WaifuImageModel, key: "id" },
      },
      rarityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: RarityModel, key: "id" },
      },
      points: {
        type: DataTypes.INTEGER,
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
      tableName: "waifu_rarities",
      timestamps: false,
      paranoid: true,
      modelName: "WaifuRarities",
      indexes: [
        {
          name: "waifu_rarities",
          fields: [
            { name: "waifu_id" },
            { name: "waifu_image_id" },
            { name: "rarity_id" },
          ],
          unique: true,
        },
      ],
      sequelize,
    }
  );

  WaifuRarityModel.hasOne(WaifuModel, {
    foreignKey: "id",
    sourceKey: "waifuId",
    as: "Waifu",
  });
  WaifuRarityModel.hasOne(RarityModel, {
    foreignKey: "id",
    sourceKey: "rarityId",
    as: "Rarity",
  });
  // WaifuRarityModel.hasOne(WaifuImageModel, {
  //   foreignKey: "id",
  //   sourceKey: "waifuImageId",
  //   as: "Rarity",
  // });

  WaifuModel.hasMany(WaifuRarityModel, {
    foreignKey: "waifuId",
    sourceKey: "id",
  });
  RarityModel.hasMany(WaifuRarityModel, {
    foreignKey: "rarityId",
    sourceKey: "id",
  });
  // WaifuImageModel.hasOne(WaifuRarityModel, {
  //   foreignKey: "waifuImageId",
  //   sourceKey: "id",
  //   as: "WaifuRarity",
  // });
};

export default createModel;
