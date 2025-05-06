import { useEffect, useState } from "react";
import { useController } from "react-hook-form";

import { ChevronDown, Check } from "lucide-react";
import Modal from "./Modal";
import Button from "../../components/Button";

function SelectUsers({ control, name, rules, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { field } = useController({
    control,
    name,
    rules,
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users/users-tasks", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user?.username?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const toggleUser = (userId) => {
    const newValue = field.value.includes(userId)
      ? field.value.filter((id) => id !== userId)
      : [...field.value, userId];
    field.onChange(newValue);
  };

  return (
    <div className="relative">
      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={`flex items-center justify-between p-2 border rounded-lg cursor-pointer ${
          disabled
            ? "bg-gray-100 dark:bg-gray-700"
            : "bg-white dark:bg-gray-700"
        } ${field.value.length ? "py-1" : "py-2"} ${
          control._formState?.errors?.[name]
            ? "border-red-500"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        {field.value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {users
              .filter((user) => user && field.value.includes(user._id))
              .slice(0, 3)
              .map((user) => (
                <div
                  key={user?._id}
                  className="flex items-center gap-1 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full text-xs"
                >
                  <img
                    src={user?.profileImg || "/default-avatar.png"}
                    alt={user?.username || "User"}
                    className="w-4 h-4 rounded-full"
                  />
                  <span>{user?.username?.split(" ")[0] || "User"}</span>
                </div>
              ))}
            {field.value.length > 3 && (
              <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full text-xs">
                +{field.value.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-400">Select team members...</span>
        )}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Assign To">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user?._id}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                    field.value.includes(user?._id)
                      ? "bg-blue-50 dark:bg-blue-900/30"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => toggleUser(user?._id)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.profileImg || "/default-avatar.png"}
                      alt={user?.username || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium">
                        {user?.username || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.role || "No role"}
                      </p>
                    </div>
                  </div>
                  {user?._id && field.value.includes(user._id) && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">No users found</p>
            )}
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => setIsOpen(false)}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default SelectUsers;
