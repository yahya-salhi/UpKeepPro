import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TaskListTable from "@/components/kanban/TaskListTable";
import ViewTaskDetails from "./ViewTaskDetails";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import { useUserDashboardData } from "../../hooks/useUserDashboardData";
import { useQueryClient } from "@tanstack/react-query";
import {
  LucideArrowRight,
  LucideRefreshCw,
  LucideBarChart2,
  LucidePieChart,
  LucideListTodo,
  Home,
  Eye,
  ListTodo,
} from "lucide-react";

function UserKanban() {
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);
  const userId = authUser?._id;
  const { data, isLoading, isError, error, refetch } =
    useUserDashboardData(userId);
  const [selectedTask, setSelectedTask] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // StatCard styled like Kanban
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
      </div>
    );
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Navigation */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                User Dashboard
              </h1>
            </div>
            <nav className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  location.pathname === "/userkanban"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => navigate("/userkanban")}
              >
                <Home size={18} />
                <span>Dashboard</span>
              </button>
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  location.pathname === "/userkanban"
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => {
                  // Scroll to Recent Tasks section since My Tasks section was removed
                  const recentTasksSection = document.querySelector(
                    "#recent-tasks-section"
                  );
                  if (recentTasksSection) {
                    recentTasksSection.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <ListTodo size={18} />
                <span>My Tasks</span>
              </button>
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  location.pathname === "/userkanban/view"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => navigate("/userkanban/view")}
              >
                <Eye size={18} />
                <span>View Task Details</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Dashboard Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                My Dashboard Overview
              </h2>
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
                          backgroundColor: ["#F59E0B", "#3B82F6", "#10B981"][
                            index
                          ],
                        }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.status}: {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar Chart */}
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
                          backgroundColor: ["#EF4444", "#F59E0B", "#10B981"][
                            index
                          ],
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
            <div
              id="recent-tasks-section"
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
            >
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <LucideListTodo className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Tasks
                </h3>
                <button
                  onClick={() => setSelectedTask(null)}
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

            {/* Task Details Modal */}
            {selectedTask && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Task Details</h3>
                <ViewTaskDetails
                  task={selectedTask}
                  onClose={() => setSelectedTask(null)}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserKanban;
