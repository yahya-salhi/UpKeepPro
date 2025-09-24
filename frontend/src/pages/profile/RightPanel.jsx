import { Link } from "react-router-dom";
import RightPanelSkeleton from "../../pages/profile/RightPanelSkeleton";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/useFollow";
import { Loader2, UserPlus } from "lucide-react";
import avatar from "../../data/avatar.jpg";
import { useStateContext } from "../../contexts/ContextProvider";

const RightPanel = () => {
  const { currentMode } = useStateContext();
  const isDarkMode = currentMode === "Dark";

  const { data: suggestedUsers, isLoading } = useQuery({
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
  const { follow, isPending } = useFollow();

  if (suggestedUsers?.length === 0) return <div className="md:w-64 w-0"></div>;

  return (
    <aside className="hidden lg:block my-4 mx-2 w-80 max-w-xs">
      <div
        className={`${
          isDarkMode
            ? "bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-zinc-700/40"
            : "bg-gradient-to-br from-white via-slate-50 to-white border-slate-200"
        } shadow-xl rounded-2xl sticky top-2 border transition-all duration-300 overflow-hidden backdrop-blur-sm`}
      >
        <div className="relative">
          <div
            className={`absolute inset-0 ${
              isDarkMode ? "bg-indigo-600/10" : "bg-indigo-500/5"
            } mix-blend-overlay`}
          ></div>
          <h2
            className={`font-bold text-center text-xl py-5 tracking-tight ${
              isDarkMode ? "text-white" : "text-slate-800"
            } font-['Roboto','Inter','sans-serif'] relative`}
          >
            Who to follow
            <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-500 absolute bottom-0 left-1/2 transform -translate-x-1/2 rounded-t-full"></div>
          </h2>
        </div>

        <div className="flex flex-col gap-3 p-4">
          {isLoading ? (
            <div className="space-y-3">
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </div>
          ) : (
            suggestedUsers?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className={`group flex items-center justify-between gap-4 p-3.5 rounded-xl ${
                  isDarkMode
                    ? "bg-zinc-800/80 hover:bg-zinc-700/90 border-zinc-700/30 hover:border-indigo-500/30 focus:ring-offset-zinc-800"
                    : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-indigo-400/30 focus:ring-offset-white"
                } transition-all duration-300 shadow-md border hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-1`}
                key={user._id}
                aria-label={`View profile of ${user.username}`}
              >
                <div className="flex gap-3.5 items-center min-w-0">
                  <div className="relative">
                    <div
                      className={`w-11 h-11 rounded-full ring-2 ${
                        isDarkMode
                          ? "ring-indigo-500/40 group-hover:ring-indigo-400/70"
                          : "ring-indigo-400/30 group-hover:ring-indigo-500/60"
                      } transition-all duration-300 overflow-hidden shadow-md`}
                    >
                      <img
                        src={user.profileImg || avatar}
                        alt={`${user.username}'s avatar`}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 ${
                        isDarkMode
                          ? "border-zinc-800 group-hover:border-zinc-700"
                          : "border-white group-hover:border-slate-50"
                      } transition-colors duration-300`}
                    ></div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className={`font-semibold ${
                        isDarkMode ? "text-zinc-100" : "text-slate-800"
                      } truncate max-w-[7.5rem] first-letter:capitalize text-base leading-tight`}
                    >
                      {user.grade ||
                        (user.role === "STAG" ? "Student" : "User")}{" "}
                      <span
                        className={`font-normal ${
                          isDarkMode
                            ? "text-indigo-400 group-hover:text-indigo-300"
                            : "text-indigo-600 group-hover:text-indigo-500"
                        } transition-colors duration-300`}
                      >
                        {user.username}
                      </span>
                    </span>
                    <span
                      className={`text-xs ${
                        isDarkMode
                          ? "text-zinc-400 group-hover:text-zinc-300"
                          : "text-slate-500 group-hover:text-slate-600"
                      } truncate max-w-[7.5rem] transition-colors duration-300`}
                    >
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className={`btn btn-sm rounded-full px-5 py-1.5 font-medium ${
                      isDarkMode
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-600/20"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white hover:shadow-indigo-500/20"
                    } transition-all duration-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-400/50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5`}
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                    disabled={isPending}
                    aria-label={`Follow ${user.username}`}
                  >
                    {isPending ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              </Link>
            ))
          )}

          {!isLoading && suggestedUsers?.length > 0 && (
            <div className="mt-2 text-center">
              <button
                className={`${
                  isDarkMode
                    ? "text-indigo-400 hover:text-indigo-300"
                    : "text-indigo-600 hover:text-indigo-500"
                } text-sm font-medium transition-colors duration-300 py-2`}
              >
                Show more
              </button>
            </div>
          )}

          {!isLoading && suggestedUsers?.length === 0 && (
            <div className="py-6 text-center">
              <p
                className={`${
                  isDarkMode ? "text-zinc-400" : "text-slate-500"
                } text-sm`}
              >
                No suggestions available at the moment
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;
