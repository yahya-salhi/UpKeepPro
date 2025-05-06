import moment from "moment";
import { useMemo } from "react";

// Reusable badge component
const Badge = ({ children, colorClass }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
    {children}
  </span>
);

// Status badge configuration
const statusBadgeConfig = {
  done: "bg-green-100 text-green-800 border border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  inprogress: "bg-blue-100 text-blue-800 border border-blue-200",
  default: "bg-gray-100 text-gray-800 border border-gray-200",
};

// Priority badge configuration
const priorityBadgeConfig = {
  high: "bg-red-100 text-red-800 border border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  low: "bg-green-100 text-green-800 border border-green-200",
  default: "bg-gray-100 text-gray-800 border border-gray-200",
};

function TaskListTable({ tabledata }) {
  // Memoize the table data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => tabledata, [tabledata]);

  // Format date function
  const formatDate = (date) => {
    return date ? moment(date).format("DD/MM/YYYY") : "";
  };

  return (
    <div className="overflow-hidden bg-white shadow-md rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr key={"header"}>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Created on
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {memoizedData.map((task) => (
              <tr
                key={task._id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                    {task.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    colorClass={
                      statusBadgeConfig[task.status] ||
                      statusBadgeConfig.default
                    }
                  >
                    {task.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    colorClass={
                      priorityBadgeConfig[task.priority] ||
                      priorityBadgeConfig.default
                    }
                  >
                    {task.priority}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                  {formatDate(task.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TaskListTable;
