import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { formatMessageTime } from "../../utils/date";
import { useChatStore } from "../../store/useChatStore";
import avatar from "../../data/avatar.jpg";

const ChatContainer = () => {
  const { messages, addMessage, getMessages, isMessagesLoading, selectedUser } =
    useChatStore();
  const messageEndRef = useRef(null);
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);
  const prevMessagesLength = useRef(messages.length);
  const socketRef = useRef(null); // Store socket in a ref

  // Initialize socket
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket", "polling"], // Allow both transports for Firefox compatibility
      forceNew: true,
      reconnection: true,
      timeout: 5000,
    }); // Initialize socket and store it in the ref

    // Set up connection and error handling
    socketRef.current.on("connect", () => {
      console.log("Connected to socket server");
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect(); // Disconnect socket
        socketRef.current = null; // Clear the ref
      }
    };
  }, []);

  // Join room when authUser changes
  useEffect(() => {
    if (authUser?._id && socketRef.current) {
      socketRef.current.emit("joinRoom", authUser._id); // Join room with user ID
    }
  }, [authUser?._id]);

  // Fetch messages and set up message listener when selectedUser changes
  useEffect(() => {
    if (!authUser || !selectedUser) return; // Wait for authUser and selectedUser

    // Fetch messages for the selected user
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }

    // Handle incoming messages
    const handleNewMessage = (newMessage) => {
      if (
        newMessage.senderId === selectedUser._id ||
        newMessage.receiverId === selectedUser._id
      ) {
        addMessage(newMessage);
      }
    };

    const socket = socketRef.current; // Access socket from the ref

    if (socket) {
      socket.off("receiveMessage", handleNewMessage); // Clean up previous listener
      socket.on("receiveMessage", handleNewMessage); // Add new listener
    }

    // Clean up listener when selectedUser changes or component unmounts
    return () => {
      if (socket) {
        socket.off("receiveMessage", handleNewMessage); // Cleanup old listeners
      }
    };
  }, [selectedUser?._id, addMessage, getMessages, authUser, selectedUser]);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (
      messageEndRef.current &&
      messages.length !== prevMessagesLength.current
    ) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      prevMessagesLength.current = messages.length;
    }
  }, [messages.length]); // Only depend on the length of messages

  // Show loading skeleton while messages are being fetched
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto bg-gray-50 dark:bg-gray-900">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput socket={socketRef.current} />{" "}
        {/* Pass socket to MessageInput */}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-gray-50 dark:bg-gray-900">
      <ChatHeader />
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm">
              Start a conversation with {selectedUser.username}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.senderId === authUser._id
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`flex max-w-[80%] ${
                  message.senderId === authUser._id
                    ? "flex-row-reverse"
                    : "flex-row"
                } gap-2`}
              >
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  <img
                    src={
                      message.senderId === authUser._id
                        ? authUser.profileImg || avatar
                        : selectedUser.profileImg || avatar
                    }
                    alt="profile pic"
                    className="size-8 rounded-full border border-gray-200 dark:border-gray-600"
                  />
                </div>

                {/* Message Content */}
                <div
                  className={`flex flex-col ${
                    message.senderId === authUser._id
                      ? "items-end"
                      : "items-start"
                  }`}
                >
                  {/* Message Header (Timestamp) */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {formatMessageTime(message.createdAt)}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.senderId === authUser._id
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-[200px] rounded-lg mb-2"
                      />
                    )}
                    {message.text && <p>{message.text}</p>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messageEndRef} />
      </div>
      {/* Message Input */}
      <MessageInput socket={socketRef.current} />{" "}
      {/* Pass socket to MessageInput */}
    </div>
  );
};

export default ChatContainer;
