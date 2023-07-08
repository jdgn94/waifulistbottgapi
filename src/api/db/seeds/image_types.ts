import { ImageTypeInput, ImageTypeModel } from "../models/image_type.model";

const imageTypes: ImageTypeInput[] = [
  { id: 1, name: "Normal" },
  { id: 2, name: "Special", icon: "🌟" },
  { id: 3, name: "Winter", icon: "❄️" },
  { id: 4, name: "Winter Special", icon: "❄️ 🌟" },
  { id: 5, name: "Spring", icon: "🌻" },
  { id: 6, name: "Spring Special", icon: "🌻 🌟" },
  { id: 7, name: "Summer", icon: "🏖️" },
  { id: 8, name: "Summer Special", icon: "🏖️ 🌟" },
  { id: 9, name: "Fall", icon: "🍁" },
  { id: 10, name: "FallSpecial", icon: "🍁 🌟" },
  { id: 11, name: "Halloween", icon: "🎃" },
  { id: 12, name: "Halloween Special", icon: "🎃 🌟" },
  { id: 13, name: "New Year", icon: "🎆" },
  { id: 14, name: "New Year Special", icon: "🎇 🌟" },
  { id: 15, name: "Christmas", icon: "🎄" },
  { id: 16, name: "Christmas Special", icon: "🎄 🌟" },
  { id: 17, name: "San Valentin", icon: "💘" },
  { id: 18, name: "San Valentin Special", icon: "💘 🌟" },
  { id: 19, name: "Bot Birthday", icon: "🎂" },
  { id: 20, name: "Bot Birthday Special", icon: "🎂 🌟" },
];

const insert = async () => {
  await ImageTypeModel.bulkCreate(imageTypes, { updateOnDuplicate: ["id"] });
};

export default insert;
