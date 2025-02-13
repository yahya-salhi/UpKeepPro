import User from "../models/user.modal.js";
import Message from "../models/message.modal.js";
export const getUsersForSidebar = async (req, res) => {
  try {
    const currentUserId = req.user._id; // assuming you're storing the logged-in user's ID in req.user
    const filteredUsers = await User.find({
      _id: { $ne: currentUserId },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

//getMessage controller
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;
    // Find messages for the user
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: senderId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

//sendMessage
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;
    const recipient = await User.findById(id);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    let file;
    if (req.file) {
      file = req.file;
    }

    const newMessage = new Message({
      sender: senderId,
      recipient: id,
      message,
      file: file ? file.buffer : null,
      fileType: file ? file.mimetype : null,
    });

    await newMessage.save();

    //todo realtime functionallity goes here socket io
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
