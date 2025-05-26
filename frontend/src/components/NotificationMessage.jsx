import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStateContext } from "../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import avatar from "../data/avatar.jpg";

const NotificationMessage = () => {
  const queryClient = useQueryClient();
  const { setIsClicked, initialState, closeDropdownsAndNavigate } =
    useStateContext();
  const navigate = useNavigate();
  const setSelectedUser = useChatStore((state) => state.setSelectedUser);
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["messageNotifications"],
    queryFn: async () => {
      const res = await fetch("/api/messageNotifications", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
      return data;
    },
    initialData: [],
  });
  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/messageNotifications", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete messages");
      return data;
    },
    onSuccess: () => {
      toast.success("Message notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["messageNotifications"] });
      queryClient.invalidateQueries({
        queryKey: ["unreadMessageNotifications"],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div
      className="nav-item absolute right-1 top-16 bg-white dark:bg-[#23272F] p-8 rounded-2xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
      data-dropdown-content="true"
    >
      <div className="flex items-center justify-between mb-6">
        <p className="font-semibold text-xl dark:text-gray-100 tracking-tight font-['Roboto','Inter','sans-serif']">
          Messages
        </p>
        <button
          className="text-sm text-red-500 hover:underline hover:text-red-600 transition-colors font-medium"
          onClick={() => deleteNotifications()}
        >
          Delete all
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="animate-spin text-primary w-7 h-7" />
        </div>
      ) : notifications?.length === 0 ? (
        <div className="text-center p-6 font-semibold text-gray-400 dark:text-gray-500 text-lg">
          No messages 🤔
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#282C34] transition-colors cursor-pointer group"
              onClick={() => {
                setSelectedUser(notification.from);
                closeDropdownsAndNavigate(navigate, "/chat");
              }}
            >
              <Link
                to={`/profile/${notification.from.username}`}
                className="flex items-center gap-3 flex-1 min-w-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsClicked(initialState); // Close dropdown when navigating to profile
                }}
              >
                <div className="avatar relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40 dark:border-primary/60 shadow-md">
                    <img
                      src={notification.from.profileImg || avatar}
                      alt={notification.from.username}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col min-w-0 justify-center">
                  <span className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate font-['Roboto','Inter','sans-serif']">
                    @{notification.from.username}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-300 mt-0.5 break-words">
                    {notification.message}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationMessage;
