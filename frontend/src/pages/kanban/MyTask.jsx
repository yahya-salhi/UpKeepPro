import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LuRefreshCw } from "react-icons/lu";
import TaskStatusTabs from "../../components/kanban/TaskStatusTabs";
import TaskCard from "../../components/kanban/TaskCard";
import avatar from "../../data/avatar.jpg";

function MyTask({ onSelectTask }) {
  const STATUS_MAP = {
    all: "all",
    pending: "pending",
    inprogress: "inprogress",
    done: "done",
  };

  const [filterStatus, setFilterStatus] = useState(STATUS_MAP.all);
  const navigate = useNavigate();

  const fetchTasks = async (status) => {
    const url = `/api/tasks${
      status !== STATUS_MAP.all ? `?status=${status}` : ""
    }`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch tasks");
    }

    return response.json();
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["userTasks", filterStatus],
    queryFn: () => fetchTasks(filterStatus),
    staleTime: 0, // Disable cache to always get fresh data
    cacheTime: 0, // Disable cache
    refetchInterval: 5000, // Poll every 5 seconds (less frequent than admin)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const allTasks = data?.tasks || [];
  const statusSummary = data?.statusSummary || {};

  const tabs = [
    { label: "All", value: STATUS_MAP.all, count: statusSummary.all || 0 },
    {
      label: "Pending",
      value: STATUS_MAP.pending,
      count: statusSummary.pendingTask || 0,
    },
    {
      label: "In Progress",
      value: STATUS_MAP.inprogress,
      count: statusSummary.inProgressTask || 0,
    },
    {
      label: "Completed",
      value: STATUS_MAP.done,
      count: statusSummary.completedTask || 0,
    },
  ];

  const handleClick = (taskData) => {
    if (onSelectTask) {
      onSelectTask(taskData);
    } else {
      // Fallback navigation if onSelectTask is not provided
      navigate("/userkanban/view", { state: { taskId: taskData._id } });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-5">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              My Tasks
            </h3>
          </div>

          {tabs[0].count > 0 && (
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LuRefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Loading tasks...
            </span>
          </div>
        ) : isError ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            <p className="font-medium">Error loading tasks</p>
            <p className="text-sm mt-1">{error?.message || "Unknown error"}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 rounded text-sm flex items-center gap-1"
            >
              <LuRefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : allTasks.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No tasks assigned</p>
            <p className="text-sm mt-1">
              {filterStatus === STATUS_MAP.all
                ? "You don't have any tasks assigned yet"
                : `No tasks with status: ${filterStatus}`}
            </p>
            {filterStatus !== STATUS_MAP.all && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg inline-block">
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Current filter: <strong>{filterStatus}</strong>
                </p>
                <button
                  onClick={() => setFilterStatus(STATUS_MAP.all)}
                  className="mt-2 text-xs bg-blue-100 dark:bg-blue-800 hover:bg-blue-200 dark:hover:bg-blue-700 px-2 py-1 rounded text-blue-700 dark:text-blue-300"
                >
                  Show All Tasks
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {allTasks.map((item) => (
              <TaskCard
                key={item._id}
                title={item.title}
                description={item.description}
                priority={item.priority}
                status={item.status}
                createdAt={item.createdAt}
                dueDate={item.dueDate}
                assignedTo={
                  item.assignedTo?.map((user) => user.profileImg || avatar) ||
                  []
                }
                attachments={item.attachments?.length || 0}
                completedTodoCount={item.completedTodoCount || 0}
                todochecklist={item.todochecklist || []}
                onClick={() => handleClick(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyTask;
