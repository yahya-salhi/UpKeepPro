import { X, Phone, Video, MoreVertical } from "lucide-react";
// import { useChat } from "../../hooks/useChat";
import avatar from "../../data/avatar.jpg";
import { useChatStore } from "../../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <img
              src={selectedUser.profileImg || avatar}
              alt={selectedUser.username}
              className="size-12 object-cover rounded-full border-2 border-gray-200 dark:border-gray-600"
            />
            {selectedUser.isOnline && (
              <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-white dark:ring-gray-800" />
            )}
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">{selectedUser.username}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedUser.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
            <Phone className="size-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
            <Video className="size-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
            <MoreVertical className="size-5" />
          </button>
          <button 
            onClick={() => setSelectedUser(null)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
