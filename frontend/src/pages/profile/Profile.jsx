import { useState, useRef } from "react";
import { MdEdit } from "react-icons/md";

const Profile = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);

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
    <div className="bg-white dark:bg-[#121212] shadow-md rounded-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Cover Image */}
      <div className="relative h-40 bg-gradient-to-r from-primary to-secondary">
        <img
          src={coverImg || "https://via.placeholder.com/800x200"}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
          onClick={() => coverImgRef.current.click()}
        >
          <MdEdit className="w-5 h-5 text-white" />
        </div>

        <input
          type="file"
          hidden
          ref={coverImgRef}
          onChange={(e) => handleImgChange(e, "coverImg")}
        />
      </div>

      {/* Profile Info */}
      <div className="relative -mt-12 flex flex-col items-center">
        <img
          src={profileImg || "https://via.placeholder.com/150"}
          alt="User Avatar"
          className="w-24 h-24 rounded-full border-4 border-white dark:border-[#121212] shadow-md"
        />
        <input
          type="file"
          hidden
          ref={profileImgRef}
          onChange={(e) => handleImgChange(e, "profileImg")}
        />
        <div
          className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer"
          onClick={() => profileImgRef.current.click()}
        >
          <MdEdit className="w-4 h-4 text-white" />
        </div>
        <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-[#e0e0e0]">
          John Doe
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Software Developer
        </p>
      </div>

      {/* User Details */}
      <div className="p-6">
        <p className="text-gray-700 dark:text-gray-300 text-sm text-center">
          Passionate developer focused on creating innovative and efficient
          solutions.
        </p>
        <div className="mt-4 flex justify-center space-x-4">
          <a
            href="#"
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
          >
            Twitter
          </a>
          <a
            href="#"
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
          >
            LinkedIn
          </a>
          <a
            href="#"
            className="text-blue-500 hover:text-blue-700 dark:text-blue-400"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

export default Profile;
