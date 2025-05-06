import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditeProfileModal";
import { Calendar, Edit, LinkIcon, ArrowLeft } from "lucide-react";
import avatar from "../../data/avatar.jpg";
import { formatMemberSinceDate } from "../../utils/date";
import RightPanel from "../../pages/profile/RightPanel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import usefollow from "../../hooks/UseFollow";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const { username } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { follow, isPandig } = usefollow();
  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message);
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  const { mutate: updateProfile, isPanding: isPandingProfile } = useMutation({
    mutationFn: async () => {
      try {
        const base64CoverImg = coverImg ? coverImg : user.coverImg;
        const base64ProfileImg = profileImg ? profileImg : user.profileImg;
        const res = await fetch(`/api/users/update`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coverImg: base64CoverImg,
            profileImg: base64ProfileImg,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message);
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      Promise.all([
        queryClient.invalidateQueries(["authUser"]),
        queryClient.invalidateQueries(["userProfile"]),
      ]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const isMyProfile = authUser?._id === user?._id;

  // const user = {
  //   _id: "1",
  //   username: "johndoe",
  //   grade: "LT ",
  //   role: "REPI",

  //   profileImg: "/avatars/boy2.png",
  //   phoneUsersCount: 10,
  //   officeUsersCount: 20,
  //   isOnline: true,
  //   availability: "available",
  //   returnDate: null,
  //   alternativeUser: null,
  //   coverImg: "/cover.png",
  //   mission: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  //   email: "https://youtube.com/@asaprogrammer_",
  //   following: ["1", "2", "3"],
  //   followers: ["1", "2", "3"],
  //   timestamp: "2021-07-01T00:00:00.000Z",
  // };

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  useEffect(() => {
    refetch();
  }, [username, refetch]);

  return (
    <div className="container mx-auto grid grid-cols-1 gap-6 p-4 md:grid-cols-3 lg:grid-cols-4">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <div className="card bg-base-100 shadow-xl">
          {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
          {!isLoading && !user && !isRefetching && (
            <div className="flex h-64 items-center justify-center">
              <p className="text-lg text-base-content/60">User not found</p>
            </div>
          )}
          {!isLoading && !isRefetching && user && (
            <>
              <div className="border-b border-base-300 p-4">
                <div className="flex items-center gap-4">
                  <button className="btn btn-ghost btn-circle btn-sm">
                    <ArrowLeft
                      className="h-4 w-4"
                      onClick={() => navigate(-1)}
                    />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold">
                      <span className="text-sm text-base-content/60">
                        {user.grade}{" "}
                      </span>
                      {user.username}{" "}
                    </h2>
                    <p className="text-sm text-base-content/60">{user.role}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  {/* Cover Image */}
                  <div className="group relative h-64 overflow-hidden">
                    <img
                      src={coverImg || user.coverImg || avatar}
                      alt="Cover"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {isMyProfile && (
                      <button
                        className="btn btn-circle btn-sm absolute right-4 top-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-base-200"
                        onClick={() => coverImgRef.current?.click()}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Profile Image */}
                  <div className="absolute -bottom-16 left-6">
                    <div className="group relative">
                      <div className="avatar">
                        <div className="w-32 rounded-full ring ring-base-100 ring-offset-2">
                          <img
                            src={profileImg || user.profileImg}
                            alt={user.username}
                          />
                        </div>
                      </div>
                      {isMyProfile && (
                        <button
                          className="btn btn-circle btn-sm absolute bottom-0 right-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-base-200"
                          onClick={() => profileImgRef.current?.click()}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="file"
                    hidden
                    ref={coverImgRef}
                    onChange={(e) => handleImgChange(e, "coverImg")}
                    accept="image/*"
                  />
                  <input
                    type="file"
                    hidden
                    ref={profileImgRef}
                    onChange={(e) => handleImgChange(e, "profileImg")}
                    accept="image/*"
                  />
                </div>

                <div className="mt-20 p-6">
                  <div className="flex justify-end gap-2">
                    {isMyProfile ? (
                      <EditProfileModal authUser={authUser} />
                    ) : (
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => follow(user._id)}
                      >
                        {isPandig && "loading..."}
                        {!isPandig &&
                          (authUser?.following.includes(user._id)
                            ? "Unfollow"
                            : "Follow")}
                      </button>
                    )}
                    {(coverImg || profileImg) && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => updateProfile()}
                      >
                        {isPandingProfile && "loading..."}
                        {!isPandingProfile && "update"}
                      </button>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold">@{user.username}</h3>
                      {user?.isOnline ? (
                        <span className="badge badge-success text-center   ">
                          online
                        </span>
                      ) : (
                        <span className="badge badge-error">OffLine</span>
                      )}
                      <p className="mt-2">{user.mission}</p>
                      {user.availability === "unavailable" && (
                        <p className="mt-2 text-error">
                          Not available until {user.returnDate}
                        </p>
                      )}
                      {user.alternativeUser && (
                        <p className="mt-2 text-error">
                          Alternative user: {user.alternativeUser}
                        </p>
                      )}
                      {user.phoneUsersCount > 0 && (
                        <p className="mt-2">
                          <span className="font-bold   ">
                            {user.phoneUsersCount}
                          </span>{" "}
                          phone Number
                        </p>
                      )}
                      {user.officeUsersCount > 0 && (
                        <p className="mt-2">
                          <span className="font-bold">
                            {user.officeUsersCount}
                          </span>{" "}
                          office Number
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <LinkIcon className="h-4 w-4" />
                      <span className="font-bold text-base-content hover:underline cursor-pointer">
                        {user.email}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <Calendar className="h-4 w-4" />
                        <span>{formatMemberSinceDate(user.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button className="btn btn-ghost btn-sm h-auto p-0 text-left normal-case">
                        <div>
                          <span className="font-bold">
                            {user.following.length}
                          </span>
                          <span className="ml-1 text-base-content/60">
                            Following
                          </span>
                        </div>
                      </button>
                      <button className="btn btn-ghost btn-sm h-auto p-0 text-left normal-case">
                        <div>
                          <span className="font-bold">
                            {user.followers.length}
                          </span>
                          <span className="ml-1 text-base-content/60">
                            Followers
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="divider m-0"></div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="col-span-1">
        {/* <div className="card bg-base-100 shadow-xl">
          <div className="card-body"> */}
        {/* <h3 className="card-title text-base">Who to follow</h3> */}
        {/* Right panel content */}
        <RightPanel />
        {/* </div>
        </div> */}
      </div>
    </div>

    //
  );
};
export default Profile;
