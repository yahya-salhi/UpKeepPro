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
import { Link, useNavigate } from "react-router-dom";
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
  Shield,
  Mail,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Eye,
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
  const navigate = useNavigate();
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
      header: "User",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="size-10 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${currentColor}, ${currentColor}dd)`,
              }}
            >
              <span className="text-sm font-bold text-white">
                {row.original.username
                  ? row.original.username.charAt(0).toUpperCase()
                  : "?"}
              </span>
            </div>
            <div
              className={`absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-white dark:border-gray-800 ${
                row.original.availability ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {row.original.username || "Unknown"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Mail className="size-3" />
              {row.original.email || "No email"}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role & Grade",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-gray-400" />
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `${currentColor}15`,
                color: currentColor,
              }}
            >
              {row.original.role || "N/A"}
            </span>
          </div>
          {row.original.grade && (
            <div className="text-sm text-gray-600 dark:text-gray-400 ml-6">
              {row.original.grade}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "usage",
      header: "Usage Stats",
      cell: ({ row }) => (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Phone:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {row.original.phoneUsersCount || "0"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Office:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {row.original.officeUsersCount || "0"}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "availability",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.availability ? (
            <CheckCircle className="size-5 text-green-500" />
          ) : (
            <XCircle className="size-5 text-red-500" />
          )}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              row.original.availability
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
            }`}
          >
            {row.original.availability ? "Available" : "Unavailable"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        const isProtected = user.role === "REPI" || user.role === "CC";

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/profile/${user.username}`)}
              className="flex items-center gap-2 px-3 py-2 border-2 border-blue-200 dark:border-blue-600 hover:border-blue-300 dark:hover:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-300"
            >
              <Eye className="size-4" />
              View Profile
            </Button>

            {!isProtected && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => confirmDelete(user._id, user.role)}
                disabled={deleteMutation.isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Trash2 className="size-4" />
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </Button>
            )}

            {isProtected && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-lg">
                <Shield className="size-4" />
                <span className="text-xs font-medium">Protected</span>
              </div>
            )}
          </div>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="relative z-10 max-w-7xl mx-auto">
          <Header category="Management" title="Employee Directory" />
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 mt-8">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Loading employees...
              </span>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="relative z-10 max-w-7xl mx-auto">
          <Header category="Management" title="Employee Directory" />
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 mt-8">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <XCircle className="size-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Failed to Load Employees
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We encountered an error while loading the employee directory.
                Please try again.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 mx-auto"
                style={{ backgroundColor: currentColor }}
              >
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <Header category="Management" title="Employee Directory" />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center gap-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${currentColor}15` }}
                >
                  <Users className="size-6" style={{ color: currentColor }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userData.totalUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Available
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {userData.users?.filter((user) => user.availability)
                      .length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Control Panel */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-xl"
                  style={{ backgroundColor: `${currentColor}15` }}
                >
                  <Users className="size-5" style={{ color: currentColor }} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Employee Directory
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Manage and monitor all system users
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Search and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* Enhanced Search */}
              <div className="relative flex-grow sm:max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="size-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, email, role..."
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XCircle className="size-4" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl transition-all duration-300"
                >
                  <RefreshCw className="size-4" />
                  Refresh
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl transition-all duration-300"
                >
                  <Download className="size-4" />
                  Export
                </Button>

                <Link to="/signup">
                  <Button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${currentColor}, ${currentColor}dd)`,
                    }}
                  >
                    <UserPlus className="size-4" />
                    Add User
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Table Section */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-gray-900 dark:text-white font-semibold py-4 px-6 text-sm uppercase tracking-wider"
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
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    className={`hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-700/50 ${
                      index % 2 === 0
                        ? "bg-white/30 dark:bg-gray-800/30"
                        : "bg-gray-50/30 dark:bg-gray-700/20"
                    }`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-gray-900 dark:text-white py-4 px-6"
                      >
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
                    className="h-32 text-center text-gray-500 dark:text-gray-400 py-12"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Users className="size-12 text-gray-300 dark:text-gray-600" />
                      <div>
                        <p className="text-lg font-medium">
                          {searchTerm ? "No users found" : "No users available"}
                        </p>
                        <p className="text-sm">
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "Add your first user to get started"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Enhanced Pagination Controls */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {filteredUsers.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {userData.totalUsers}
                </span>{" "}
                results
              </div>
              {searchTerm && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Search className="size-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Filtered
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page
                </span>
                <div
                  className="px-3 py-1 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: currentColor }}
                >
                  {page}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  of {userData.totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) => Math.min(prev + 1, userData.totalPages))
                }
                disabled={page === userData.totalPages}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        {/* Enhanced Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-md rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50">
            <AlertDialogHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="size-8 text-red-600 dark:text-red-400" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Delete User Account
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">
                <span className="block font-semibold text-red-600 dark:text-red-400 mb-2">
                  ⚠️ This action cannot be undone
                </span>
                This will permanently remove the user and all associated data
                from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
              <AlertDialogCancel className="flex-1 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl border-0 transition-all duration-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (userToDelete) {
                    deleteMutation.mutate(userToDelete);
                  }
                }}
                disabled={deleteMutation.isLoading}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {deleteMutation.isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Trash2 className="size-4" />
                    Delete User
                  </div>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Employees;
