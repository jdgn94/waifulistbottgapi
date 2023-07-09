import { Markup } from "telegraf";
import i18n from "../../config/i18n";

const mainMenuButtons = () =>
  Markup.keyboard([
    ["button 1", "button 2"],
    ["button 3", "button 4"],
    ["button 5", "button 6", `⚙️ ${i18n.__("settings")}`],
  ]).resize();

const settingsMenuButtons = () =>
  Markup.keyboard([
    [`💬 ${i18n.__("changeLanguage")}`],
    [`🔙 ${i18n.__("back")}`],
  ]).resize();

export default { mainMenuButtons, settingsMenuButtons };
