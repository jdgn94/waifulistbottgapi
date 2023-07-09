import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { ChatModel } from "./chat.model";
import { WaifuRarityModel, WaifuRarityOutput } from "./waifu_rarity.model";

interface ActiveAttributes {
  id: number;
  chatId: number;
  waifuRarityId: number;
  attempts: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ActiveInput
  extends Optional<
    ActiveAttributes,
    "id" | "attempts" | "createdAt" | "updatedAt"
  > {}

export interface ActivesOutput
  extends Model<ActiveAttributes, ActiveInput>,
    ActiveAttributes {
  Chat?: ChatModel;
  WaifuRarity?: WaifuRarityOutput;
}

export class ActiveModel
  extends Model<ActiveAttributes, ActiveInput>
  implements ActiveAttributes
{
  public id!: number;
  public chatId!: number;
  public waifuRarityId!: number;
  public attempts!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  ActiveModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      chatId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: ChatModel, key: "id" },
      },
      waifuRarityId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: WaifuRarityModel, key: "id" },
      },
      attempts: {
        type: DataTypes.DATE,
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
      tableName: "actives",
      timestamps: false,
      paranoid: true,
      modelName: "Actives",
      sequelize,
    }
  );

  ActiveModel.hasOne(ChatModel, {
    foreignKey: "id",
    sourceKey: "chatId",
    as: "Chat",
    constraints: false,
  });
  ActiveModel.hasOne(WaifuRarityModel, {
    foreignKey: "id",
    sourceKey: "waifuRarityId",
    as: "WaifuRarity",
    constraints: false,
  });

  ChatModel.hasMany(ActiveModel, {
    foreignKey: "chatId",
    sourceKey: "id",
    constraints: false,
  });
  WaifuRarityModel.hasMany(ActiveModel, {
    foreignKey: "waifuRarityId",
    sourceKey: "id",
    constraints: false,
  });
};

export default createModel;
