import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";
import { WaifuModel } from "./waifu.model";

export interface WaifuTypeAttributes {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface WaifuTypeInput
  extends Optional<WaifuTypeAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface WaifuTypeOutput
  extends Model<WaifuTypeAttributes, WaifuTypeInput>,
    WaifuTypeAttributes {
  Waifus?: WaifuModel[];
}

export class WaifuTypeModel
  extends Model<WaifuTypeAttributes, WaifuTypeInput>
  implements WaifuTypeAttributes
{
  public id!: number;
  public name!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  WaifuTypeModel.init(
    {
      id: {
        allowNull: false,
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
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
      tableName: "waifu_types",
      timestamps: false,
      paranoid: true,
      modelName: "WaifuTypes",
      sequelize,
    }
  );
};

export default createModel;
