import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditeProfileModal";
import { Calendar, Edit, LinkIcon, ArrowLeft } from "lucide-react";
import avatar from "../../data/avatar.jpg";
import { formatMemberSinceDate } from "../../utils/date";
// import RightPanel from "../../pages/profile/RightPanel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import usefollow from "../../hooks/UseFollow";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProfileHeader = ({ user, onBack }) => (
  <div className="border-b border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center gap-4">
      <button
        onClick={onBack}
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {user.grade}
          </span>
          {user.username}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
      </div>
    </div>
  </div>
);

const ProfileImages = ({
  user,
  coverImg,
  profileImg,
  isMyProfile,
  coverImgRef,
  profileImgRef,
  onImageChange,
}) => (
  <div className="relative">
    <div className="relative h-72 overflow-hidden group">
      <img
        src={coverImg || user.coverImg || avatar}
        alt="Cover"
        className="h-full w-full object-cover transition duration-300 ease-in-out group-hover:scale-105"
      />
      {isMyProfile && (
        <button
          onClick={() => coverImgRef.current?.click()}
          className="absolute right-4 top-4 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        </button>
      )}
    </div>

    <div className="absolute -bottom-16 left-6">
      <div className="relative group">
        <div className="h-32 w-32 rounded-full ring-4 ring-white dark:ring-gray-800 overflow-hidden">
          <img
            src={profileImg || user.profileImg || avatar}
            alt={user.username}
            className="h-full w-full object-cover"
          />
        </div>
        {isMyProfile && (
          <button
            onClick={() => profileImgRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>
        )}
      </div>
    </div>

    <input
      type="file"
      hidden
      ref={coverImgRef}
      onChange={(e) => onImageChange(e, "coverImg")}
      accept="image/*"
    />
    <input
      type="file"
      hidden
      ref={profileImgRef}
      onChange={(e) => onImageChange(e, "profileImg")}
      accept="image/*"
    />
  </div>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
      fill="none"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

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
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}

            {!isLoading && !user && !isRefetching && (
              <div className="flex h-64 items-center justify-center">
                <p className="text-base text-gray-500 dark:text-gray-400">
                  User not found
                </p>
              </div>
            )}

            {!isLoading && !isRefetching && user && (
              <>
                <ProfileHeader user={user} onBack={() => navigate(-1)} />

                <ProfileImages
                  user={user}
                  coverImg={coverImg}
                  profileImg={profileImg}
                  isMyProfile={isMyProfile}
                  coverImgRef={coverImgRef}
                  profileImgRef={profileImgRef}
                  onImageChange={handleImgChange}
                />

                <div className="mt-20 px-6 pb-6">
                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3">
                    {isMyProfile ? (
                      <EditProfileModal authUser={authUser} />
                    ) : (
                      <button
                        onClick={() => follow(user._id)}
                        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          authUser?.following.includes(user._id)
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        }`}
                        disabled={isPandig}
                      >
                        {isPandig ? (
                          <span className="inline-flex items-center gap-2">
                            <LoadingSpinner />
                            Loading...
                          </span>
                        ) : authUser?.following.includes(user._id) ? (
                          "Unfollow"
                        ) : (
                          "Follow"
                        )}
                      </button>
                    )}
                    {(coverImg || profileImg) && (
                      <button
                        onClick={() => updateProfile()}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        disabled={isPandingProfile}
                      >
                        {isPandingProfile ? (
                          <span className="inline-flex items-center gap-2">
                            <LoadingSpinner />
                            Updating...
                          </span>
                        ) : (
                          "Update Profile"
                        )}
                      </button>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="mt-6 space-y-6">
                    {/* Username and Status */}
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        @{user.username}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user?.isOnline
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {user?.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>

                    {/* Mission */}
                    {user.mission && (
                      <p className="text-gray-600 dark:text-gray-300">
                        {user.mission}
                      </p>
                    )}

                    {/* Availability */}
                    {user.availability === "unavailable" && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        {" "}
                        <p className="text-sm text-red-700 dark:text-red-400">
                          Not available until{" "}
                          {moment(user.returnDate).format("MMMM Do, YYYY")}
                        </p>
                        {user.alternativeUser && (
                          <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                            Alternative user: {user.alternativeUser}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Contact Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.phoneUsersCount > 0 && (
                        <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {user.phoneUsersCount}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Phone Numbers
                          </span>
                        </div>
                      )}
                      {user.officeUsersCount > 0 && (
                        <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {user.officeUsersCount}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Office Numbers
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-6 text-sm border-t border-gray-200 dark:border-gray-700 pt-6">
                      <a
                        href={`mailto:${user.email}`}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <LinkIcon className="h-4 w-4" />
                        <span>{user.email}</span>
                      </a>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{formatMemberSinceDate(user.createdAt)}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user.following.length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Following
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user.followers.length}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Followers
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* <div className="lg:col-span-1">
          <RightPanel />
        </div> */}
      </div>
    </div>
  );
};

export default Profile;
