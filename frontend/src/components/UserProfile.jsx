import { MdOutlineCancel } from "react-icons/md";
import { Button } from ".";

import { useStateContext } from "../contexts/ContextProvider";
import avatar from "../data/avatar.jpg";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

import { useNavigate, Link } from "react-router-dom";

import UserStatus from "../pages/auth/login/UserStatus ";
import { BsCurrencyDollar, BsShield } from "react-icons/bs";
import { FiCreditCard } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";

const UserProfile = () => {
  const { currentColor, setActivePanel } = useStateContext();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { mutate, error } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data.message || "An error occurred while logging out"
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An error occurred while logging out");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged out successfully");
    },
    onError: () => {
      toast.error(error.message);
    },
  });

  const authUser = queryClient.getQueryData(["authUser"]);

  //getUserProfile
  const usernmae = authUser?.username;
  const userProfileData = [
    {
      icon: <BsCurrencyDollar />,
      title: "My Profile",
      desc: "Account Settings",
      iconColor: "#03C9D7",
      iconBg: "#E5FAFB",
      link: `/profile/${usernmae}`,
    },
    {
      icon: <BsShield />,
      title: "My Inbox",
      desc: "Messages & Emails",
      iconColor: "rgb(0, 194, 146)",
      iconBg: "rgb(235, 250, 242)",
      link: "/chat",
    },
    {
      icon: <FiCreditCard />,
      title: "My Tasks",
      desc: "To-do and Daily Tasks",
      iconColor: "rgb(255, 244, 229)",
      iconBg: "rgb(254, 201, 15)",
      link: "/tasks",
    },
    {
      icon: <CiLogout />,
      title: "Logout",
      desc: "To-do and Daily Tasks",
      iconColor: "rgb(255, 244, 229)",
      iconBg: "red",
      action: () => mutate(),
    },
  ];

  return (
    <div className="nav-item absolute right-1 top-16 bg-white dark:bg-[#42464D] p-8 rounded-lg w-96">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg dark:text-gray-200">User Profile</p>
        <Button
          icon={<MdOutlineCancel />}
          color={currentColor}
          onClick={() => window.history.back()}
          bgHoverColor="light-gray"
          size="2xl"
          borderRadius="50%"
        />
      </div>
      <div className="flex gap-5 items-center mt-6 border-color border-b-1 pb-6">
        <img
          className="rounded-full h-24 w-24"
          src={authUser?.profileImg || avatar}
          alt="user-profile"
        />
        <div>
          <p className="font-semibold text-xl dark:text-gray-200 first:capitalize">
            <span>
              {authUser?.grade}
              {""}
            </span>{" "}
            {authUser?.username}
          </p>
          <p className="text-gray-500 text-sm dark:text-gray-400 text-center ">
            {authUser?.role}
          </p>
          <p className="text-gray-500 text-sm font-semibold dark:text-gray-400">
            {authUser?.email}
          </p>
          <UserStatus isOnline={authUser?.isOnline} />
        </div>
      </div>

      <div>
        {userProfileData.map((item, index) => {
          const handleClick = (e) => {
            if (item.link) {
              e.preventDefault(); // Prevent immediate navigation
              setActivePanel(null); // Close the panel
              // window.location.href = item.link;
              navigate(item.link); // Navigate manually after state update
            } else if (item.action) {
              item.action();
              setActivePanel(null);
            }
          };
          const content = (
            <div
              key={index}
              className="flex gap-5 border-b-1 border-color p-4 hover:bg-light-gray cursor-pointer dark:hover:bg-[#42464D]"
              onClick={handleClick} // Add onClick if action exists
            >
              <button
                type="button"
                style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                className="text-xl rounded-lg p-3 hover:bg-light-gray"
              >
                {item.icon}
              </button>

              <div>
                <p className="font-semibold dark:text-gray-200">{item.title}</p>
                <p className="text-gray-500 text-sm dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            </div>
          );

          return item.link ? (
            <Link to={item.link} key={index} onClick={handleClick}>
              {content}
            </Link>
          ) : (
            content
          );
        })}
      </div>
    </div>
  );
};

export default UserProfile;
