import Progress from "./Progress";
import { luPaperClip } from "react-icons/lu";
import moment from "moment";
import AvatarGroup from "./AvatarGroup";

function TaskCard({
  title,
  description,
  priority,
  status,
  progress,
  createdAt,
  dueDate,
  assignedTo,
  attchments,
  completedTodoCount,
  todochecklist,
  onClick,
}) {
  const getStatusColor = () => {
    switch (status) {
      case "In Progress":
        return "bg-yellow-500";
      case "Completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };
  const getPriorityColor = () => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };
  return (
    <div className="bg-white rounded-xl p-y shadow-md border border-gray-200 flex flex-col gap-2">
      <div className="" onClick={onClick}>
        <div className="">
          <div
            className={`text-[11px] font-medium ${getStatusColor()} px-4 py-0.5 rounded `}
          >
            {status}
          </div>
          <div
            className={`text-[11px] font-medium ${getPriorityColor} px-4 py-0.5 rounded`}
          >
            {priority}
          </div>
        </div>
        <div
          className={`px-4 border-l-[3px] ${
            status ===
            'in progress ?"border-cyan-500 ":status === "completed" ? "border-green-500" : "border-gray-500"} `}   '
          }`}
        >
          <p className="text-sm font-medium text-gray-800 mt-4 line-clamp-2 ">
            {title}
          </p>
          <p className=" text-gray-500 text-xs">{description}</p>
          <p>
            {" "}
            Tak Done:('')
            <span className="">
              {completedTodoCount} / {todochecklist.length}
            </span>
          </p>
          <Progress progress={progress} status={status} />
        </div>
        <div className="">
          <div>
            <label className="text-[11px] text-gray-500">Start Date</label>
            <p className=""> {moment(createdAt).format("Do MM YYYY")}</p>
          </div>
        </div>
        <label className="text-[11px] text-gray-500">Due Date</label>
        <p className="">{moment(dueDate).format("Do MM YYYY")}</p>
      </div>
      <div className="">
        <AvatarGroup avatars={assignedTo} />
        {attchments > 0 && (
          <div className="flex items-center gap-1">
            <luPaperClip className="text-gray-500" />
            <p className="text-[11px] text-gray-500">
              {attchments} Attachments
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskCard;
