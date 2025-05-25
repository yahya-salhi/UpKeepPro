import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { IoSettingsOutline } from "react-icons/io5";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import avatar from "../../data/avatar.jpg";
const NotificationPage = () => {
  const queryClient = useQueryClient();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });
  const { mutate: deleteNotifications } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notifications", {
          method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      toast.success("Notifications deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#23272F] p-8 rounded-2xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <p className="font-semibold text-xl dark:text-gray-100 tracking-tight font-['Roboto','Inter','sans-serif']">
            Notifications
          </p>
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#32363F] transition-colors"
            >
              <IoSettingsOutline className="w-5 h-5 text-gray-500 dark:text-gray-300" />
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-lg bg-white dark:bg-[#23272F] rounded-xl w-56 border border-gray-200 dark:border-gray-700"
            >
              <li>
                <button
                  className="text-center w-full py-2 text-red-500 hover:bg-gray-50 dark:hover:bg-[#32363F] rounded transition-colors font-medium"
                  onClick={deleteNotifications}
                >
                  Delete all notifications
                </button>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="animate-spin text-primary w-7 h-7" />
          </div>
        )}
        {!isLoading && notifications?.length === 0 && (
          <div className="text-center p-6 font-semibold text-gray-400 dark:text-gray-500 text-lg">
            No notifications 🤔
          </div>
        )}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {notifications?.map((notification) => (
            <div
              className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-[#282C34] transition-colors cursor-pointer group"
              key={notification._id}
            >
              <Link
                to={`/profile/${notification.from.username}`}
                className="flex items-center gap-3 flex-1 min-w-0"
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
                  <span className="text-sm text-gray-500 dark:text-gray-300 mt-0.5 flex items-center gap-1">
                    {notification.type === "follow" && (
                      <>
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mr-1"></span>
                        <span>started following you</span>
                      </>
                    )}
                    {notification.type === "like" && (
                      <>
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                        <span>liked your post</span>
                      </>
                    )}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
export default NotificationPage;
