import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStateContext } from "../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const NotificationMessage = () => {
  const queryClient = useQueryClient();
  const { handleClick } = useStateContext();
  const navigate = useNavigate();
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["messageNotifications"],
    queryFn: async () => {
      const res = await fetch("/api/messageNotifications", { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
      return data;
    },
    initialData: [],
  });
  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/messageNotifications", { method: "DELETE", credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete messages");
      return data;
    },
    onSuccess: () => {
      toast.success("Message notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["messageNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadMessageNotifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-lg dark:text-gray-200">Messages</p>
        <button
          className="text-sm text-red-500"
          onClick={() => deleteNotifications()}
        >
          Delete all
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 />
        </div>
      ) : notifications?.length === 0 ? (
        <div className="text-center p-4 font-bold">No messages 🤔</div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification._id}
            className="border-b border-gray-700 p-4 hover:bg-light-gray cursor-pointer"
            onClick={() => {
              setSelectedUser(notification.from);
              handleClick("chat");
              navigate("/chat");
            }}
          >
            <div className="flex gap-2">
              <div className="avatar">
                <div className="w-8 rounded-full">
                  <img
                    src={
                      notification.from.profileImg || "/avatar-placeholder.png"
                    }
                    alt="sender"
                  />
                </div>
              </div>
              <div>
                <Link
                  to={`/profile/${notification.from.username}`}
                  className="font-bold text-primary"
                >
                  @{notification.from.username}
                </Link>
                <p className="text-gray-600 dark:text-gray-200 break-words">
                  {notification.message}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationMessage;
