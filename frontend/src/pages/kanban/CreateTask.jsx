import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuTrash2 } from "react-icons/lu";
import { ChevronDown, Loader } from "lucide-react";

import { useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import DashboardKanban from "../../components/kanban/DashbordKanban";
import Modal from "../../components/kanban/Modal";
import Button from "../../components/kanban/Button";
import TodoChecklistInput from "../../components/kanban/TodoCheklistInput";
import AddAttachmentsInput from "../../components/kanban/AddAttachmentsInput";
import SelectUsers from "../../components/kanban/SelectUsers";

function CreateTask() {
  const location = useLocation();
  const { taskId } = location.state || {};
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openDeleteTask, setOpenDeleteTask] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      priority: "low",
      dueDate: moment().format("YYYY-MM-DD"),
      assignedTo: [],
      todochecklist: [],
      attachments: [],
    },
  });

  // Fetch task data if editing
  const { isLoading: isFetching } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const response = await fetch(`/api/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch task");
      }
      return await response.json();
    },
    enabled: !!taskId,
    onSuccess: (data) => {
      if (data) {
        reset({
          ...data,
          dueDate: moment(data.dueDate).format("YYYY-MM-DD"),
          assignedTo: data.assignedTo.map((user) => user._id || user),
          todochecklist: data.todochecklist || [],
          attachments: data.attachments || [],
        });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to fetch task");
      navigate("/kanban");
    },
  });

  // Create/Update task mutation
  const { mutate: saveTask, isLoading: isSaving } = useMutation({
    mutationFn: async (formData) => {
      const url = taskId ? `/api/tasks/${taskId}` : "/api/tasks";
      const method = taskId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Operation failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(`Task ${taskId ? "updated" : "created"} successfully`);
      queryClient.invalidateQueries(["tasks"]);
      navigate("/kanban");
    },
    onError: (error) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  // Delete task mutation
  const { mutate: deleteTask, isLoading: isDeleting } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete task");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
      queryClient.invalidateQueries(["tasks"]);
      navigate("/kanban");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });

  const onSubmit = (data) => {
    try {
      // Transform the assignedTo array to contain only IDs
      const formattedAssignedTo = Array.isArray(data.assignedTo)
        ? data.assignedTo.map((user) => {
            if (typeof user === "string") return user;
            return user._id || user;
          })
        : [];

      // Transform checklist items
      const formattedChecklist = (data.todochecklist || []).map((item) =>
        typeof item === "string" ? { text: item, completed: false } : item
      );

      // Prepare the final payload
      const payload = {
        ...data,
        assignedTo: formattedAssignedTo,
        todochecklist: formattedChecklist,
        attachments: data.attachments || [],
      };

      saveTask(payload);
    } catch (error) {
      console.error("Error formatting task data:", error);
      toast.error("Error preparing task data");
    }
  };

  return (
    <DashboardKanban>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
            {/* Header Section */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {taskId ? "Edit Task" : "Create New Task"}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {taskId ? "Update your task details below" : "Fill in the details to create a new task"}
                </p>
              </div>
              {taskId && (
                <button
                  onClick={() => setOpenDeleteTask(true)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  disabled={isSaving || isFetching}
                >
                  <LuTrash2 size={18} />
                  <span>Delete Task</span>
                </button>
              )}
            </div>

            <form onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Task Title *
                        </label>
                        <input
                          {...register("title", { required: "Title is required" })}
                          type="text"
                          placeholder="Enter task title"
                          className={`w-full px-4 py-2.5 rounded-lg border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                            errors.title ? "border-red-500" : "border-gray-300"
                          }`}
                          disabled={isFetching}
                        />
                        {errors.title && (
                          <p className="mt-1.5 text-sm text-red-500">{errors.title.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </label>
                        <textarea
                          {...register("description")}
                          rows={4}
                          placeholder="Describe the task details..."
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          disabled={isFetching}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Assignment</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assign To *
                      </label>
                      <SelectUsers
                        control={control}
                        name="assignedTo"
                        rules={{ required: "At least one assignee is required" }}
                        disabled={isFetching}
                      />
                      {errors.assignedTo && (
                        <p className="mt-1.5 text-sm text-red-500">{errors.assignedTo.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Task Details</h3>
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Priority
                          </label>
                          <div className="relative">
                            <select
                              {...register("priority")}
                              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 appearance-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                              disabled={isFetching}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {taskId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Status
                            </label>
                            <div className="relative">
                              <select
                                {...register("status")}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 appearance-none transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                disabled={isFetching}
                              >
                                <option value="pending">Pending</option>
                                <option value="inprogress">In Progress</option>
                                <option value="done">Done</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Due Date
                        </label>
                        <input
                          {...register("dueDate")}
                          type="date"
                          min={moment().format("YYYY-MM-DD")}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          disabled={isFetching}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Additional Details</h3>
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Checklist Items
                        </label>
                        <TodoChecklistInput
                          control={control}
                          name="todochecklist"
                          disabled={isFetching}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Attachments
                        </label>
                        <AddAttachmentsInput
                          control={control}
                          name="attachments"
                          disabled={isFetching}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/kanban")}
                  disabled={isSaving}
                  className="px-6 py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || isFetching}
                  className="px-6 py-2.5 min-w-32 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader className="animate-spin h-4 w-4" />
                      {taskId ? "Saving..." : "Creating..."}
                    </>
                  ) : taskId ? (
                    "Update Task"
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={openDeleteTask}
        onClose={() => setOpenDeleteTask(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setOpenDeleteTask(false)}
              disabled={isDeleting}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteTask()}
              disabled={isDeleting}
              className="px-4 py-2 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader className="animate-spin h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardKanban>
  );
}

export default CreateTask;
