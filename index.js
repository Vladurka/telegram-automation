import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { sendMessageToGroups } from "./src/controllers/bot.controller.js";
import { getGroups } from "./src/controllers/group.controller.js";
import { connectDB } from "./src/utils/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/api/bot", sendMessageToGroups);
app.get("/api/groups", getGroups);

app.listen(port, () => {
  connectDB();
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
