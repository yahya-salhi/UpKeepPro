import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashbordKanban from "../../components/kanban/DashbordKanban";
import { useNavigate } from "react-router-dom";
import { LuFileSpreadsheet, LuRefreshCw } from "react-icons/lu";
import TaskStatusTabs from "../../components/kanban/TaskStatusTabs";
import TaskCard from "../../components/kanban/TaskCard";

function ManageTask() {
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
    queryKey: ["tasks", filterStatus],
    queryFn: () => fetchTasks(filterStatus),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
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
    navigate("/kanban/createtask", { state: { taskId: taskData._id } });
  };

  const handleDownloadReport = async () => {
    try {
      const response = await fetch(`/api/reportsTask/export/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report: " + (error.message || "Unknown error"));
    }
  };

  return (
    <DashbordKanban>
      <div className="p-5">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-2xl font-medium text-gray-800">
              My Tasks
            </h2>
            <button
              className="flex lg:hidden items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              onClick={handleDownloadReport}
            >
              <LuFileSpreadsheet className="text-lg" />
              <span>Download Report</span>
            </button>
          </div>

          {tabs[0].count > 0 && (
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />

              <button
                className="hidden lg:flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                onClick={handleDownloadReport}
              >
                <LuFileSpreadsheet className="text-lg" />
                <span>Download Report</span>
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LuRefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
            <span className="ml-2 text-gray-600">Loading tasks...</span>
          </div>
        ) : isError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-medium">Error loading tasks</p>
            <p className="text-sm mt-1">{error?.message || "Unknown error"}</p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm flex items-center gap-1"
            >
              <LuRefreshCw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : allTasks.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No tasks found</p>
            <p className="text-sm mt-1">
              Try changing the filter or create a new task
            </p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg inline-block">
              <p className="text-sm text-blue-700">
                Current filter: <strong>{filterStatus}</strong>
              </p>
              <button
                onClick={() => setFilterStatus(STATUS_MAP.all)}
                className="mt-2 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-700"
              >
                Reset Filter
              </button>
            </div>
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
                progress={item.progress || 0}
                createdAt={item.createdAt}
                dueDate={item.dueDate}
                assignedTo={
                  item.assignedTo?.map((user) => user.profileImg) || []
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
    </DashbordKanban>
  );
}

export default ManageTask;
