import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { UserPlus, Loader2, MapPin, Calendar } from "lucide-react";
import { useStateContext } from "../contexts/ContextProvider";
import useFollow from "../hooks/useFollow";
import avatar from "../data/avatar.jpg";

const UserCard = ({ user, index }) => {
  const { currentMode, currentColor } = useStateContext();
  const { follow, isPending } = useFollow();
  const isDarkMode = currentMode === "Dark";

  const handleFollowClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    follow(user._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="flex-shrink-0 w-64 h-72 md:w-64 md:h-72 sm:w-full sm:h-auto"
    >
      <Link
        to={`/profile/${user.username}`}
        className={`block h-full rounded-2xl overflow-hidden transition-all duration-300 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-gray-600"
            : "bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-gray-300"
        } shadow-lg hover:shadow-xl`}
      >
        {/* Header with gradient background */}
        <div
          className="h-20 relative"
          style={{
            background: `linear-gradient(135deg, ${currentColor}20, ${currentColor}40)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>

        {/* Profile Image */}
        <div className="relative -mt-10 flex justify-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <img
              src={user.profileImg || avatar}
              alt={user.username}
              className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
            />
            <div
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
              style={{ backgroundColor: currentColor }}
            >
              <div className="w-full h-full rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </motion.div>
        </div>

        {/* User Info */}
        <div className="px-6 pt-4 pb-6 text-center">
          <h3
            className={`font-bold text-lg mb-1 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {user.grade}
          </h3>
          <p
            className={`text-sm mb-3 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            @{user.username}
          </p>

          {/* Stats */}
          <div className="flex justify-center space-x-4 mb-4">
            <div className="text-center">
              <div
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {user.followers?.length || 0}
              </div>
              <div
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Followers
              </div>
            </div>
            <div className="text-center">
              <div
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {user.following?.length || 0}
              </div>
              <div
                className={`text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Following
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 mb-4">
            {user.location && (
              <div
                className={`flex items-center justify-center text-xs ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <MapPin className="w-3 h-3 mr-1" />
                {user.location}
              </div>
            )}
            <div
              className={`flex items-center justify-center text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Calendar className="w-3 h-3 mr-1" />
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Follow Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFollowClick}
            disabled={isPending}
            className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            style={{
              backgroundColor: isPending ? undefined : currentColor,
              color: isPending ? undefined : "white",
            }}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Follow</span>
              </>
            )}
          </motion.button>
        </div>
      </Link>
    </motion.div>
  );
};

export default UserCard;
