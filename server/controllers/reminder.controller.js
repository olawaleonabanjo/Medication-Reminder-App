import Reminder from "../models/reminder.model.js";

export const createReminder = async (req, res) => {
  try {
    const reminder = await Reminder.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, reminder });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id });
    res.json({ success: true, reminders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
