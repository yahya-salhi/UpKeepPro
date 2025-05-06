import { Check } from "lucide-react";
import { HiMiniPlus } from "react-icons/hi2";
import { LuTrash2 } from "react-icons/lu";
import { useController } from "react-hook-form";
import { useState } from "react";

function TodoChecklistInput({ control, name, disabled }) {
  const { field } = useController({
    control,
    name,
    defaultValue: [],
  });

  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim()) {
      field.onChange([
        ...field.value,
        { text: newItem.trim(), completed: false },
      ]);
      setNewItem("");
    }
  };

  const removeItem = (index) => {
    field.onChange(field.value.filter((_, i) => i !== index));
  };

  const toggleComplete = (index) => {
    const updated = [...field.value];
    updated[index] = {
      ...updated[index],
      completed: !updated[index].completed,
    };
    field.onChange(updated);
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
                {item.text}
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
