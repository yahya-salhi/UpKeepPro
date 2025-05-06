import { createContext, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/messages/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Network response was not ok");
    }
  };

  const fetchMessages = async ({ queryKey }) => {
    const [, userId] = queryKey;
    const response = await axios.get(`/api/messages/${userId}`);
    if (response.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return response.data;
  };

  const sendMessage = async ({ userId, message }) => {
    const response = await axios.post(`/api/messages/send/${userId}`, {
      message,
    });
    if (response.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return response.data;
  };

  const { data: users = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    onError: (error) => toast.error(error.message),
  });

  const { data: messages = [], isLoading: isMessagesLoading } = useQuery({
    queryKey: ["messages", selectedUser?._id],
    queryFn: fetchMessages,
    enabled: !!selectedUser,
    onError: (error) => toast.error(error.message),
  });

  const mutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", selectedUser?._id]);
      toast.success("Message sent successfully");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSendMessage = (message) => {
    if (selectedUser) {
      mutation.mutate({ userId: selectedUser._id, message });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        users,
        isUsersLoading,
        messages,
        isMessagesLoading,
        selectedUser,
        setSelectedUser,
        handleSendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
