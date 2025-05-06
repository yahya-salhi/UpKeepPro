import Notification from "../models/notification.modal.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });

    res.status(200).json(notifications);
  } catch (error) {
    console.log("Error in getNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({ to: userId });

    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotifications function", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
//getUnreadNotifications controller
export const getUnreadNotifications = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      to: req.user._id,
      read: false, // Count only unread notifications
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//when a user reads the notifications, we need to mark them as read
export const markNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { to: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
