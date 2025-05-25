import PieChart from "./kanban/PieChart";
import BarChart from "./kanban/BarChart";
// import DashbordKanban from "../components/kanban/DashbordKanban";
import TaskListTable from "@/components/kanban/TaskListTable";
import {
  LucideArrowRight,
  LucideRefreshCw,
  LucideBarChart2,
  LucidePieChart,
  LucideListTodo,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "../App.css";

import { useDashboardData } from "../hooks/useDashboardData"; // Assuming you have a custom hook for fetching dashboard data
import DashbordKanban from "@/components/kanban/DashbordKanban";

// Enhanced StatCard component with better styling
const StatCard = ({ title, value, color, icon }) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      value: "text-blue-900",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      value: "text-yellow-900",
      border: "border-yellow-200",
      iconBg: "bg-yellow-100",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      value: "text-orange-900",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      value: "text-green-900",
      border: "border-green-200",
      iconBg: "bg-green-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      value: "text-purple-900",
      border: "border-purple-200",
      iconBg: "bg-purple-100",
    },
  };

  return (
    <div
      className={`flex flex-col p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${colorClasses[color].bg} border ${colorClasses[color].border}`}
    >
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-semibold ${colorClasses[color].text}`}>
          {title}
        </h3>
        <div className={`p-2 rounded-lg ${colorClasses[color].iconBg}`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-bold mt-3 ${colorClasses[color].value}`}>
        {value}
      </p>
      <div className="mt-3 h-1 w-full bg-white rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color].bg.replace("50", "300")}`}
          style={{ width: `${(value / 100) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

function Kanban() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useDashboardData();

  const onSeeMore = () => {
    navigate("manage");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <LucideRefreshCw className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-red-600">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center"
          >
            <LucideRefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashbordKanban>
      <div className="p-6 space-y-6">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard Overview
          </h2>
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition shadow-sm"
            disabled={isLoading}
          >
            <LucideRefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>{isLoading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tasks"
            value={data.stats.total}
            color="blue"
            icon={<LucideListTodo className="h-5 w-5 text-blue-600" />}
          />
          <StatCard
            title="Pending"
            value={data.stats.pending}
            color="yellow"
            icon={<LucideListTodo className="h-5 w-5 text-yellow-600" />}
          />
          <StatCard
            title="In Progress"
            value={data.stats.inProgress}
            color="orange"
            icon={<LucideListTodo className="h-5 w-5 text-orange-600" />}
          />
          <StatCard
            title="Completed"
            value={data.stats.completed}
            color="green"
            icon={<LucideListTodo className="h-5 w-5 text-green-600" />}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <LucidePieChart className="h-5 w-5 mr-2 text-blue-600" />
                Task Status
              </h3>
            </div>
            <div className="h-64">
              <PieChart
                data={data.pieChartData}
                colors={["#F59E0B", "#3B82F6", "#10B981"]}
              />
            </div>
            <div className="mt-6 flex justify-center gap-4 flex-wrap">
              {data.pieChartData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor: ["#F59E0B", "#3B82F6", "#10B981"][index],
                    }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.status}: {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Bar Chart Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <LucideBarChart2 className="h-5 w-5 mr-2 text-blue-600" />
                Task Priority
              </h3>
            </div>
            <div className="h-64">
              <BarChart
                data={data.barChartData}
                colors={["#EF4444", "#F59E0B", "#10B981"]}
              />
            </div>
            <div className="mt-6 flex justify-center gap-4 flex-wrap">
              {data.barChartData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor: ["#EF4444", "#F59E0B", "#10B981"][index],
                    }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.priority}: {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <LucideListTodo className="h-5 w-5 mr-2 text-blue-600" />
              Recent Tasks
            </h3>
            <button
              onClick={onSeeMore}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <span>View All</span>
              <LucideArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="p-5">
            <TaskListTable tabledata={data.recentTasks} />
          </div>
        </div>
      </div>
    </DashbordKanban>
  );
}

export default Kanban;
