import { Model, DataTypes, Optional, literal, Sequelize } from "sequelize";
import { WaifuRarityModel } from "./waifu_rarity.model";

interface RarityAttributes {
  id: number;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RarityInput
  extends Optional<RarityAttributes, "id" | "createdAt" | "updatedAt"> {}

export interface RarityOutput
  extends Model<RarityAttributes, RarityInput>,
    RarityAttributes {
  WaifuRarities?: WaifuRarityModel[];
}

export class RarityModel
  extends Model<RarityAttributes, RarityInput>
  implements RarityAttributes
{
  public id!: number;
  public name!: string;
  public icon!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

const createModel = (sequelize: Sequelize) => {
  RarityModel.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: literal("CURRENT_TIMESTAMP()"),
        onUpdate: "NOW()",
      },
    },
    {
      tableName: "rarities",
      timestamps: false,
      paranoid: true,
      modelName: "Rarities",
      sequelize,
    }
  );
};

export default createModel;
