import { HiMiniPlus } from "react-icons/hi2";
import { LuTrash2, LuPaperclip } from "react-icons/lu";
import { useController } from "react-hook-form";
import { useState } from "react";

function AttachmentsInput({ control, name, disabled }) {
  const { field } = useController({
    control,
    name,
    defaultValue: [],
  });

  const [newAttachment, setNewAttachment] = useState("");

  const addAttachment = () => {
    if (newAttachment.trim()) {
      field.onChange([...field.value, newAttachment.trim()]);
      setNewAttachment("");
    }
  };

  const removeAttachment = (index) => {
    field.onChange(field.value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="max-h-40 overflow-y-auto">
        {field.value.map((url, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <LuPaperclip className="text-gray-500 flex-shrink-0" />
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline truncate"
              >
                {url}
              </a>
            </div>
            <button
              type="button"
              onClick={() => removeAttachment(index)}
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
          value={newAttachment}
          onChange={(e) => setNewAttachment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addAttachment()}
          placeholder="Paste file URL..."
          disabled={disabled}
          className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
        <button
          type="button"
          onClick={addAttachment}
          disabled={disabled || !newAttachment.trim()}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600"
        >
          <HiMiniPlus size={20} />
        </button>
      </div>
    </div>
  );
}
export default AttachmentsInput;
