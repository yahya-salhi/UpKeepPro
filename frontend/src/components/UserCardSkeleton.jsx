import { motion } from "framer-motion";
import { useStateContext } from "../contexts/ContextProvider";

const UserCardSkeleton = () => {
  const { currentMode } = useStateContext();
  const isDarkMode = currentMode === "Dark";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-shrink-0 w-64 h-72 md:w-64 md:h-72 sm:w-full sm:h-auto"
    >
      <div
        className={`h-full rounded-2xl overflow-hidden ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700"
            : "bg-gradient-to-br from-white to-gray-50 border border-gray-200"
        } shadow-lg`}
      >
        {/* Header skeleton */}
        <div
          className={`h-20 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          } animate-pulse`}
        ></div>

        {/* Profile Image skeleton */}
        <div className="relative -mt-10 flex justify-center">
          <div
            className={`w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 ${
              isDarkMode ? "bg-gray-600" : "bg-gray-300"
            } animate-pulse`}
          ></div>
        </div>

        {/* Content skeleton */}
        <div className="px-6 pt-4 pb-6 space-y-4">
          {/* Name skeleton */}
          <div className="text-center space-y-2">
            <div
              className={`h-5 w-24 mx-auto rounded ${
                isDarkMode ? "bg-gray-600" : "bg-gray-300"
              } animate-pulse`}
            ></div>
            <div
              className={`h-4 w-20 mx-auto rounded ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            ></div>
          </div>

          {/* Stats skeleton */}
          <div className="flex justify-center space-x-4">
            <div className="text-center space-y-1">
              <div
                className={`h-5 w-8 mx-auto rounded ${
                  isDarkMode ? "bg-gray-600" : "bg-gray-300"
                } animate-pulse`}
              ></div>
              <div
                className={`h-3 w-12 mx-auto rounded ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                } animate-pulse`}
              ></div>
            </div>
            <div className="text-center space-y-1">
              <div
                className={`h-5 w-8 mx-auto rounded ${
                  isDarkMode ? "bg-gray-600" : "bg-gray-300"
                } animate-pulse`}
              ></div>
              <div
                className={`h-3 w-12 mx-auto rounded ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-200"
                } animate-pulse`}
              ></div>
            </div>
          </div>

          {/* Additional info skeleton */}
          <div className="space-y-2">
            <div
              className={`h-3 w-32 mx-auto rounded ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            ></div>
            <div
              className={`h-3 w-28 mx-auto rounded ${
                isDarkMode ? "bg-gray-700" : "bg-gray-200"
              } animate-pulse`}
            ></div>
          </div>

          {/* Button skeleton */}
          <div
            className={`h-10 w-full rounded-xl ${
              isDarkMode ? "bg-gray-600" : "bg-gray-300"
            } animate-pulse`}
          ></div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCardSkeleton;
