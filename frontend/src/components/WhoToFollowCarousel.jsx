import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Users, Sparkles } from "lucide-react";
import { useStateContext } from "../contexts/ContextProvider";
import UserCard from "./UserCard";
import UserCardSkeleton from "./UserCardSkeleton";

const WhoToFollowCarousel = () => {
  const { currentMode, currentColor } = useStateContext();

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);
  const isDarkMode = currentMode === "Dark";

  const {
    data: suggestedUsers,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/users/suggested", {
          method: "GET",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.message || "An error occurred while fetching users"
          );
        }
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An error occurred while fetching users");
      }
    },
  });

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, [suggestedUsers]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 280; // Width of one card plus gap
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (error) {
    return (
      <div
        className={`p-6 rounded-2xl text-center ${
          isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-600"
        }`}
      >
        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Unable to load suggestions</p>
        <p className="text-sm mt-1 opacity-75">Please try again later</p>
      </div>
    );
  }

  if (!isLoading && (!suggestedUsers || suggestedUsers.length === 0)) {
    return (
      <div
        className={`p-6 rounded-2xl text-center ${
          isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-50 text-gray-600"
        }`}
      >
        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">No new suggestions</p>
        <p className="text-sm mt-1 opacity-75">
          Check back later for new people to follow
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${currentColor}20` }}
          >
            <Users className="w-5 h-5" style={{ color: currentColor }} />
          </div>
          <div>
            <h3
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Who to Follow
            </h3>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Discover amazing people in your network
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        {!isLoading && suggestedUsers && suggestedUsers.length > 1 && (
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full transition-all duration-200 ${
                canScrollLeft
                  ? isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-2 rounded-full transition-all duration-200 ${
                canScrollRight
                  ? isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  : "opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Carousel Container - Desktop */}
      <div className="relative overflow-hidden hidden md:block">
        <div
          ref={scrollContainerRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 px-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {isLoading
            ? // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <UserCardSkeleton key={index} />
              ))
            : // User cards
              suggestedUsers?.map((user, index) => (
                <UserCard key={user._id} user={user} index={index} />
              ))}
        </div>
      </div>

      {/* Grid Layout - Mobile */}
      <div className="md:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading
            ? // Loading skeletons
              Array.from({ length: 2 }).map((_, index) => (
                <UserCardSkeleton key={index} />
              ))
            : // User cards
              suggestedUsers
                ?.slice(0, 4)
                .map((user, index) => (
                  <UserCard key={user._id} user={user} index={index} />
                ))}
        </div>
      </div>

      {/* View All Button */}
      {!isLoading && suggestedUsers && suggestedUsers.length > 0 && (
        <div className="mt-6 text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-900"
            }`}
            style={{
              backgroundColor: currentColor,
              color: "white",
            }}
          >
            View All Suggestions
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default WhoToFollowCarousel;
