import { LuFileSpreadsheet } from "react-icons/lu";
import DashboardKanban from "../../components/kanban/DashbordKanban";
import { map } from "lodash";
import UserCard from "./UserCard";
import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";

function ManageUsers() {
  const [allUsers, setAllUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        // Fetch only users with assigned tasks and their task counts
        const res = await axiosInstance.get("/users/users-tasks");
        // The backend returns an array of users with pendingTasks, inProgressTasks, completedTasks
        // Filter out users with no tasks assigned
        const usersWithTasks = res.data.filter(
          (user) =>
            user.pendingTasks > 0 ||
            user.inProgressTasks > 0 ||
            user.completedTasks > 0
        );
        setAllUsers(usersWithTasks);
      } catch {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleDownloadReport = () => {
    // Logic to download the report
    console.log("Download report clicked");
  };

  return (
    <DashboardKanban activeMenu="manageUsers">
      <div className="mt-5 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 font-sans">
            Team Members
          </h2>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg shadow hover:from-blue-700 hover:to-green-600 transition-all duration-200 font-medium text-base"
            onClick={handleDownloadReport}
          >
            <LuFileSpreadsheet className="text-2xl" />
            <span>Download Report</span>
          </button>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-300 mb-4 text-base font-sans">
            Manage your team members and their roles.
          </p>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></span>
              <span className="ml-3 text-gray-500 dark:text-gray-300">
                Loading users...
              </span>
            </div>
          ) : error ? (
            <p className="text-red-500 mt-2 text-center">{error}</p>
          ) : allUsers && allUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {map(allUsers, (user) => (
                <UserCard key={user._id || user.id} userInfo={user} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-2 text-center">No users found.</p>
          )}
        </div>
      </div>
    </DashboardKanban>
  );
}

export default ManageUsers;
