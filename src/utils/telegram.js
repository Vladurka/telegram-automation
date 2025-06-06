import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const sendMessageToTelegram = async (message) => {
  try {
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${process.env.TELEGRAM_CHAT_ID}&text=${message}`
    );
  } catch (error) {
    console.error("❌ Failed to send message:" + message);
  }
};
