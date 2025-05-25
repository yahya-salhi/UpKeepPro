import React, { useMemo } from "react";
import Progress from "./Progress";
import { LuAlbum } from "react-icons/lu";
import moment from "moment";
import AvatarGroup from "./AvatarGroup";

const STATUS_COLORS = {
  inprogress: "bg-yellow-500 text-white",
  done: "bg-green-500 text-white",
  pending: "bg-blue-500 text-white",
  default: "bg-gray-500 text-white",
};

const PRIORITY_COLORS = {
  high: "bg-red-500 text-white",
  medium: "bg-yellow-500 text-white",
  low: "bg-green-500 text-white",
  default: "bg-gray-500 text-white",
};

const BORDER_COLORS = {
  inprogress: "border-yellow-500",
  done: "border-green-500",
  pending: "border-blue-500",
  default: "border-gray-300",
};

const STATUS_DISPLAY = {
  inprogress: "In Progress",
  done: "Completed",
  pending: "Pending",
};

const TaskCard = React.memo(function TaskCard({
  title,
  description,
  priority,
  status,
  createdAt,
  dueDate,
  assignedTo,
  attachments,
  completedTodoCount,
  todochecklist,
  onClick,
}) {
  const statusKey = useMemo(() => status?.toLowerCase() || "default", [status]);
  const priorityKey = useMemo(
    () => priority?.toLowerCase() || "default",
    [priority]
  );

  const statusColor = useMemo(
    () => STATUS_COLORS[statusKey] || STATUS_COLORS.default,
    [statusKey]
  );
  const priorityColor = useMemo(
    () => PRIORITY_COLORS[priorityKey] || PRIORITY_COLORS.default,
    [priorityKey]
  );
  const borderColor = useMemo(
    () => BORDER_COLORS[statusKey] || BORDER_COLORS.default,
    [statusKey]
  );
  const statusDisplay = useMemo(
    () => STATUS_DISPLAY[statusKey] || status || "Unknown",
    [statusKey, status]
  );

  const formattedCreatedAt = useMemo(
    () => moment(createdAt).format("DD MMM YYYY"),
    [createdAt]
  );
  const formattedDueDate = useMemo(
    () => moment(dueDate).format("DD MMM YYYY"),
    [dueDate]
  );

  const checklistLength = useMemo(
    () => todochecklist?.length || 0,
    [todochecklist]
  );
  const hasAttachments = useMemo(() => attachments > 0, [attachments]);

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="p-4 pb-2">
        <div className="flex flex-wrap gap-2 mb-2">
          <div
            className={`text-xs font-medium ${statusColor} px-2 py-1 rounded-md`}
          >
            {statusDisplay}
          </div>
          <div
            className={`text-xs font-medium ${priorityColor} px-2 py-1 rounded-md`}
          >
            {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
          </div>
        </div>

        <div className={`border-l-4 ${borderColor} pl-3 mt-3`}>
          <h3 className="text-sm font-medium text-gray-800 line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-1">
          {" "}
          <span className="text-xs text-gray-600 font-medium">
            Task Progress
          </span>
          <span className="text-xs text-gray-600">
            {completedTodoCount} / {checklistLength}
            {` (${Math.round(
              (completedTodoCount / checklistLength) * 100 || 0
            )}%)`}
          </span>
        </div>
        <Progress
          progress={Math.round(
            (completedTodoCount / checklistLength) * 100 || 0
          )}
          status={status}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 py-2 border-t border-gray-100">
        <div>
          <label className="text-xs text-gray-500 block">Start Date</label>
          <p className="text-xs font-medium">{formattedCreatedAt}</p>
        </div>
        <div>
          <label className="text-xs text-gray-500 block">Due Date</label>
          <p className="text-xs font-medium">{formattedDueDate}</p>
        </div>
      </div>

      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center mt-auto">
        {assignedTo?.length > 0 && <AvatarGroup avatars={assignedTo} />}
        {hasAttachments && (
          <div className="flex items-center gap-1">
            <LuAlbum className="text-gray-500 w-4 h-4" />
            <span className="text-xs text-gray-500">{attachments}</span>
          </div>
        )}
      </div>
    </div>
  );
});

TaskCard.displayName = "TaskCard";

export default TaskCard;
