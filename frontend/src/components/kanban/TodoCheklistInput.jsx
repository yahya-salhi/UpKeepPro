import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { HiMiniPlus } from "react-icons/hi2";
import { LuTrash2 } from "react-icons/lu";
import { useController } from "react-hook-form";
import { useState } from "react";
import toast from "react-hot-toast";

function TodoChecklistInput({ control, name, disabled, taskId }) {
  const queryClient = useQueryClient();

  const { mutate: updateChecklist } = useMutation({
    mutationFn: async (checklist) => {
      const response = await fetch(`/api/tasks/${taskId}/todo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ todocheklist: checklist }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update checklist");
      }
      return response.json();
    },
    onSuccess: (data) => {
      // Update form values with the new status
      if (data.task && data.task.status) {
        control._formValues.status = data.task.status;
        // Show status update toast
        const statusMap = {
          pending: "Task set to Pending",
          inprogress: "Task in Progress",
          done: "Task Completed",
        };
        toast.success(statusMap[data.task.status] || "Status updated");
      }
      // Refresh task data
      queryClient.invalidateQueries(["task", taskId]);
      queryClient.invalidateQueries(["tasks"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update checklist");
    },
  });

  const { field } = useController({
    control,
    name,
    defaultValue: [],
  });

  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim()) {
      const updated = [
        ...field.value,
        { title: newItem.trim(), completed: false },
      ];
      field.onChange(updated);
      setNewItem("");
      if (taskId) {
        updateChecklist(updated);
      }
    }
  };

  const removeItem = (index) => {
    const updated = field.value.filter((_, i) => i !== index);
    field.onChange(updated);
    if (taskId) {
      updateChecklist(updated);
    }
  };
  const toggleComplete = (index) => {
    const updated = [...field.value];
    updated[index] = {
      ...updated[index],
      completed: !updated[index].completed,
    };

    // Calculate new status immediately for better UX
    const completedCount = updated.filter((item) => item.completed).length;
    const totalItems = updated.length;
    let newStatus = "pending";

    if (completedCount === 0) {
      newStatus = "pending";
    } else if (completedCount === totalItems) {
      newStatus = "done";
    } else {
      newStatus = "inprogress";
    }

    // Update form immediately
    field.onChange(updated);
    control._formValues.status = newStatus;

    // Send update to server
    if (taskId) {
      updateChecklist(updated);
    }
  };

  return (
    <div className="space-y-2">
      <div className="max-h-40 overflow-y-auto">
        {field.value.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleComplete(index)}
                disabled={disabled}
                className={`w-5 h-5 rounded border flex items-center justify-center ${
                  item.completed
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 dark:border-gray-500"
                }`}
              >
                {item.completed && (
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                )}
              </button>
              <span
                className={`${
                  item.completed
                    ? "line-through text-gray-400 dark:text-gray-500"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {item.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={disabled}
              className="text-red-500 hover:text-red-700"
            >
              <LuTrash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Add checklist item..."
          disabled={disabled}
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
        <button
          type="button"
          onClick={addItem}
          disabled={disabled || !newItem.trim()}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600"
        >
          <HiMiniPlus size={20} />
        </button>
      </div>
    </div>
  );
}
export default TodoChecklistInput;
