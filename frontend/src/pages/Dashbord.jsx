import { BsCurrencyDollar } from "react-icons/bs";
import { IoIosMore } from "react-icons/io";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import {
  FaTasks,
  FaGraduationCap,
  FaUsers,
  FaChartLine,
  FaGlobe,
  FaChartBar,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaCalendarAlt,
  FaRegClock,
} from "react-icons/fa";
import { BsBoxSeam } from "react-icons/bs";
import { FiBarChart } from "react-icons/fi";
import { HiOutlineRefresh } from "react-icons/hi";
import { useMemo, useState } from "react";
import { Button, LineChart } from "../components";
import { useDashboardData } from "../hooks/useDashboardData";
import { useWeeklyEvents } from "../hooks/useWeeklyEvents";
import PieChart from "../pages/kanban/PieChart";
import BarChart from "../pages/kanban/BarChart";
import { dropdownData } from "../data/dummy";
import { useStateContext } from "../contexts/ContextProvider";
import product9 from "../data/product9.jpg";
import { useQuery } from "@tanstack/react-query";
import ChatInterface from "../components/ChatInterface";
import WhoToFollowCarousel from "../components/WhoToFollowCarousel";

const DropDown = ({ currentMode }) => (
  <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
    <DropDownListComponent
      id="time"
      fields={{ text: "Time", value: "Id" }}
      style={{ border: "none", color: currentMode === "Dark" && "white" }}
      value="1"
      dataSource={dropdownData}
      popupHeight="220px"
      popupWidth="120px"
    />
  </div>
);

const Dashboard = () => {
  const { currentColor, currentMode } = useStateContext();
  const { data: dashboardData } = useDashboardData();
  const [weekOffset, setWeekOffset] = useState(0);
  const {
    weeklyEvents,
    weekDays,
    categorizedEvents,
    weekRange,
    isLoading: eventsLoading,
    isError: eventsError,
    formatEventTime,
  } = useWeeklyEvents(weekOffset);

  const fetchUserCount = async () => {
    const res = await fetch("/api/users/count");
    if (!res.ok) throw new Error("Failed to fetch user count");
    return res.json();
  };
  const { data, isLoading } = useQuery({
    queryKey: ["userCount"],
    queryFn: fetchUserCount,
  });

  const memoizedEarningData = useMemo(
    () => [
      {
        icon: <FaTasks className="text-xl" />,
        amount: isLoading ? "Loading..." : dashboardData?.stats?.total || "0",
        percentage: "12%",
        title: "Total Tasks",
        iconColor: "#03C9D7",
        iconBg: "#E5FAFB",
        pcColor: "red-600",
      },
      {
        icon: <BsBoxSeam className="text-xl" />,
        amount: isLoading ? "Loading..." : dashboardData?.stats?.pending || "0",
        percentage: "+23%",
        title: "Pending Tasks",
        iconColor: "rgb(255, 244, 229)",
        iconBg: "rgb(254, 201, 15)",
        pcColor: "green-600",
      },
      {
        icon: <FiBarChart className="text-xl" />,
        amount: isLoading
          ? "Loading..."
          : dashboardData?.stats?.inProgress || "0",
        percentage: "+38%",
        title: "In Progress Tasks",
        iconColor: "rgb(228, 106, 118)",
        iconBg: "rgb(255, 244, 229)",
        pcColor: "green-600",
      },
      {
        icon: <HiOutlineRefresh className="text-xl" />,
        amount: isLoading
          ? "Loading..."
          : dashboardData?.stats?.completed || "0",
        percentage: "-12%",
        title: "Completed Tasks",
        iconColor: "rgb(0, 194, 146)",
        iconBg: "rgb(235, 250, 242)",
        pcColor: "red-600",
      },
    ],
    [dashboardData, isLoading]
  );

  return (
    <div className="mt-20 px-4 sm:px-6 lg:px-8 pb-8">
      {" "}
      {/* Reduced top margin from mt-24 to mt-20 */}
      <div className="max-w-7xl mx-auto space-y-6">
        {" "}
        {/* Reduced space-y-8 to space-y-6 */}
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome to your personalized dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
              <FaCalendarAlt className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm">
              <FaRegClock className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
        {/* Top Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Active Users Card */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Users
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {data?.count || 0}
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    registered
                  </span>
                </div>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: currentColor }}
              >
                <BsCurrencyDollar className="text-xl text-white" />
              </div>
            </div>
          </div>

          {/* Task Stats Cards */}
          {memoizedEarningData.map((item) => (
            <div
              key={item.title}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-all duration-200 hover:shadow-md border border-gray-100 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    color: item.iconColor,
                    backgroundColor: item.iconBg,
                  }}
                >
                  {item.icon}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {item.amount}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    {item.percentage.startsWith("+") ? (
                      <FaArrowUp className="text-green-500 text-xs" />
                    ) : (
                      <FaArrowDown className="text-red-500 text-xs" />
                    )}
                    <p
                      className={`text-sm font-medium ${
                        item.pcColor === "green-600"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {item.percentage}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {item.title}
              </p>
            </div>
          ))}
        </div>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Status Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
            <div
              className="p-5 text-white flex items-center justify-between bg-gradient-to-r"
              style={{
                backgroundImage:
                  currentMode === "Dark"
                    ? `linear-gradient(to right, ${currentColor}, ${currentColor}dd)`
                    : `linear-gradient(to right, ${currentColor}, ${currentColor}dd)`,
              }}
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaChartPie className="text-xl" />
                Task Status
              </h3>
              <DropDown currentMode={currentMode} />
            </div>
            <div className="p-6">
              <div className="h-64 mb-6">
                <PieChart
                  data={dashboardData.pieChartData}
                  colors={["#F59E0B", "#3B82F6", "#10B981"]}
                />
              </div>
              <div className="space-y-3">
                {dashboardData.pieChartData.map((item, index) => {
                  const colors = [
                    {
                      bg: "#F59E0B",
                      bgHover: "#F59E0B",
                      lightBg: "rgba(245, 158, 11, 0.1)",
                      darkBg: "rgba(245, 158, 11, 0.15)",
                    },
                    {
                      bg: "#3B82F6",
                      bgHover: "#3B82F6",
                      lightBg: "rgba(59, 130, 246, 0.1)",
                      darkBg: "rgba(59, 130, 246, 0.15)",
                    },
                    {
                      bg: "#10B981",
                      bgHover: "#10B981",
                      lightBg: "rgba(16, 185, 129, 0.1)",
                      darkBg: "rgba(16, 185, 129, 0.15)",
                    },
                  ];

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 transform hover:translate-x-1 ${
                        currentMode === "Dark"
                          ? `hover:bg-${colors[index].darkBg} bg-gray-700/30`
                          : `hover:bg-${colors[index].lightBg} bg-gray-50`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <span
                            className="w-4 h-4 rounded-full block"
                            style={{
                              backgroundColor: colors[index].bg,
                              boxShadow: `0 0 10px ${colors[index].bg}80`,
                            }}
                          />
                          <span
                            className="absolute -inset-1 rounded-full opacity-30 animate-pulse"
                            style={{ backgroundColor: colors[index].bg }}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            currentMode === "Dark"
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`text-sm font-bold ${
                            currentMode === "Dark"
                              ? "text-white"
                              : "text-gray-800"
                          }`}
                        >
                          {item.count}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            currentMode === "Dark"
                              ? `bg-${colors[index].darkBg} text-${colors[
                                  index
                                ].bg.replace("#", "")}`
                              : `bg-${colors[index].lightBg} text-${colors[
                                  index
                                ].bg.replace("#", "")}`
                          }`}
                        >
                          {Math.round(
                            (item.count / dashboardData.taskStats?.total) *
                              100 || 0
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Task Priority Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl">
            <div
              className="p-5 text-white flex items-center justify-between bg-gradient-to-r"
              style={{
                backgroundImage:
                  currentMode === "Dark"
                    ? `linear-gradient(to right, ${currentColor}, ${currentColor}dd)`
                    : `linear-gradient(to right, ${currentColor}, ${currentColor}dd)`,
              }}
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaChartBar className="text-xl" />
                Task Priority
              </h3>
              <DropDown currentMode={currentMode} />
            </div>
            <div className="p-6">
              <div className="h-64 mb-6">
                <BarChart
                  data={dashboardData.barChartData}
                  colors={["#EF4444", "#F59E0B", "#10B981"]}
                />
              </div>
              <div className="space-y-3">
                {dashboardData.barChartData.map((item, index) => {
                  const colors = [
                    {
                      bg: "#EF4444",
                      lightBg: "rgba(239, 68, 68, 0.1)",
                      darkBg: "rgba(239, 68, 68, 0.15)",
                    },
                    {
                      bg: "#F59E0B",
                      lightBg: "rgba(245, 158, 11, 0.1)",
                      darkBg: "rgba(245, 158, 11, 0.15)",
                    },
                    {
                      bg: "#10B981",
                      lightBg: "rgba(16, 185, 129, 0.1)",
                      darkBg: "rgba(16, 185, 129, 0.15)",
                    },
                  ];

                  const priorityIcons = [
                    <svg
                      key="high"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>,
                    <svg
                      key="medium"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18 12H6"
                      />
                    </svg>,
                    <svg
                      key="low"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>,
                  ];

                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 transform hover:translate-x-1 ${
                        currentMode === "Dark"
                          ? `hover:bg-${colors[index].darkBg} bg-gray-700/30`
                          : `hover:bg-${colors[index].lightBg} bg-gray-50`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-1.5 rounded-lg flex items-center justify-center ${
                            currentMode === "Dark"
                              ? `bg-${colors[index].darkBg} text-${colors[
                                  index
                                ].bg.replace("#", "")}`
                              : `bg-${colors[index].lightBg} text-${colors[
                                  index
                                ].bg.replace("#", "")}`
                          }`}
                        >
                          {priorityIcons[index]}
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            currentMode === "Dark"
                              ? "text-gray-200"
                              : "text-gray-700"
                          }`}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`text-sm font-bold ${
                            currentMode === "Dark"
                              ? "text-white"
                              : "text-gray-800"
                          }`}
                        >
                          {item.count}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${
                            currentMode === "Dark"
                              ? `bg-${colors[index].darkBg} text-${colors[
                                  index
                                ].bg.replace("#", "")}`
                              : `bg-${colors[index].lightBg} text-${colors[
                                  index
                                ].bg.replace("#", "")}`
                          }`}
                        >
                          {Math.round(
                            (item.count / dashboardData.taskStats?.total) *
                              100 || 0
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ChatBot Section - Increased height */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 h-[calc(100vh-5rem)]">
              {" "}
              {/* Increased height by adjusting calculation */}
              <ChatInterface />
            </div>
          </div>

          {/* Overview Section - Matching height */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 h-[calc(100vh-5rem)]">
              <div className="flex flex-col h-full">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Overview
                </h3>

                <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                  {/* ISO Certification Standards */}
                  <div
                    className={`rounded-xl p-6 ${
                      currentMode === "Dark"
                        ? "bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-700"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaGraduationCap
                          className="text-xl"
                          style={{ color: currentColor }}
                        />
                        ISO Certification Standards
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          ISO 21001
                        </span>
                        <span className="px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                          ISO 9001
                        </span>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg ${
                              currentMode === "Dark"
                                ? "bg-blue-900/30 text-blue-400"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <FaGraduationCap className="text-xl" />
                          </div>
                          <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                            ISO 21001: Educational Organizations Management
                          </h5>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          ISO 21001 is a specialized management system standard
                          designed specifically for educational organizations.
                          It provides a framework for establishing,
                          implementing, and maintaining an effective Educational
                          Organizations Management System (EOMS). This standard
                          focuses on enhancing learner satisfaction through
                          improved educational processes, stakeholder
                          engagement, and continuous improvement.
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <FaUsers className="mr-2" />
                            Learner-focused
                          </span>
                          <span className="flex items-center">
                            <FaChartLine className="mr-2" />
                            Process-driven
                          </span>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                currentMode === "Dark"
                                  ? "bg-indigo-900/30 text-indigo-400"
                                  : "bg-indigo-100 text-indigo-600"
                              }`}
                            >
                              <FaChartLine className="text-xl" />
                            </div>
                            <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                              ISO 9001: Quality Management System
                            </h5>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            ISO 9001 is the internationally recognized standard
                            for Quality Management Systems (QMS). It provides a
                            systematic approach to managing organizational
                            processes to ensure consistent quality and
                            continuous improvement. This standard helps
                            organizations enhance customer satisfaction, improve
                            operational efficiency, and maintain competitive
                            advantage through standardized quality management
                            practices.
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <FaGlobe className="mr-2" />
                              Internationally recognized
                            </span>
                            <span className="flex items-center">
                              <FaChartLine className="mr-2" />
                              Quality-driven
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certification Growth Chart */}
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <FaChartLine
                            className="text-xl"
                            style={{ color: currentColor }}
                          />
                          Certification Growth
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Historical and projected certification progress
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          ISO 9001
                        </span>
                        <span className="px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                          ISO 21001
                        </span>
                      </div>
                    </div>
                    <div className="h-[400px] w-full">
                      <LineChart />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            ISO 9001 Current
                          </span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            98%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: "98%" }}
                          ></div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            ISO 21001 Target
                          </span>
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            92%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: "92%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Additional Stats Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Events */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaCalendarAlt
                  className="text-xl"
                  style={{ color: currentColor }}
                />
                Weekly Events
              </h3>
              <div className="flex items-center gap-2">
                <button
                  className={`p-1.5 rounded-md text-xs font-medium ${
                    currentMode === "Dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } transition-colors`}
                  onClick={() => setWeekOffset((prev) => prev - 1)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    />
                  </svg>
                </button>
                <span
                  className={`text-sm ${
                    currentMode === "Dark" ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {weekRange.displayRange}
                </span>
                <button
                  className={`p-1.5 rounded-md text-xs font-medium ${
                    currentMode === "Dark"
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  } transition-colors`}
                  onClick={() => setWeekOffset((prev) => prev + 1)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mini Calendar Week View */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {weekDays.map((day) => (
                <div key={day.name} className="text-center">
                  <div
                    className={`text-xs font-medium mb-1 ${
                      currentMode === "Dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {day.name}
                  </div>
                  <div
                    className={`rounded-full w-8 h-8 mx-auto flex items-center justify-center text-sm transition-colors
                      ${
                        day.isToday
                          ? `bg-${currentColor.replace("#", "")} text-white`
                          : currentMode === "Dark"
                          ? "text-gray-300 hover:bg-gray-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    {day.date.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Event Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  currentMode === "Dark"
                    ? "bg-blue-900/30 text-blue-400"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Upcoming ({categorizedEvents.upcoming.length})</span>
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  currentMode === "Dark"
                    ? "bg-green-900/30 text-green-400"
                    : "bg-green-100 text-green-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Completed ({categorizedEvents.completed.length})</span>
              </div>
              <div
                className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  currentMode === "Dark"
                    ? "bg-yellow-900/30 text-yellow-400"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span>In Progress ({categorizedEvents.inProgress.length})</span>
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {eventsLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : eventsError ? (
                <div
                  className={`text-center p-4 rounded-lg ${
                    currentMode === "Dark"
                      ? "bg-red-900/20 text-red-400"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <p className="font-medium">Error loading events</p>
                  <p className="text-sm mt-1">Please try again later</p>
                </div>
              ) : weeklyEvents.length === 0 ? (
                <div
                  className={`text-center p-4 rounded-lg ${
                    currentMode === "Dark" ? "bg-gray-700/50" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`font-medium ${
                      currentMode === "Dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    No events scheduled this week
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      currentMode === "Dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Add events in the scheduler to see them here
                  </p>
                </div>
              ) : (
                weeklyEvents.map((event) => {
                  // Determine event status
                  const now = new Date();
                  // const isUpcoming = new Date(event.start) > now;
                  const isInProgress =
                    new Date(event.start) <= now && new Date(event.end) >= now;
                  const isCompleted = new Date(event.end) < now;

                  // Determine border color based on status
                  let borderColor = "border-blue-500"; // default: upcoming
                  if (isInProgress) borderColor = "border-yellow-500";
                  if (isCompleted) borderColor = "border-green-500";

                  // Determine status label
                  let statusLabel = "Upcoming";
                  let statusClass =
                    currentMode === "Dark"
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-blue-100 text-blue-600";

                  if (isInProgress) {
                    statusLabel = "In Progress";
                    statusClass =
                      currentMode === "Dark"
                        ? "bg-yellow-900/30 text-yellow-400"
                        : "bg-yellow-100 text-yellow-600";
                  }
                  if (isCompleted) {
                    statusLabel = "Completed";
                    statusClass =
                      currentMode === "Dark"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-green-100 text-green-600";
                  }

                  // Determine priority class
                  let priorityLabel = "Medium Priority";
                  let priorityClass =
                    currentMode === "Dark"
                      ? "bg-yellow-900/30 text-yellow-400"
                      : "bg-yellow-100 text-yellow-600";

                  if (event.priority === "high") {
                    priorityLabel = "High Priority";
                    priorityClass =
                      currentMode === "Dark"
                        ? "bg-red-900/30 text-red-400"
                        : "bg-red-100 text-red-600";
                  } else if (event.priority === "low") {
                    priorityLabel = "Low Priority";
                    priorityClass =
                      currentMode === "Dark"
                        ? "bg-green-900/30 text-green-400"
                        : "bg-green-100 text-green-600";
                  }

                  return (
                    <div
                      key={event._id}
                      className={`p-3 rounded-lg border-l-4 ${borderColor} ${
                        currentMode === "Dark" ? "bg-gray-700/50" : "bg-gray-50"
                      } hover:shadow-md transition-all`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4
                            className={`font-medium ${
                              currentMode === "Dark"
                                ? "text-gray-200"
                                : "text-gray-800"
                            }`}
                          >
                            {event.title}
                          </h4>
                          <p
                            className={`text-xs ${
                              currentMode === "Dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            {formatEventTime(event)}
                          </p>
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${statusClass}`}
                        >
                          {statusLabel}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {event.priority && (
                          <div
                            className={`text-xs px-2 py-0.5 rounded-full ${priorityClass}`}
                          >
                            {priorityLabel}
                          </div>
                        )}
                        {event.location && (
                          <div
                            className={`text-xs ${
                              currentMode === "Dark"
                                ? "text-gray-400"
                                : "text-gray-500"
                            }`}
                          >
                            <span className="inline-block w-1 h-1 rounded-full bg-gray-400 mr-1"></span>
                            {event.location}
                          </div>
                        )}
                      </div>
                      {event.description && (
                        <div
                          className={`mt-2 text-xs ${
                            currentMode === "Dark"
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          {event.description.length > 100
                            ? `${event.description.substring(0, 100)}...`
                            : event.description}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* View All Button */}
            <div className="mt-4 text-center">
              <a
                href="/calendar"
                className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${
                    currentMode === "Dark"
                      ? "text-white bg-blue-600 hover:bg-blue-700"
                      : "text-white bg-blue-500 hover:bg-blue-600"
                  }`}
                style={{ backgroundColor: currentColor }}
              >
                <span>View Full Calendar</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Who to Follow Carousel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <WhoToFollowCarousel />
          </div>

          {/* Daily Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaChartLine
                  className="text-xl"
                  style={{ color: currentColor }}
                />
                Daily Activities
              </h3>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <IoIosMore className="text-xl" />
              </button>
            </div>
            <div className="space-y-6">
              <img
                src={product9}
                alt="Daily Activities"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    React 18 coming soon!
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    By Johnathan Doe
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This will be the small description for the news you have shown
                  here. There could be some great info.
                </p>
                <Button
                  color="white"
                  bgColor={currentColor}
                  text="Read More"
                  borderRadius="10px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
