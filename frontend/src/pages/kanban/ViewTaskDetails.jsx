import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LucideListTodo,
  LucideCalendar,
  LucideUser,
  LucideFlag,
} from "lucide-react";

function ViewTaskDetails({ task, onClose }) {
  // If task is passed as prop (from modal), use it; otherwise, fetch by ID from URL
  const { taskId } = useParams();
  const [taskData, setTaskData] = useState(task || null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed to fetch task details");
      return res.json();
    },
    enabled: !!taskId && !task,
  });

  useEffect(() => {
    if (data) setTaskData(data);
  }, [data]);

  if (isLoading) return <div className="p-6">Loading task details...</div>;
  if (isError)
    return <div className="p-6 text-red-500">Failed to load task details.</div>;
  if (!taskData) return <div className="p-6">No task selected.</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <LucideListTodo className="h-6 w-6 text-blue-600" />
          {taskData.title}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 text-lg font-bold"
          >
            ×
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-2 text-gray-700 dark:text-gray-300">
            <LucideUser className="inline h-4 w-4 mr-1 text-blue-500" />
            <span className="font-medium">Assigned To:</span>{" "}
            {taskData.assignedTo?.map((u) => u.name || u.username).join(", ")}
          </div>
          <div className="mb-2 text-gray-700 dark:text-gray-300">
            <LucideFlag className="inline h-4 w-4 mr-1 text-orange-500" />
            <span className="font-medium">Priority:</span> {taskData.priority}
          </div>
          <div className="mb-2 text-gray-700 dark:text-gray-300">
            <LucideCalendar className="inline h-4 w-4 mr-1 text-green-500" />
            <span className="font-medium">Due Date:</span>{" "}
            {taskData.dueDate
              ? new Date(taskData.dueDate).toLocaleDateString()
              : "-"}
          </div>
          <div className="mb-2 text-gray-700 dark:text-gray-300">
            <span className="font-medium">Status:</span> {taskData.status}
          </div>
        </div>
        <div>
          <div className="mb-2 text-gray-700 dark:text-gray-300">
            <span className="font-medium">Description:</span>
            <div className="mt-1 text-gray-600 dark:text-gray-400 whitespace-pre-line">
              {taskData.description || "No description provided."}
            </div>
          </div>
          {taskData.todochecklist && taskData.todochecklist.length > 0 && (
            <div className="mt-4">
              <span className="font-medium">Checklist:</span>
              <ul className="list-disc ml-6 mt-1">
                {taskData.todochecklist.map((item, idx) => (
                  <li
                    key={idx}
                    className={
                      item.completed ? "line-through text-green-600" : ""
                    }
                  >
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      {taskData.attchments && taskData.attchments.length > 0 && (
        <div className="mt-4">
          <span className="font-medium">Attachments:</span>
          <ul className="list-disc ml-6 mt-1">
            {taskData.attchments.map((file, idx) => (
              <li key={idx}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  {file.name || file.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ViewTaskDetails;
