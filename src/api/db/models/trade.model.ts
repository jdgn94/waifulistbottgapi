import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";

import { ChatModel } from "./chat.model";
import { WaifuListModel } from "./waifu_list.model";

interface TradeAttributes {
  id: number;
  messageId: string;
  waifuEmitterId: number;
  waifuReceptorId: number;
  chatId: number;
  complete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TradeInput
  extends Optional<
    TradeAttributes,
    "id" | "complete" | "createdAt" | "updatedAt"
  > {}

export interface TradeOutput
  extends Model<TradeAttributes, TradeInput>,
    TradeAttributes {
  Chat?: ChatModel;
  WaifuEmitter?: WaifuListModel;
  WaifuReceptor?: WaifuListModel;
}

export class TradeModel
  extends Model<TradeAttributes, TradeInput>
  implements TradeAttributes
{
  public id!: number;
  public messageId!: string;
  public waifuEmitterId!: number;
  public waifuReceptorId!: number;
  public chatId!: number;
  public complete!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  TradeModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      waifuEmitterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: WaifuListModel },
        key: "id",
      },
      waifuReceptorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: WaifuListModel },
        key: "id",
      },
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: ChatModel },
        key: "id",
      },
      messageId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      complete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      tableName: "trades",
      timestamps: false,
      paranoid: true,
      modelName: "Trades",
      sequelize,
    }
  );

  TradeModel.hasOne(WaifuListModel, {
    foreignKey: "id",
    sourceKey: "waifuEmitterId",
    as: "WaifuEmitters",
  });
  TradeModel.hasOne(WaifuListModel, {
    foreignKey: "id",
    sourceKey: "waifuReceptorId",
    as: "WaifuReceptors",
  });
  TradeModel.hasOne(ChatModel, {
    foreignKey: "id",
    sourceKey: "chatId",
    as: "Chat",
  });

  WaifuListModel.hasMany(TradeModel, {
    foreignKey: "waifuEmitterId",
    sourceKey: "id",
    as: "WaifuEmitters",
  });
  WaifuListModel.hasMany(TradeModel, {
    foreignKey: "waifuReceptorId",
    sourceKey: "id",
    as: "WaifuReceptors",
  });
  ChatModel.hasMany(TradeModel, {
    foreignKey: "chatId",
    sourceKey: "id",
  });
};

export default createModel;
