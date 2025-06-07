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
  const {
    currentColor,
    setActivePanel,
    setIsClicked,
    initialState,
    closeDropdownsAndNavigate,
  } = useStateContext();

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
  const username = authUser?.username;

  const userProfileData = [
    {
      icon: <BsCurrencyDollar />,
      title: "My Profile",
      desc: "Account Settings",
      iconColor: currentColor,
      iconBg: `${currentColor}15`,
      link: `/profile/${username}`,
    },
    {
      icon: <BsShield />,
      title: "My Inbox",
      desc: "Messages & Emails",
      iconColor: currentColor,
      iconBg: `${currentColor}15`,
      link: "/chat",
    },
    {
      icon: <FiCreditCard />,
      title: "My Tasks",
      desc: "To-do and Daily Tasks",
      iconColor: currentColor,
      iconBg: `${currentColor}15`,
      link: "/kanban",
    },
    {
      icon: <CiLogout />,
      title: "Logout",
      desc: "Sign out of your account",
      iconColor: "#FF4747",
      iconBg: "#FFE7E7",
      action: () => mutate(),
    },
  ];

  return (
    <div
      className="nav-item fixed right-1 top-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg w-80 sm:w-96 transform transition-all duration-300 ease-in-out animate-fade-in"
      data-dropdown-content="true"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Profile
          </h3>
          <Button
            icon={<MdOutlineCancel />}
            color={currentColor}
            onClick={() => setIsClicked(initialState)}
            bgHoverColor="light-gray"
            size="sm"
            borderRadius="full"
            className="!p-2"
          />
        </div>

        {/* Profile Info */}
        <div className="flex gap-4 items-start border-b border-gray-200 dark:border-gray-700 pb-6">
          <img
            className="h-16 w-16 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700 shadow-sm"
            src={authUser?.profileImg || avatar}
            alt={`${authUser?.username}'s profile`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {authUser?.username}
              </h4>
              <UserStatus isOnline={authUser?.isOnline} />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
              {authUser?.grade ||
                (authUser?.role === "STAG" ? "Student" : "No rank assigned")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {authUser?.email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {authUser?.role}
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 space-y-2">
          {userProfileData.map((item, index) => {
            const handleClick = (e) => {
              if (item.link) {
                e.preventDefault();
                closeDropdownsAndNavigate(navigate, item.link);
              } else if (item.action) {
                item.action();
                setActivePanel(null);
                setIsClicked(initialState); // Close dropdown
              }
            };

            const MenuItem = ({ children }) => (
              <div
                className="flex items-center gap-4 p-3 rounded-lg transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={handleClick}
              >
                {children}
              </div>
            );

            const content = (
              <MenuItem key={index}>
                <div
                  className="flex items-center justify-center h-10 w-10 rounded-lg transition-transform duration-200 group-hover:scale-110"
                  style={{
                    color: item.iconColor,
                    backgroundColor: item.iconBg,
                  }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {item.desc}
                  </p>
                </div>
              </MenuItem>
            );

            return item.link ? (
              <Link
                to={item.link}
                key={index}
                className="block group"
                onClick={handleClick}
              >
                {content}
              </Link>
            ) : (
              <div key={index} className="group">
                {content}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default UserProfile;
