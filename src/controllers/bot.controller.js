import { bot } from "../utils/bot.js";
import { Group } from "../models/group.model.js";
import { sendMessageToTelegram } from "../utils/telegram.js";

export const sendMessageToGroups = async (req, res) => {
  const { message, groupIds: incomingGroupIds } = req.body;

  if (typeof message !== "string" || !message.trim()) {
    return res
      .status(400)
      .json({ error: "Message must be a non-empty string." });
  }

  const groupIds =
    Array.isArray(incomingGroupIds) && incomingGroupIds.length > 0
      ? incomingGroupIds
      : (await Group.find().select("id -_id")).map((g) => g.id);

  if (!Array.isArray(groupIds) || groupIds.length === 0) {
    return res
      .status(400)
      .json({ error: "groupIds must be a non-empty array." });
  }

  try {
    const groupsFromDb = await Group.find({ id: { $in: groupIds } }).select(
      "id title -_id"
    );
    const nameMap = {};
    groupsFromDb.forEach((g) => {
      nameMap[g.id] = g.title;
    });

    const results = [];

    await Promise.all(
      groupIds.map(async (groupId) => {
        const label = nameMap[groupId] || `Group ${groupId}`;
        try {
          await bot.sendMessage(groupId, message);
          console.log(`✅ Sent to ${label}`);
          results.push({ group: label, status: "✅ Успіх" });
        } catch (err) {
          const errorText = err.response?.body?.description || err.message;

          if (
            errorText.includes("bot was kicked") ||
            errorText.includes("bot was removed") ||
            errorText.includes("bot can't initiate conversation")
          ) {
            await Group.deleteOne({ id: groupId });
            console.warn(`⚠️ Bot removed from ${label}. Group deleted.`);
          }

          console.error(`❌ Failed to send to ${label}: ${errorText}`);
          results.push({
            group: label,
            status: "❌ Помилка",
            error: errorText,
          });
        }
      })
    );

    const successGroups = results
      .filter((r) => r.status === "✅ Успіх")
      .map((r) => r.group);

    const failedGroups = results
      .filter((r) => r.status === "❌ Помилка")
      .map((r) => `${r.group} (${r.error})`);

    const summary = `📤 Повідомлення "${message}" надіслано до ${
      successGroups.length
    }/${groupIds.length} груп.
 ✅ Успішно: ${successGroups.join(", ") || "-"}
 ❌ Помилки: ${failedGroups.join(", ") || "-"}`;

    await sendMessageToTelegram(summary);

    return res.status(200).json({
      message: "Message sending completed",
      results,
    });
  } catch (error) {
    console.error("❌ Critical error during send:", error);
    return res.status(500).json({ error: "Failed to send message to groups" });
  }
};
