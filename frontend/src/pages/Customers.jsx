import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  fetchToolings,
  deleteTooling,
  updateTooling,
} from "../pages/Tooling/toolingApi";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Search, Filter, X } from "lucide-react";

export default function Customers() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [sorting, setSorting] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data using react-query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["toolings"],
    queryFn: fetchToolings,
  });

  // Mutation for updating a tool
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await updateTooling({ params: { id }, body: data });
      return response;
    },
    onSuccess: () => {
      toast.success("Tool updated successfully!");
      queryClient.invalidateQueries(["toolings"]);
      setEditingId(null);
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Failed to update tool");
    },
  });

  // Mutation for deleting a tool
  const deleteMutation = useMutation({
    mutationFn: deleteTooling,
    onSuccess: () => {
      toast.success("Tool deleted successfully!");
      queryClient.invalidateQueries(["toolings"]);
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Delete error:", error);
      toast.error("Failed to delete tool");
    },
  });

  const handleEdit = (tool) => {
    setEditingId(tool._id);
    setEditedData(tool);
  };

  const handleSave = async (id) => {
    try {
      // Prepare the data for API
      const payload = {
        ...editedData,
        // Ensure ObjectId fields are properly formatted
        responsible:
          editedData.responsible?._id || editedData.responsible || null,
        location: editedData.location?._id || editedData.location || null,
        placement: editedData.placement?._id || editedData.placement || null,
        // Convert dates to ISO strings
        acquisitionDate: editedData.acquisitionDate
          ? new Date(editedData.acquisitionDate).toISOString()
          : null,
        sortieDate: editedData.sortieDate
          ? new Date(editedData.sortieDate).toISOString()
          : null,
      };

      // Remove undefined fields
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      await updateMutation.mutateAsync({ id, data: payload });
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.error || "Failed to update tool");
    }
  };

  const handleInputChange = (e, field) => {
    setEditedData({ ...editedData, [field]: e.target.value });
  };

  const handleSelectChange = (value, field) => {
    setEditedData({ ...editedData, [field]: value });
  };

  const confirmDelete = (id) => {
    setToolToDelete(id);
    setDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "mat",
        header: "MAT",
      },
      {
        accessorKey: "designation",
        header: "Designation",
        cell: ({ row }) => {
          const tool = row.original;
          return editingId === tool._id ? (
            <Input
              value={editedData.designation || ""}
              onChange={(e) => handleInputChange(e, "designation")}
            />
          ) : (
            tool.designation
          );
        },
      },
      {
        accessorKey: "acquisitionReference",
        header: "Acquisition Reference",
        cell: ({ row }) => {
          const tool = row.original;
          return editingId === tool._id ? (
            <Input
              value={editedData.acquisitionReference || ""}
              onChange={(e) => handleInputChange(e, "acquisitionReference")}
            />
          ) : (
            tool.acquisitionReference
          );
        },
      },
      {
        accessorKey: "acquisitionDate",
        header: "Acquisition Date",
        cell: ({ row }) => {
          const tool = row.original;
          return editingId === tool._id ? (
            <Input
              type="date"
              value={editedData.acquisitionDate?.substring(0, 10) || ""}
              onChange={(e) => handleInputChange(e, "acquisitionDate")}
            />
          ) : (
            new Date(tool.acquisitionDate).toLocaleDateString()
          );
        },
      },
      {
        accessorKey: "sortieReference",
        header: "Sortie Reference",
        cell: ({ row }) => {
          const tool = row.original;
          return editingId === tool._id ? (
            <Input
              value={editedData.sortieReference || ""}
              onChange={(e) => handleInputChange(e, "sortieReference")}
            />
          ) : (
            tool.sortieReference
          );
        },
      },
      {
        accessorKey: "sortieDate",
        header: "Sortie Date",
        cell: ({ row }) => {
          const tool = row.original;
          return editingId === tool._id ? (
            <Input
              type="date"
              value={editedData.sortieDate?.substring(0, 10) || ""}
              onChange={(e) => handleInputChange(e, "sortieDate")}
            />
          ) : (
            new Date(tool.sortieDate).toLocaleDateString()
          );
        },
      },
      {
        accessorKey: "responsible.name",
        header: "Responsible",
      },
      {
        accessorKey: "location.name",
        header: "Location",
      },
      {
        accessorKey: "placement.name",
        header: "Placement",
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const tool = row.original;
          return editingId === tool._id ? (
            <Select
              value={editedData.type || ""}
              onValueChange={(value) => handleSelectChange(value, "type")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calibration">Calibration</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="common">Common</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            tool.type
          );
        },
      },
      {
        accessorKey: "direction",
        header: "Direction",
        cell: ({ row }) => {
          const tool = row.original;
          return editingId === tool._id ? (
            <Select
              value={editedData.direction || ""}
              onValueChange={(value) => handleSelectChange(value, "direction")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEMRE">DEMRE</SelectItem>
                <SelectItem value="DGTI">DGTI</SelectItem>
                <SelectItem value="DGGM">DGGM</SelectItem>
                <SelectItem value="DHS">DHS</SelectItem>
                <SelectItem value="DASIC">DASIC</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            tool.direction
          );
        },
      },
      {
        accessorKey: "situation",
        header: "Situation",
        cell: ({ row }) => {
          const tool = row.original;
          return editingId === tool._id ? (
            <Select
              value={editedData.situation || ""}
              onValueChange={(value) => handleSelectChange(value, "situation")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select situation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            tool.situation
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const tool = row.original;
          return (
            <div className="flex gap-2">
              {editingId === tool._id ? (
                <>
                  <Button
                    onClick={() => handleSave(tool._id)}
                    size="sm"
                    disabled={updateMutation.isLoading}
                  >
                    {updateMutation.isLoading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={() => setEditingId(null)}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => handleEdit(tool)}
                    size="sm"
                    variant="outline"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => confirmDelete(tool._id)}
                    size="sm"
                    variant="destructive"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [editingId, editedData, updateMutation.isLoading]
  );

  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-destructive">
        Error fetching data. Please try again later.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Tools List</h1>

      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        {(globalFilter || columnFilters.length > 0) && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Column Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
          {table.getAllLeafColumns().map((column) => {
            if (column.id === "actions") return null;

            return (
              <div key={column.id} className="space-y-2">
                <label className="text-sm font-medium">
                  Filter by {column.columnDef.header}
                </label>
                <Input
                  placeholder={`Filter ${column.columnDef.header}...`}
                  value={
                    columnFilters.find((f) => f.id === column.id)?.value || ""
                  }
                  onChange={(e) => {
                    column.setFilterValue(e.target.value);
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {data.length} tools
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md rounded-lg bg-white p-6 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-sm text-gray-600">
              This action{" "}
              <span className="font-medium text-red-600">cannot be undone</span>
              . This will permanently delete the tool from our database.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 flex justify-end space-x-3">
            <AlertDialogCancel className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500 rounded-md border border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                toolToDelete && deleteMutation.mutate(toolToDelete)
              }
              disabled={deleteMutation.isLoading}
              className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                deleteMutation.isLoading
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500"
              }`}
            >
              {deleteMutation.isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
