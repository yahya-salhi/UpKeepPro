import { Link } from "react-router-dom";
import RightPanelSkeleton from "../../pages/profile/RightPanelSkeleton";
// import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../hooks/UseFollow";
import { Loader2 } from "lucide-react";
import avatar from "../../data/avatar.jpg";

const RightPanel = () => {
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
    <div className="hidden lg:block my-4 mx-2 w-72">
      <div className="card bg-base-100 shadow-xl rounded-md sticky top-2">
        <p className="font-bold text-center  text-base">Who to follow</p>
        <div className="flex flex-col  card-body">
          {/* item */}
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoading &&
            suggestedUsers?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.profileImg || avatar} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-28 first-letter:capitalize">
                      {user.grade}{" "}
                      <span className="font-semibold tracking-tight truncate w-28 first-letter:capitalize">
                        {user.username}
                      </span>
                    </span>{" "}
                    <span className="text-sm text-slate-500">
                      @{user.username}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                  >
                    {/* {isPending(user._id) ? <Loader2 /> : "Follow"} */}
                    {isPending ? <Loader2 /> : "Follow"}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
