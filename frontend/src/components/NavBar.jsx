import { AiOutlineMenu } from "react-icons/ai";
import { BsChatLeft } from "react-icons/bs";
import { RiNotification3Line } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import avatar from "../data/avatar.jpg";
import { useStateContext } from "../contexts/ContextProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import NotificationsPage from "../pages/notification/NotificationsPage";

import UserProfile from "../components/UserProfile";
import NotificationMessage from "./NotificationMessage";

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
  <TooltipComponent content={title} position="BottomCenter">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        customFunc();
      }}
      style={{ color }}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
      data-dropdown-toggle="true"
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
  const socket = useRef(
    io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"], // Allow both transports for Firefox compatibility
      forceNew: true,
      reconnection: true,
      timeout: 5000,
    })
  ).current;
  const {
    currentColor,
    activeMenu,
    setActiveMenu,
    handleClick,
    isClicked,
    setIsClicked,
    screenSize,
    setScreenSize,
  } = useStateContext();

  const userProfileRef = useRef(null);

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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        userProfileRef.current &&
        !userProfileRef.current.contains(event.target)
      ) {
        setIsClicked((prev) => ({ ...prev, userProfile: false }));
      }
    };

    if (isClicked.userProfile) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }

    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isClicked.userProfile, setIsClicked]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);
  const { data: unreadData, refetch } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/unread");
      const data = await res.json();
      return data.unreadCount;
    },
    refetchInterval: 5000,
  });
  const { data: unreadMsgData = 0, refetch: refetchMessageBadge } = useQuery({
    queryKey: ["unreadMessageNotifications"],
    queryFn: async () => {
      const res = await fetch("/api/messageNotifications/unread", {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to fetch unread messages");
      return data.unreadCount || 0;
    },
    initialData: 0,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (authUser?._id) {
      socket.on("connect", () => {
        socket.emit("joinRoom", authUser._id);
      });

      socket.on("newMessageNotification", () => {
        refetchMessageBadge();
      });

      socket.on("newEventNotification", () => {
        refetch();
      });

      socket.on("newFileSubmissionNotification", (data) => {
        refetch();
        if (data.message) {
          toast.success(
            `New file submission: ${data.submittedBy} uploaded ${data.fileCount} file(s) to "${data.taskTitle}"`
          );
        }
      });
    }
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("newMessageNotification");
      socket.off("newEventNotification");
      socket.off("newFileSubmissionNotification");
    };
  }, [authUser, refetchMessageBadge, refetch, socket]);

  return (
    <div className="flex justify-between p-2 md:ml-6 md:mr-6 relative">
      <NavButton
        title="Menu"
        customFunc={handleActiveMenu}
        color={currentColor}
        icon={<AiOutlineMenu />}
      />

      <div className="flex justify-center items-center gap-4">
        <NavButton
          title="Chat"
          dotColor={unreadMsgData > 0 ? "#FF0000" : "#03C9D7"}
          customFunc={() => {
            handleClick("chat");
            fetch("/api/messageNotifications/read", {
              method: "PUT",
              credentials: "include",
            }).then(() => refetchMessageBadge());
          }}
          color={currentColor}
          icon={
            <div className="relative">
              <BsChatLeft />
              {unreadMsgData > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadMsgData}
                </span>
              )}
            </div>
          }
        />

        <NavButton
          title="Notification"
          dotColor={unreadData > 0 ? "#FF0000" : "#03C9D7"}
          customFunc={() => {
            handleClick("notification");
            fetch("/api/notifications/read", { method: "PUT" }).then(() => {
              refetch();
            });
          }}
          color={currentColor}
          icon={
            <div className="relative">
              <RiNotification3Line />
              {unreadData > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full z-50 min-w-[20px] h-5 flex items-center justify-center font-bold shadow-lg">
                  {unreadData}
                </span>
              )}
            </div>
          }
        />

        <TooltipComponent content="Profile" position="BottomCenter">
          <div
            className="flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleClick("userProfile");
            }}
            data-dropdown-toggle="true"
          >
            <img
              className="rounded-full w-8 h-8"
              src={authUser?.profileImg || avatar}
              alt="user-profile"
            />
            <p>
              <span
                className="text-gray-400 text-14"
                style={{ color: currentColor }}
              >
                Hi,
              </span>{" "}
              <span
                className="text-gray-400 font-bold ml-1 text-lg"
                style={{ color: currentColor }}
              >
                {authUser?.username}
              </span>
            </p>
            <MdKeyboardArrowDown
              className="text-gray-400 text-14"
              style={{ color: currentColor }}
            />
          </div>
        </TooltipComponent>

        {isClicked.chat && <NotificationMessage />}

        {isClicked.notification && <NotificationsPage />}

        {isClicked.userProfile && <UserProfile />}
      </div>
    </div>
  );
};

export default Navbar;
