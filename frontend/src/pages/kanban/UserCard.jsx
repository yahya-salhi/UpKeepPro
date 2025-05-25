import avatar from "../../data/avatar.jpg";
import StatCard from "./StatCard";

function UserCard({ userInfo }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-4">
        <img
          src={userInfo.profileImg || avatar}
          alt={`${userInfo.name}'s avatar`}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <h3 className="text-lg font-semibold">{userInfo.name}</h3>
          <p className="text-gray-600">{userInfo.email}</p>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-500">Role: {userInfo.role}</p>
      </div>
      <div className="flex items-end gap-3 mt-5">
        <StatCard
          label="pending"
          count={userInfo.pendingTasks}
          status="pending"
        />
        <StatCard
          label="completed"
          count={userInfo.completedTasks}
          status="completed"
        />
        <StatCard
          label="in progress"
          count={userInfo.inProgressTasks}
          status="in-progress"
        />
      </div>
      <div className="mt-4 text-center text-base font-semibold text-gray-800 dark:text-gray-100">
        {userInfo.username}
      </div>
    </div>
  );
}

export default UserCard;
