import { useRef } from "react";
import { HiMiniPlus } from "react-icons/hi2";
import { LuTrash2, LuPaperclip } from "react-icons/lu";
import { useController } from "react-hook-form";
import { useState } from "react";

// Helper function to get file size in readable format
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function AttachmentsInput({ control, name, disabled }) {
  const { field } = useController({
    control,
    name,
    defaultValue: [],
  });

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    await handleFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    await handleFiles(files);
    e.target.value = ""; // Clear the input
  };

  const handleFiles = async (files) => {
    if (!files?.length) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not supported`);
        continue;
      }

      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 5MB`);
        continue;
      }

      try {
        // Convert file to base64 for immediate preview and server upload
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        const newAttachment = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
        };

        field.onChange([...field.value, newAttachment]);
      } catch (error) {
        console.error("Error processing file:", error);
        alert(`Error processing file ${file.name}`);
      }
    }
  };

  const removeAttachment = (index) => {
    field.onChange(field.value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="max-h-60 overflow-y-auto space-y-2">
        {field.value.map((file, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <LuPaperclip className="text-gray-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-900 dark:text-white truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </span>
              </div>
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

      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors
          ${
            dragActive
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600"
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className={`p-2 rounded-full transition-colors
              ${
                disabled
                  ? "bg-gray-200 text-gray-400"
                  : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
          >
            <HiMiniPlus size={20} />
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Drag and drop files here or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supported: Images, PDF, Word, Excel (Max 5MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttachmentsInput;
