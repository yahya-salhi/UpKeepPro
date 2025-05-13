import { useEffect, useState } from "react";
import DashbordKanban from "../../components/kanban/DashbordKanban";
import { useNavigate } from "react-router-dom";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTabs from "../../components/kanban/TaskStatusTabs";
import TaskCard from "../../components/kanban/TaskCard";

function ManageTask() {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const navigate = useNavigate();
  const getAllTasks = async () => {
    try {
      const response = await fetch(`/api/tasks?status=${filterStatus}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const Response = await response.json();
      if (Response.error) {
        console.log(Response.error);
        return;
      }
      if (!response.ok) {
        throw new Error(Response.error || "Something went wrong");
      }
      //set all tasks
      setAllTasks(Response.data.tasks || []);

      //map statusSummary data with fixed label and order
      const statusSummary = Response.data.statusSummary || {};
      const statusArray = [
        { label: "all", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pending || 0 },
        { label: "in progress", count: statusSummary.inProgress || 0 },
        { label: "completed", count: statusSummary.completed || 0 },
      ];
      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  const handelClick = (taskData) => {
    navigate("/admin/kanban/create-task", {
      state: { taskId: taskData._id },
    });
  };
  //download task report
  const handleDownloadReprt = async () => {};

  useEffect(() => {
    getAllTasks(filterStatus);
    return () => {};
  }, [filterStatus]);
  return (
    <DashbordKanban>
      <div className="my-5">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center">
          <div className="flex items-center justify-between gap-3">
            <h2 className=" text-xl md:text-xl font-medium">My tasks</h2>
            <button
              className=" flex lg:hidden bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleDownloadReprt}
            >
              <LuFileSpreadsheet className="" />
              Download Report
            </button>
          </div>
          {tabs?[0].count> 0 && (
            <div className="flex items-center gap-3">
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />

              <button
                className="hidden lg:flex bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleDownloadReprt}
              >
                <LuFileSpreadsheet className="text-lg" />
                Download Report
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {allTasks?.map((item,index)=>(
            <TaskCard
            key={item._id}
            title={item.title}
            description={item.description}
            priority={item.priority}
            status={item.status}
            progress={item.progress}
            createdAt={item.createdAt}
            dueDate={item.dueDate}
            assignedTo={item.assignedTo?.map((item)=>(item.profileImg))}
            attchments={item.attachments?.length||0}
            completedTodoCount={item.completedTodoCount || 0}
            todochecklist={item.todoList || []}
            onClick={() => handelClick(item)}

            />
          ))}
        </div>
      </div>
    </DashbordKanban>
  );
}

export default ManageTask;
