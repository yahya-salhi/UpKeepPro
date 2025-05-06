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

// Get Messages controller
export const getMessages = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).lean();

    const formattedMessages = messages.map((message) => ({
      ...message,
      image: message.image
        ? `data:image/png;base64,${message.image.toString("base64")}`
        : null,
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.error("Error in getMessages controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
//sendMessage

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Validate recipient
    const recipient = await User.findById(receiverId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Convert base64 image to Buffer (if image exists)
    let imageBuffer = null;
    if (image) {
      imageBuffer = Buffer.from(image, "base64");
    }

    // Create a new message
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageBuffer,
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
