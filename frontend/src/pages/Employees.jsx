import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
} from "@tanstack/react-table";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useStateContext } from "../contexts/ContextProvider";
import { Header } from "../components";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Users,
  UserPlus,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Fetch users with pagination
const fetchUsers = async ({ page, limit }) => {
  const { data } = await axios.get("/api/users/all", {
    params: { page, limit },
  });
  return data;
};

// Delete user
const deleteUser = async (id, role) => {
  if (role === "REPI" || role === "CC") {
    throw new Error("Users with the REPI role cannot be deleted!");
  }
  await axios.delete(`/api/users/delete/${id}`);
};

const Employees = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { currentColor } = useStateContext();
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: userData = { users: [], totalUsers: 0, totalPages: 0 },
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", page],
    queryFn: () => fetchUsers({ page, limit }),
    keepPreviousData: true,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, role }) => deleteUser(id, role),
    onSuccess: () => {
      toast.success("User deleted successfully!");
      queryClient.invalidateQueries(["users"]);
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const confirmDelete = (id, role) => {
    setUserToDelete({ id, role });
    setDeleteDialogOpen(true);
  };

  // Filter users based on search term - using useMemo to prevent performance issues
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return userData.users;

    return userData.users.filter(
      (user) =>
        (user.username &&
          user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email &&
          user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.role &&
          user.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.grade &&
          user.grade.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [userData.users, searchTerm]);

  const columns = [
    {
      accessorKey: "username",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div
            className="size-8 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${currentColor}20, ${currentColor}40)`,
              border: `1px solid ${currentColor}30`,
            }}
          >
            <span
              className="text-sm font-medium"
              style={{ color: currentColor }}
            >
              {row.original.username
                ? row.original.username.charAt(0).toUpperCase()
                : "?"}
            </span>
          </div>
          <span className="font-medium">
            {row.original.username || "Unknown"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "N/A",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${currentColor}15`,
            color: currentColor,
          }}
        >
          {row.original.role || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "grade",
      header: "Grade",
      cell: ({ row }) => row.original.grade || "N/A",
    },
    {
      accessorKey: "phoneUsersCount",
      header: "Phone Users",
      cell: ({ row }) => row.original.phoneUsersCount || "0",
    },
    {
      accessorKey: "officeUsersCount",
      header: "Office Users",
      cell: ({ row }) => row.original.officeUsersCount || "0",
    },
    {
      accessorKey: "availability",
      header: "Availability",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.availability
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {row.original.availability ? "Available" : "Unavailable"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        const isProtected = user.role === "REPI" || user.role === "CC";

        return (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => confirmDelete(user._id, user.role)}
            disabled={isProtected || deleteMutation.isLoading}
            className="flex items-center gap-1"
          >
            <Trash2 className="size-4" />
            {deleteMutation.isLoading ? "Deleting..." : "Delete"}
          </Button>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: limit,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-gray-800 rounded-3xl">
        <Header category="Page" title="Users" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-gray-800 rounded-3xl">
        <Header category="Page" title="Users" />
        <div className="p-4 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
          Error loading users. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-gray-800 rounded-3xl">
      <Header category="Page" title="Users" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Users className="size-6" style={{ color: currentColor }} />
            <span>Users</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              ({userData.totalUsers} total)
            </span>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="size-4 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Link to="/signup">
            <Button
              className="flex items-center gap-2"
              style={{ backgroundColor: currentColor }}
            >
              <UserPlus className="size-4" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-gray-50 dark:bg-gray-800/50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="dark:text-white font-medium"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="dark:text-white">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center dark:text-white"
                >
                  {searchTerm
                    ? "No users found matching your search."
                    : "No users found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredUsers.length} of {userData.totalUsers} results
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="flex items-center gap-1 dark:text-white"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-500 dark:text-gray-400 px-2">
            Page {page} of {userData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, userData.totalPages))
            }
            disabled={page === userData.totalPages}
            className="flex items-center gap-1 dark:text-white"
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-red-600 dark:text-red-400">
                This action cannot be undone.
              </span>{" "}
              This will permanently delete the user from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex justify-end space-x-3">
            <AlertDialogCancel className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:ring-gray-500 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (userToDelete) {
                  deleteMutation.mutate(userToDelete);
                }
              }}
              disabled={deleteMutation.isLoading}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-2 rounded-lg"
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Employees;
