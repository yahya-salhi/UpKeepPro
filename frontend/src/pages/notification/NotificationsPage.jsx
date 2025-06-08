import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { IoSettingsOutline } from "react-icons/io5";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useStateContext } from "../../contexts/ContextProvider";
import avatar from "../../data/avatar.jpg";
const NotificationPage = () => {
  const queryClient = useQueryClient();
  const { setIsClicked, initialState } = useStateContext();
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
      <div
        className="nav-item absolute right-1 top-16 bg-white dark:bg-[#23272F] p-8 rounded-2xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300"
        data-dropdown-content="true"
      >
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
              {notification.type === "event_reminder_1day" ||
              notification.type === "event_reminder_1hour" ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="avatar relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40 dark:border-primary/60 shadow-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 justify-center">
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate font-['Roboto','Inter','sans-serif']">
                      {notification.eventId?.title || "Event Reminder"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-300 mt-0.5 flex items-center gap-1">
                      {notification.type === "event_reminder_1day" && (
                        <>
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          <span>{notification.message}</span>
                        </>
                      )}
                      {notification.type === "event_reminder_1hour" && (
                        <>
                          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                          <span>{notification.message}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ) : notification.type === "file_submission" ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="avatar relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-400/40 dark:border-green-500/60 shadow-md bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 justify-center">
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate font-['Roboto','Inter','sans-serif']">
                      {notification.title || "File Submission"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-300 mt-0.5 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      <span>{notification.message}</span>
                    </span>
                  </div>
                </div>
              ) : notification.type === "task_assignment" ||
                notification.type === "task_update" ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="avatar relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400/40 dark:border-blue-500/60 shadow-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 justify-center">
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate font-['Roboto','Inter','sans-serif']">
                      {notification.type === "task_assignment"
                        ? "New Task Assignment"
                        : "Task Update"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-300 mt-0.5 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                      <span>{notification.message}</span>
                    </span>
                  </div>
                </div>
              ) : notification.type === "task_completion" ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="avatar relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-400/40 dark:border-green-500/60 shadow-md bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 justify-center">
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate font-['Roboto','Inter','sans-serif']">
                      Task Completed
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-300 mt-0.5 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                      <span>{notification.message}</span>
                    </span>
                  </div>
                </div>
              ) : notification.type === "task_edited" ? (
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="avatar relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-orange-400/40 dark:border-orange-500/60 shadow-md bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-orange-600 dark:text-orange-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 justify-center">
                    <span className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate font-['Roboto','Inter','sans-serif']">
                      Task Updated
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-300 mt-0.5 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                      <span>{notification.message}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <Link
                  to={`/profile/${notification.from.username}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                  onClick={() => setIsClicked(initialState)} // Close dropdown when navigating
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
                      {notification.type === "event_reminder_1day" && (
                        <>
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          <span>Event reminder: {notification.message}</span>
                        </>
                      )}
                      {notification.type === "event_reminder_1hour" && (
                        <>
                          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                          <span>Event reminder: {notification.message}</span>
                        </>
                      )}
                      {notification.type === "task_assignment" && (
                        <>
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          <span>{notification.message}</span>
                        </>
                      )}
                      {notification.type === "task_update" && (
                        <>
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                          <span>{notification.message}</span>
                        </>
                      )}
                      {notification.type === "task_completion" && (
                        <>
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          <span>{notification.message}</span>
                        </>
                      )}
                      {notification.type === "task_edited" && (
                        <>
                          <span className="inline-block w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                          <span>{notification.message}</span>
                        </>
                      )}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
export default NotificationPage;
