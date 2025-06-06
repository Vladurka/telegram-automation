import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { Group } from "../models/group.model.js";

dotenv.config();

const token = process.env.TELEGRAM_TOKEN;
export const bot = new TelegramBot(token, { polling: true });

bot.on("message", async (msg) => {
  if (msg.chat.type !== "group" && msg.chat.type !== "supergroup") return;

  const chatId = msg.chat.id;
  const title =
    msg.chat.title ||
    msg.chat.username ||
    `${msg.chat.first_name ?? ""} ${msg.chat.last_name ?? ""}`.trim() ||
    "Без назви";

  const exists = await Group.exists({ id: chatId });
  if (!exists) {
    await Group.create({ id: chatId, title });
    console.log(`✅ Group saved: ${chatId} - ${title}`);
  }
});
