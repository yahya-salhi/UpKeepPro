import MessageNotification from "../models/messagenotification.modal.js";

export const getMessageNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await MessageNotification.find({
      to: userId,
    }).populate({
      path: "from",
      select: "username profileImg",
    });

    await MessageNotification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getMessageNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMessageNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await MessageNotification.deleteMany({ to: userId });

    res
      .status(200)
      .json({ message: "Message notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessageNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getUnreadMessageNotifications = async (req, res) => {
  try {
    const unreadCount = await MessageNotification.countDocuments({
      to: req.user._id,
      read: false,
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markMessageNotificationsAsRead = async (req, res) => {
  try {
    await MessageNotification.updateMany(
      { to: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Message notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
