import { Link, NavLink } from "react-router-dom";
// import { SiShopware } from "react-icons/si";
import { MdOutlineCancel } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useStateContext } from "../contexts/ContextProvider.jsx";
import { FiEdit, FiPieChart } from "react-icons/fi";
import { BsHouseDash } from "react-icons/bs";
import {
  AiOutlineAreaChart,
  AiOutlineAudit,
  AiOutlineBarChart,
  AiOutlineCalendar,
  AiOutlineStock,
} from "react-icons/ai";
import { RiStockLine } from "react-icons/ri";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { BsBarChart, BsKanban } from "react-icons/bs";
import { Bot } from "lucide-react";
import { GiLouvrePyramid } from "react-icons/gi";
import { VscTools } from "react-icons/vsc";
import { FiUserCheck } from "react-icons/fi";
import { GoChecklist } from "react-icons/go";
import { useQueryClient } from "@tanstack/react-query";

const links = [
  {
    title: "Dashboard",
    links: [
      {
        name: "dashboard",
        icon: <BsHouseDash />,
      },
    ],
  },

  {
    title: "Pages",
    links: [
      {
        name: "signup",
        icon: <AiOutlineAudit />,
      },
      {
        name: "Users",
        icon: <FiUserCheck />,
      },
      {
        name: "tools",
        icon: <GoChecklist />,
      },
    ],
  },
  {
    title: "Apps",
    links: [
      {
        name: "Chat",
        icon: <IoChatbubbleEllipsesOutline />,
      },
      {
        name: "ai-chat",
        icon: <Bot />,
      },
      {
        name: "calendar",
        icon: <AiOutlineCalendar />,
      },
      {
        name: "kanban",
        icon: <BsKanban />,
      },
      {
        name: "userkanban",
        icon: <BsKanban />,
      },
      {
        name: "editor",
        icon: <FiEdit />,
      },
      {
        name: "Tooling",
        icon: <VscTools />,
      },
      {
        name: "ExitTooling",
        icon: <VscTools />,
      },
    ],
  },
  {
    title: "Charts",
    links: [
      {
        name: "line",
        icon: <AiOutlineStock />,
      },
      {
        name: "area",
        icon: <AiOutlineAreaChart />,
      },

      {
        name: "bar",
        icon: <AiOutlineBarChart />,
      },
      {
        name: "pie",
        icon: <FiPieChart />,
      },
      {
        name: "financial",
        icon: <RiStockLine />,
      },
      {
        name: "color-mapping",
        icon: <BsBarChart />,
      },
      {
        name: "pyramid",
        icon: <GiLouvrePyramid />,
      },
      {
        name: "stacked",
        icon: <AiOutlineBarChart />,
      },
    ],
  },
];

function SideBar() {
  const { activeMenu, setActiveMenu, secreenSize, currentColor } =
    useStateContext();
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);

  const handelCloseSideBar = () => {
    if (activeMenu && secreenSize <= 900) {
      setActiveMenu(false);
    }
  };
  // Filter function to determine which links to show
  const shouldShowLink = (linkName) => {
    if (linkName === "kanban") return authUser?.isAdmin;
    if (linkName === "userkanban") return !authUser?.isAdmin;
    return true;
  };

  const activeLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg  text-white  text-md m-2";
  const normalLink =
    "flex items-center gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2";
  return (
    <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10">
      {activeMenu && (
        <>
          <div className="flex justify-between items-center">
            <Link
              to="/"
              onClick={handelCloseSideBar}
              className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
            >
              <svg
                className="size-5"
                style={{ color: currentColor }}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* <SiShopware color={currentColor} />{" "} */}
              <span style={{ color: currentColor }}>UpKeepPro</span>
            </Link>
            <TooltipComponent content="Menu" position="BottomCenter">
              <button
                type="button"
                onClick={() => setActiveMenu(!activeMenu)}
                style={{ color: currentColor }}
                className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
              >
                <MdOutlineCancel />
              </button>
            </TooltipComponent>
          </div>
          <div className="mt-10 ">
            {links.map((item) => (
              <div key={item.title}>
                <p className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase">
                  {item.title}
                </p>
                {item.links
                  .filter((link) => shouldShowLink(link.name))
                  .map((link) => (
                    <NavLink
                      to={`/${link.name}`}
                      key={link.name}
                      onClick={handelCloseSideBar}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? currentColor : "",
                      })}
                      className={({ isActive }) =>
                        isActive ? activeLink : normalLink
                      }
                    >
                      {link.icon}
                      <span className="capitalize ">{link.name}</span>
                    </NavLink>
                  ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SideBar;
