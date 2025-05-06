import { useRef, useState } from "react";
import { Image, Send, X, Smile, Paperclip } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "../../store/useChatStore";

const MessageInput = ({ socket }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const { addMessage, selectedUser } = useChatStore();
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    // Create a new message object
    const newMessage = {
      _id: crypto.randomUUID(), // Unique ID for local state
      text: text.trim(),
      image: imagePreview,
      senderId: authUser._id,
      receiverId: selectedUser._id, // Get receiver ID from the store
      createdAt: new Date().toISOString(),
    };

    try {
      // Add the message to local state (optimistic update)
      addMessage(newMessage);

      // Emit the message to the server via socket
      if (socket) {
        socket.emit("sendMessage", newMessage);
      }

      // Clear input fields
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="p-4 w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2">
          {/* Emoji Button */}
          <button
            type="button"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Smile size={20} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            className="w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* Image Upload Button */}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors ${
              imagePreview ? "text-green-500 dark:text-green-400" : ""
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>

          {/* Attachment Button */}
          <button
            type="button"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <Paperclip size={20} />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          className={`p-2 rounded-full ${
            text.trim() || imagePreview
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
          } transition-colors`}
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
