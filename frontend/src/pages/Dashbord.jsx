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
import { useMemo } from "react";
import { Button, LineChart, SparkLine } from "../components";
import { useDashboardData } from "../hooks/useDashboardData";
import PieChart from "../pages/kanban/PieChart";
import BarChart from "../pages/kanban/BarChart";
import { medicalproBranding, weeklyStats, dropdownData } from "../data/dummy";
import { useStateContext } from "../contexts/ContextProvider";
import product9 from "../data/product9.jpg";
import { useQuery } from "@tanstack/react-query";
import ChatInterface from "../components/ChatInterface";

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

  const SparklineAreaData = [
    { x: 1, y: 2 },
    { x: 2, y: 6 },
    { x: 3, y: 8 },
    { x: 4, y: 5 },
    { x: 5, y: 10 },
  ];

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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div
              className="p-4 text-white flex items-center justify-between"
              style={{ backgroundColor: currentColor }}
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
                {dashboardData.pieChartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: ["#F59E0B", "#3B82F6", "#10B981"][
                            index
                          ],
                        }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">{item.count}</span> (
                      {Math.round(
                        (item.count / dashboardData.taskStats?.total) * 100 || 0
                      )}
                      %)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Priority Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
            <div
              className="p-4 text-white flex items-center justify-between"
              style={{ backgroundColor: currentColor }}
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
                {dashboardData.barChartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: ["#EF4444", "#F59E0B", "#10B981"][
                            index
                          ],
                        }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {item.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-semibold">{item.count}</span> (
                      {Math.round(
                        (item.count / dashboardData.taskStats?.total) * 100 || 0
                      )}
                      %)
                    </div>
                  </div>
                ))}
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
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
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
                          <span className="text-sm text-gray-600 dark:text-gray-400">
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
                          <span className="text-sm text-gray-600 dark:text-gray-400">
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
          {/* Weekly Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaChartLine
                  className="text-xl"
                  style={{ color: currentColor }}
                />
                Weekly Stats
              </h3>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <IoIosMore className="text-xl" />
              </button>
            </div>
            <div className="space-y-4">
              {weeklyStats.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 rounded-lg text-white"
                      style={{ background: item.iconBg }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      item.pcColor === "green-600"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {item.amount}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <SparkLine
                currentColor={currentColor}
                id="area-sparkLine"
                height="160px"
                type="Area"
                data={SparklineAreaData}
                width="320"
                color="rgb(242, 252, 253)"
              />
            </div>
          </div>

          {/* MedicalPro Branding */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FaChartLine
                  className="text-xl"
                  style={{ color: currentColor }}
                />
                MedicalPro Branding
              </h3>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <IoIosMore className="text-xl" />
              </button>
            </div>
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 text-xs font-medium text-white bg-orange-500 rounded-full">
                16 APR, 2021
              </div>
              <div className="grid grid-cols-3 gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                {medicalproBranding.data.map((item) => (
                  <div key={item.title}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.title}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Teams
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {medicalproBranding.teams.map((item) => (
                      <span
                        key={item.name}
                        className="px-3 py-1 text-xs font-medium text-white rounded-full"
                        style={{ background: item.color }}
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Leaders
                  </p>
                  <div className="flex gap-2">
                    {medicalproBranding.leaders.map((item, index) => (
                      <img
                        key={index}
                        src={item.image}
                        alt=""
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
