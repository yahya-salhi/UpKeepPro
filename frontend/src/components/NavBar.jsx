import { AiOutlineMenu } from "react-icons/ai";
import { BsChatLeft } from "react-icons/bs";
import { RiNotification3Line } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useEffect } from "react";

import avatar from "../data/avatar.jpg";

import { useStateContext } from "../contexts/ContextProvider";
import { useQuery } from "@tanstack/react-query";
import NotificationsPage from "../pages/notification/NotificationsPage";

import UserProfile from "../components/UserProfile";

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
  <TooltipComponent content={title} position="BottomCenter">
    <button
      type="button"
      onClick={() => customFunc()}
      style={{ color }}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
    >
      <span
        style={{ background: dotColor }}
        className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
      />
      {icon}
    </button>
  </TooltipComponent>
);

const Navbar = () => {
  const {
    currentColor,
    activeMenu,
    setActiveMenu,
    handleClick,
    isClicked,
    setScreenSize,
    screenSize,
  } = useStateContext();

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [setScreenSize]);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize, setActiveMenu]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  const { data: authUser } = useQuery({
    queryKey: ["authUser"],
  });
  // Fetch unread notifications count
  const { data: unreadData, refetch } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread");
      const data = await res.json();
      return data.unreadCount; // Return unread count
    },
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
  return (
    <div className="flex justify-between p-2 md:ml-6 md:mr-6 relative">
      <NavButton
        title="Menu"
        customFunc={handleActiveMenu}
        color={currentColor}
        icon={<AiOutlineMenu />}
      />
      <div className="flex justify-center items-center gap-4">
        {authUser?.isOnline ? (
          <span className="badge badge-success text-center   "></span>
        ) : (
          <span className="badge badge-error">OffLine</span>
        )}
        <NavButton
          title="Chat"
          dotColor="#03C9D7"
          customFunc={() => handleClick("chat")}
          color={currentColor}
          icon={<BsChatLeft />}
        />

        <NavButton
          title="Notification"
          dotColor={unreadData > 0 ? "#FF0000" : "#03C9D7"}
          customFunc={() => {
            handleClick("notification");
            fetch("/api/notifications/read", { method: "PUT" }).then(refetch); // Mark as read
          }}
          color={currentColor}
          icon={
            <div className="relative">
              <RiNotification3Line />
              {unreadData > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadData}
                </span>
              )}
            </div>
          }
        />

        <TooltipComponent content="Profile" position="BottomCenter">
          <div
            className="flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg"
            onClick={() => handleClick("userProfile")}
          >
            <img
              className="rounded-full w-8 h-8"
              src={authUser?.profileImg || avatar}
              alt="user-profile"
            />
            <p>
              <span className="text-gray-400 text-14">Hi,</span>{" "}
              <span className="text-gray-400 font-bold ml-1 text-14">
                {authUser?.username}
              </span>
            </p>
            <MdKeyboardArrowDown className="text-gray-400 text-14" />
          </div>
        </TooltipComponent>

        {/* {isClicked.chat && <Chat />} */}
        {isClicked.notification && <NotificationsPage />}
        {isClicked.userProfile && <UserProfile />}
      </div>
    </div>
  );
};

export default Navbar;
