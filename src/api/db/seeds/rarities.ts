import { RarityInput, RarityModel } from "../models/rarity.model";

const rarities: RarityInput[] = [
  { id: 1, name: "Normal", icon: "⚪" },
  { id: 2, name: "Rare", icon: "🟣" },
  { id: 3, name: "Legendary", icon: "🟡" },
];

const insert = async () => {
  await RarityModel.bulkCreate(rarities, { updateOnDuplicate: ["id"] });
};

export default insert;
