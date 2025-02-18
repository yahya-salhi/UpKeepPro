import { useRef, useState } from "react";

import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditeProfileModal";
import { Calendar, Edit, LinkIcon, ArrowLeft } from "lucide-react";

import RightPanel from "../../pages/profile/RightPanel";

const Profile = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

  const isLoading = false;
  const isMyProfile = true;

  const user = {
    _id: "1",
    fullName: "John Doe",
    username: "johndoe",
    profileImg: "/avatars/boy2.png",
    coverImg: "/cover.png",
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    link: "https://youtube.com/@asaprogrammer_",
    following: ["1", "2", "3"],
    followers: ["1", "2", "3"],
  };

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

  return (
    <div className="container mx-auto grid grid-cols-1 gap-6 p-4 md:grid-cols-3 lg:grid-cols-4">
      <div className="col-span-1 md:col-span-2 lg:col-span-3">
        <div className="card bg-base-100 shadow-xl">
          {isLoading && <ProfileHeaderSkeleton />}
          {!isLoading && !user && (
            <div className="flex h-64 items-center justify-center">
              <p className="text-lg text-base-content/60">User not found</p>
            </div>
          )}
          {!isLoading && user && (
            <>
              <div className="border-b border-base-300 p-4">
                <div className="flex items-center gap-4">
                  <button className="btn btn-ghost btn-circle btn-sm">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h2 className="text-lg font-bold">{user.fullName}</h2>
                    <p className="text-sm text-base-content/60">4 posts</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="relative">
                  {/* Cover Image */}
                  <div className="group relative h-64 overflow-hidden">
                    <img
                      src={coverImg || user.coverImg || "/cover.png"}
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
                            alt={user.fullName}
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
                      <EditProfileModal />
                    ) : (
                      <button className="btn btn-outline btn-sm">Follow</button>
                    )}
                    {(coverImg || profileImg) && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => alert("Profile updated successfully")}
                      >
                        Update
                      </button>
                    )}
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold">{user.fullName}</h3>
                      <p className="text-sm text-base-content/60">
                        @{user.username}
                      </p>
                      <p className="mt-2">{user.bio}</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {user.link && (
                        <div className="dropdown dropdown-hover">
                          <a
                            href={user.link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <LinkIcon className="h-4 w-4" />
                            <span>youtube.com/@asaprogrammer_</span>
                          </a>
                          <div className="dropdown-content card card-compact bg-base-200 p-2 shadow">
                            <p>Visit channel</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <Calendar className="h-4 w-4" />
                        <span>Joined July 2021</span>
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
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-base">Who to follow</h3>
            {/* Right panel content */}
            <RightPanel />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
