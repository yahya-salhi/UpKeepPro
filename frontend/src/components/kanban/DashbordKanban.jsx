import { useNavigate, useLocation } from "react-router-dom";
import { Plus, Users, ClipboardList, Home } from "lucide-react";

function DashbordKanban({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isCreateTaskPage = location.pathname === "/kanban/createtask";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Navigation */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Kanban Board
              </h1>
            </div>
            <nav className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  !isCreateTaskPage
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => navigate("/kanban")}
              >
                <Home size={18} />
                <span>Dashboard</span>
              </button>
              <button
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isCreateTaskPage
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() =>
                  isCreateTaskPage
                    ? navigate("/kanban")
                    : navigate("/kanban/createtask")
                }
              >
                <Plus size={18} />
                <span>Create Task</span>
              </button>
              <button
                className="px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/kanban/manage")}
              >
                <ClipboardList size={18} />
                <span>Manage Tasks</span>
              </button>
              <button
                className="px-4 py-2 rounded-lg flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => navigate("/kanban/team")}
              >
                <Users size={18} />
                <span>Team Members</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashbordKanban;
