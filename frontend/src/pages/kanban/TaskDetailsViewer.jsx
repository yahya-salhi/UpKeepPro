import { useState, useRef } from "react";
import {
  X,
  Calendar,
  Flag,
  Clock,
  Paperclip,
  CheckSquare,
  ArrowLeft,
  Download,
  Upload,
  Plus,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import moment from "moment";
import AvatarGroup from "../../components/kanban/AvatarGroup";
import avatar from "../../data/avatar.jpg";

function TaskDetailsViewer({ task, onClose }) {
  const queryClient = useQueryClient();
  const [localTask, setLocalTask] = useState(task);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Mutation for updating checklist items
  const updateChecklistMutation = useMutation({
    mutationFn: async ({ taskId, todoIndex, completed }) => {
      const response = await fetch(
        `/api/tasks/${taskId}/checklist/${todoIndex}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ completed }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update checklist item");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update local task state
      setLocalTask(data.task);

      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["userTasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["userDashboardData"] });

      toast.success("Checklist updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update checklist item");
    },
  });

  // Handle checklist item toggle
  const handleChecklistToggle = (todoIndex, currentCompleted) => {
    updateChecklistMutation.mutate({
      taskId: localTask._id,
      todoIndex,
      completed: !currentCompleted,
    });
  };

  // Mutation for uploading user submissions
  const uploadSubmissionMutation = useMutation({
    mutationFn: async ({ taskId, files }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/tasks/${taskId}/submissions`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload files");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setLocalTask(data.task);
      queryClient.invalidateQueries({ queryKey: ["userTasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["userDashboardData"] });

      const fileCount = data.uploadedFiles?.length || 1;
      const fileText = fileCount === 1 ? "file" : "files";
      toast.success(
        `${fileCount} ${fileText} uploaded and sent to admin successfully!`,
        { duration: 4000 }
      );
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload files");
      setIsUploading(false);
    },
  });

  // Handle file download
  const handleDownload = (attachment) => {
    try {
      // Clean and validate base64 data
      let base64Data = attachment.data;

      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      if (base64Data.includes(",")) {
        base64Data = base64Data.split(",")[1];
      }

      // Remove any whitespace or invalid characters
      base64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, "");

      // Validate base64 format
      if (!base64Data || base64Data.length === 0) {
        throw new Error("Invalid or empty base64 data");
      }

      // Add padding if necessary
      while (base64Data.length % 4) {
        base64Data += "=";
      }

      // Convert base64 to blob using fetch API (more reliable)
      const dataUrl = `data:${
        attachment.type || "application/octet-stream"
      };base64,${base64Data}`;

      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = attachment.name || "download";
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          toast.success(`Downloaded ${attachment.name}`);
        })
        .catch((error) => {
          console.error("Blob conversion error:", error);
          toast.error("Failed to process file for download");
        });
    } catch (error) {
      toast.error("Failed to download file");
      console.error("Download error:", error);
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    uploadSubmissionMutation.mutate({
      taskId: localTask._id,
      files,
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No task selected</p>
      </div>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "inprogress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "pending":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const completedTodos =
    localTask.todocheklist?.filter((todo) => todo.completed).length || 0;
  const totalTodos = localTask.todocheklist?.length || 0;
  const progressPercentage =
    totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <ArrowLeft
                size={20}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Task Details
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View task information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Task Title
                  </label>
                  <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <p className="text-gray-900 dark:text-gray-100">
                      {task.title}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <div className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg min-h-[100px]">
                    <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                      {task.description || "No description provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status and Priority */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Status & Priority
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status?.charAt(0).toUpperCase() +
                      task.status?.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    <Flag size={14} className="mr-1" />
                    {task.priority?.charAt(0).toUpperCase() +
                      task.priority?.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Important Dates
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Due Date
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {moment(task.dueDate).format("MMMM DD, YYYY")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock
                    size={18}
                    className="text-green-600 dark:text-green-400"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Created
                    </p>
                    <p className="text-gray-900 dark:text-gray-100">
                      {moment(task.createdAt).format("MMMM DD, YYYY")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Assigned Users */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Assigned Team
              </h3>
              {task.assignedTo && task.assignedTo.length > 0 ? (
                <div className="space-y-3">
                  <AvatarGroup
                    avatars={task.assignedTo.map(
                      (user) => user.profileImg || avatar
                    )}
                    maxDisplay={5}
                  />
                  <div className="space-y-2">
                    {task.assignedTo.map((user, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg"
                      >
                        <img
                          src={user.profileImg || avatar}
                          alt={user.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {user.username}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No users assigned
                </p>
              )}
            </div>

            {/* Progress */}
            {totalTodos > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Progress
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {completedTodos} of {totalTodos} tasks completed
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Original Attachments */}
            {localTask.attchments && localTask.attchments.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Paperclip size={18} />
                  Original Attachments ({localTask.attchments.length})
                </h3>
                <div className="space-y-2">
                  {localTask.attchments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <Paperclip size={16} className="text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB • {file.type}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownload(file)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors text-sm"
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Submissions */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Upload size={18} />
                My Submissions ({localTask.userSubmissions?.length || 0})
              </h3>

              {/* Upload Section */}
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="*/*"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || uploadSubmissionMutation.isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUploading || uploadSubmissionMutation.isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Plus size={16} />
                  )}
                  {isUploading || uploadSubmissionMutation.isLoading
                    ? "Uploading & Sending to Admin..."
                    : "Upload & Send to Admin"}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Files will be automatically sent to admin upon upload
                </p>
              </div>

              {/* Submitted Files */}
              {localTask.userSubmissions &&
              localTask.userSubmissions.length > 0 ? (
                <div className="space-y-2">
                  {localTask.userSubmissions.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <Paperclip size={16} className="text-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB • {file.type} •
                          Uploaded {moment(file.uploadedAt).fromNow()}
                        </p>
                      </div>
                      <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                        Submitted
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <Upload size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No files submitted yet</p>
                  <p className="text-xs">
                    Upload files to automatically send them to admin
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Todo Checklist */}
        {localTask.todocheklist && localTask.todocheklist.length > 0 && (
          <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <CheckSquare size={18} />
              Todo Checklist ({completedTodos}/{totalTodos})
            </h3>
            <div className="space-y-2">
              {localTask.todocheklist.map((todo, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <button
                    onClick={() => handleChecklistToggle(index, todo.completed)}
                    disabled={updateChecklistMutation.isLoading}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                      todo.completed
                        ? "bg-green-500 border-green-500 hover:bg-green-600"
                        : "border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500"
                    } ${
                      updateChecklistMutation.isLoading
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    {todo.completed && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  <span
                    className={`text-gray-900 dark:text-gray-100 transition-all duration-200 ${
                      todo.completed
                        ? "line-through text-gray-500 dark:text-gray-400"
                        : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                  {updateChecklistMutation.isLoading && (
                    <div className="ml-auto">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetailsViewer;
