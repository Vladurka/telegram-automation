import { Group } from "../models/group.model.js";

export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find().select("id title -_id");
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: "Failed to get groups." });
  }
};
