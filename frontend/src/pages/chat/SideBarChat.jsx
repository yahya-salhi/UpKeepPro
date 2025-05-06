import { useState, useEffect } from "react";
// import { useChat } from "../../hooks/useChat";
import SideBarSkeleton from "./SideBarSkeleton";
import { Users, Search } from "lucide-react";
import avatar from "../../data/avatar.jpg";
import { useChatStore } from "../../store/useChatStore";

function SideBarChat() {
  //usechat hook is worked on the previous version of the project
  // const { users, isUsersLoading, selectedUser, setSelectedUser } = useChat();
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users
    .filter((user) => 
      (showOnlineOnly ? user.isOnline : true) && 
      (searchQuery ? user.username.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    );

  if (isUsersLoading) return <SideBarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-200 bg-gray-50 dark:bg-gray-800/50">
      <div className="border-b border-gray-200 dark:border-gray-700 w-full p-4">
        <div className="flex items-center gap-2 mb-4">
          <Users className="size-5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium hidden lg:block text-gray-900 dark:text-white">Contacts</span>
        </div>
        
        {/* Search Input - Only visible on larger screens */}
        <div className="hidden lg:block relative mb-3">
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 size-4 text-gray-400" />
        </div>
        
        <div className="hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show online only</span>
          </label>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({filteredUsers.filter((user) => user.isOnline).length} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-2">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profileImg || avatar}
                alt={user.username}
                className="size-12 object-cover rounded-full border-2 border-gray-200 dark:border-gray-600"
              />
              {user.isOnline && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-white dark:ring-gray-800"
                />
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate text-gray-900 dark:text-white">{user.username}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {user.isOnline ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-4">No users found</div>
        )}
      </div>
    </aside>
  );
}

export default SideBarChat;
