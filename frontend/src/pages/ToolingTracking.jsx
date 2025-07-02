import { useQuery } from "@tanstack/react-query";
import {
  fetchAllTooling,
  fetchToolHistory,
  fetchResponsibles,
} from "../pages/Tooling/toolingApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "./Tooling/DataTable";
import columns from "./Tooling/columns";
import { useState, useEffect } from "react";
import { HistoryTable } from "./Tooling/HistoryTable";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Box,
  Briefcase,
  ClipboardList,
  ChevronLeft,
  Filter,
  Search,
  User,
  Building,
  MapPin,
  Trash2,
  Edit,
  ChevronDown,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConversionDialog } from "./Tooling/ConversionDialog";
import { useToolingActions } from "../pages/Tooling/toolingActions.js";
import DeleteToolDialog from "./Tooling/DeleteToolDialog";
import EditToolModal from "./Tooling/EditToolModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// 1. Enhanced Metric Card Component
const MetricCard = ({ title, value, icon, trend, className }) => (
  <Card
    className={`p-6 transition-all duration-200 hover:shadow-md ${className}`}
  >
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold">{value || 0}</h3>
          {trend && (
            <span
              className={`text-sm ${
                trend > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
          )}
        </div>
      </div>
      <div className="p-3 rounded-xl bg-primary/10 text-primary">{icon}</div>
    </div>
  </Card>
);

// 2. Enhanced Stock Level Indicator Component
const StockBar = ({ current, max }) => {
  const percentage = Math.round((current / max) * 100);
  const getColorClass = (percentage) => {
    if (percentage > 60) return "bg-green-500";
    if (percentage > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getColorClass(
            percentage
          )}`}
          style={{ width: `${percentage === 0 ? "100%" : percentage + "%"}` }}
        />
      </div>
      <span className="text-sm font-medium min-w-[70px] text-right">
        {current}/{max}
      </span>
    </div>
  );
};

// 3. Enhanced History Columns
const historyColumns = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="font-medium">
        {new Date(row.original.date).toLocaleDateString()}
      </span>
    ),
  },
  {
    accessorKey: "eventType",
    header: "Action",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.eventType === "entry"
            ? "success"
            : row.original.eventType === "exit"
            ? "destructive"
            : "outline"
        }
        className="capitalize font-medium"
      >
        {row.original.eventType}
      </Badge>
    ),
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-medium text-primary">{row.original.reference}</span>
    ),
  },
  {
    accessorKey: "impact",
    header: "Impact",
    cell: ({ row }) => {
      const event = row.original;
      if (!event.qteChange) return "-";

      return (
        <div className="flex items-center font-medium">
          {event.eventType === "exit" ? (
            <>
              <ArrowDownCircle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-600">-{event.qteChange}</span>
            </>
          ) : (
            <>
              <ArrowUpCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{event.qteChange}</span>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "notes",
    header: "Details",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.notes}</span>
    ),
  },
];

export default function ToolingTracking() {
  const [selectedToolId, setSelectedToolId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { handleConversion } = useToolingActions();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedResponsible, setSelectedResponsible] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(null);

  // Reset selected responsible, type, and direction when filter changes
  useEffect(() => {
    if (activeFilter !== "responsible") {
      setSelectedResponsible(null);
    }
    if (activeFilter !== "type") {
      setSelectedType(null);
    }
    if (activeFilter !== "direction") {
      setSelectedDirection(null);
    }
  }, [activeFilter]);

  // Fetch all tools with summary data
  const { data: toolingData, isLoading } = useQuery({
    queryKey: ["toolings", activeFilter],
    queryFn: async () => {
      const tools = await fetchAllTooling();
      return tools;
    },
    select: (data) => {
      // Apply client-side filtering
      let filteredTools = data;
      switch (activeFilter) {
        case "unavailable":
          filteredTools = data.filter((t) => t.currentQte === 0);
          break;
        case "pv":
          filteredTools = data.filter(
            (t) =>
              t.acquisitionType === "PV" ||
              (t.history &&
                t.history.some(
                  (entry) =>
                    entry.eventType === "entry" &&
                    entry.reference &&
                    entry.reference.toLowerCase().startsWith("pv-")
                ))
          );
          break;
        case "type":
          if (selectedType) {
            filteredTools = data.filter(
              (t) => t.type && t.type === selectedType
            );
          }
          break;
        case "direction":
          if (selectedDirection) {
            filteredTools = data.filter(
              (t) => t.direction && t.direction === selectedDirection
            );
          }
          break;
        case "responsible":
          if (selectedResponsible) {
            filteredTools = data.filter(
              (t) => t.responsible && t.responsible._id === selectedResponsible
            );
          }
          break;
      }

      // Apply search filter
      if (searchQuery) {
        filteredTools = filteredTools.filter(
          (tool) =>
            tool.designation
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            tool.mat.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return {
        tools: filteredTools,
        summary: {
          total: data.length,
          available: data.filter((t) => t.currentQte > 0).length,
          maintenance: data.filter((t) => t.type === "maintenance").length,
          recentExits: data
            .flatMap((t) => t.exits.map((e) => ({ ...e, tool: t })))
            .sort((a, b) => new Date(b.exitDate) - new Date(a.exitDate))
            .slice(0, 5),
        },
      };
    },
  });

  // Fetch history when a tool is selected
  const { data: historyData } = useQuery({
    queryKey: ["toolHistory", selectedToolId],
    queryFn: () => (selectedToolId ? fetchToolHistory(selectedToolId) : []),
    enabled: !!selectedToolId,
  });

  // Fetch responsibles for the filter
  const { data: responsibles } = useQuery({
    queryKey: ["responsibles"],
    queryFn: () => fetchResponsibles(),
  });

  // Find the selected tool details
  const selectedTool = selectedToolId
    ? toolingData?.tools.find((t) => t._id === selectedToolId)
    : null;

  // Enhanced columns with visual indicators
  const enhancedColumns = [
    ...columns,
    {
      id: "stockLevel",
      header: "Stock Level",
      cell: ({ row }) => (
        <StockBar
          current={row.original.currentQte}
          max={row.original.originalQte}
        />
      ),
    },
  ];

  // Function to export data to Excel
  const exportToExcel = () => {
    if (!toolingData?.tools || toolingData.tools.length === 0) {
      return;
    }

    // Dynamically import xlsx to avoid bundling it unnecessarily
    import("xlsx")
      .then((XLSX) => {
        // Prepare the data for export
        const exportData = toolingData.tools.map((tool) => ({
          Designation: tool.designation || "",
          MAT: tool.mat || "",
          Type: tool.type || "",
          Direction: tool.direction || "",
          Responsible: tool.responsible?.name || "",
          Location: tool.location?.name || "",
          Placement: tool.placement?.name || "",
          "Current Quantity": tool.currentQte || 0,
          "Original Quantity": tool.originalQte || 0,
          "Acquisition Type": tool.acquisitionType || "",
          "Acquisition Date": tool.acquisitionDate
            ? new Date(tool.acquisitionDate).toLocaleDateString()
            : "",
          Notes: tool.notes || "",
        }));

        // Create a worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Create a workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tools");

        // Generate a filename based on the current filter
        let filename = "tools_export";
        if (activeFilter === "type" && selectedType) {
          filename = `tools_type_${selectedType}`;
        } else if (activeFilter === "direction" && selectedDirection) {
          filename = `tools_direction_${selectedDirection}`;
        } else if (activeFilter === "responsible" && selectedResponsible) {
          const respName = responsibles?.find(
            (r) => r._id === selectedResponsible
          )?.name;
          if (respName) {
            filename = `tools_responsible_${respName.replace(/\s+/g, "_")}`;
          }
        } else if (activeFilter === "unavailable") {
          filename = "tools_unavailable";
        } else if (activeFilter === "pv") {
          filename = "tools_pv";
        }

        // Add date to filename
        const date = new Date().toISOString().split("T")[0];
        filename = `${filename}_${date}.xlsx`;

        // Write and download the file
        XLSX.writeFile(wb, filename);
      })
      .catch((error) => {
        console.error("Error exporting to Excel:", error);
        // You might want to show a toast notification here
      });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="border-none shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="space-y-4">
                <CardTitle className="text-2xl font-bold">
                  {selectedTool ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedToolId(null)}
                        className="hover:bg-primary/10"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <span>{selectedTool.designation}</span>
                    </div>
                  ) : (
                    "Tool Inventory"
                  )}
                </CardTitle>

                {!selectedTool && (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[250px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={activeFilter === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("all")}
                        className="flex items-center gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        All
                      </Button>
                      <Button
                        variant={activeFilter === "pv" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("pv")}
                      >
                        PV Tools
                      </Button>
                      {/* Type Filter - Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={
                              activeFilter === "type" ? "default" : "outline"
                            }
                            size="sm"
                            className="flex items-center gap-1 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600"
                          >
                            <Box className="h-4 w-4" />
                            <span className="max-w-[100px] truncate">
                              {activeFilter === "type" && selectedType
                                ? selectedType
                                : "Type"}
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="start"
                          className="w-56 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700"
                        >
                          <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">
                            Filter by Type
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />

                          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            <DropdownMenuItem
                              onClick={() => {
                                if (activeFilter === "type") {
                                  setActiveFilter("all");
                                  setSelectedType(null);
                                }
                              }}
                              className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <span>Show All</span>
                              {activeFilter !== "type" && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                              )}
                            </DropdownMenuItem>

                            {/* Extract unique types from the tools data */}
                            {toolingData?.tools &&
                              Array.from(
                                new Set(
                                  toolingData.tools
                                    .map((tool) => tool.type)
                                    .filter(Boolean)
                                )
                              ).map((type) => (
                                <DropdownMenuItem
                                  key={type}
                                  onClick={() => {
                                    setActiveFilter("type");
                                    setSelectedType(type);
                                  }}
                                  className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <span>{type}</span>
                                  {activeFilter === "type" &&
                                    selectedType === type && (
                                      <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                    )}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* Direction Filter - Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={
                              activeFilter === "direction"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="flex items-center gap-1 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600"
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                            <span className="max-w-[100px] truncate">
                              {activeFilter === "direction" && selectedDirection
                                ? selectedDirection
                                : "Direction"}
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="start"
                          className="w-56 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700"
                        >
                          <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">
                            Filter by Direction
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />

                          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            <DropdownMenuItem
                              onClick={() => {
                                if (activeFilter === "direction") {
                                  setActiveFilter("all");
                                  setSelectedDirection(null);
                                }
                              }}
                              className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <span>Show All</span>
                              {activeFilter !== "direction" && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                              )}
                            </DropdownMenuItem>

                            {/* Extract unique directions from the tools data */}
                            {toolingData?.tools &&
                              Array.from(
                                new Set(
                                  toolingData.tools
                                    .map((tool) => tool.direction)
                                    .filter(Boolean)
                                )
                              ).map((direction) => (
                                <DropdownMenuItem
                                  key={direction}
                                  onClick={() => {
                                    setActiveFilter("direction");
                                    setSelectedDirection(direction);
                                  }}
                                  className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <span>{direction}</span>
                                  {activeFilter === "direction" &&
                                    selectedDirection === direction && (
                                      <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                    )}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {/* Responsible Filter - Improved Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant={
                              activeFilter === "responsible"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="flex items-center gap-1 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600"
                          >
                            <User className="h-4 w-4" />
                            <span className="max-w-[100px] truncate">
                              {activeFilter === "responsible" &&
                              selectedResponsible
                                ? responsibles?.find(
                                    (r) => r._id === selectedResponsible
                                  )?.name || "Responsible"
                                : "Responsible"}
                            </span>
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                          align="start"
                          className="w-56 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700"
                        >
                          <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">
                            Filter by Responsible
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-600" />

                          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
                            <DropdownMenuItem
                              onClick={() => {
                                if (activeFilter === "responsible") {
                                  setActiveFilter("all");
                                  setSelectedResponsible(null);
                                }
                              }}
                              className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <span>Show All</span>
                              {activeFilter !== "responsible" && (
                                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                              )}
                            </DropdownMenuItem>

                            {responsibles?.map((resp) => (
                              <DropdownMenuItem
                                key={resp._id}
                                onClick={() => {
                                  setActiveFilter("responsible");
                                  setSelectedResponsible(resp._id);
                                }}
                                className="flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <span>{resp.name}</span>
                                {activeFilter === "responsible" &&
                                  selectedResponsible === resp._id && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                                  )}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Export to Excel Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportToExcel}
                      className="ml-auto flex items-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 dark:hover:text-green-300 border-green-200 dark:border-green-800"
                    >
                      <Download className="h-4 w-4" />
                      Export to Excel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {!selectedTool ? (
            <>
              {/* Dashboard Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <MetricCard
                  title="Total Tools"
                  value={toolingData?.summary.total}
                  icon={<Box className="w-5 h-5" />}
                  trend={5}
                  className="bg-card"
                />
                <MetricCard
                  title="Available"
                  value={toolingData?.summary.available}
                  icon={<ClipboardList className="w-5 h-5" />}
                  trend={2}
                  className="bg-green-50 dark:bg-green-950/20"
                />
                <MetricCard
                  title="Maintenance"
                  value={toolingData?.summary.maintenance}
                  icon={<Briefcase className="w-5 h-5" />}
                  trend={3}
                  className="bg-blue-50 dark:bg-blue-950/20"
                />
                <MetricCard
                  title="Unavailable"
                  value={
                    toolingData?.summary.total - toolingData?.summary.available
                  }
                  icon={<AlertTriangle className="w-5 h-5" />}
                  trend={-3}
                  className="bg-red-50 dark:bg-red-950/20"
                />
              </div>

              {/* Tools Table */}
              <DataTable
                columns={enhancedColumns}
                data={toolingData?.tools || []}
                onRowClick={(tool) => setSelectedToolId(tool._id)}
                isLoading={isLoading}
              />
            </>
          ) : (
            <div className="space-y-8">
              {/* Tool Detail Header */}
              <div className="bg-card p-6 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedTool.designation}
                      </h2>
                      <p className="text-muted-foreground">
                        MAT: {selectedTool.mat}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="px-3 py-1">
                        {selectedTool.type}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1">
                        {selectedTool.direction}
                      </Badge>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 pt-3 border-t">
                      {/* Responsible */}
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-1.5 rounded-full">
                          <User className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Responsible
                          </p>
                          <p className="text-sm font-medium">
                            {selectedHistoryEntry?.responsible
                              ? selectedHistoryEntry.responsible.name
                              : selectedTool.responsible
                              ? selectedTool.responsible.name
                              : "Not assigned"}
                          </p>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2">
                        <div className="bg-green-50 dark:bg-green-900/20 p-1.5 rounded-full">
                          <Building className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Location
                          </p>
                          <p className="text-sm font-medium">
                            {selectedHistoryEntry?.location
                              ? selectedHistoryEntry.location.name
                              : selectedTool.location
                              ? selectedTool.location.name
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Placement */}
                      <div className="flex items-center gap-2">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-full">
                          <MapPin className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Placement
                          </p>
                          <p className="text-sm font-medium">
                            {selectedHistoryEntry?.placement
                              ? selectedHistoryEntry.placement.name
                              : selectedTool.placement
                              ? selectedTool.placement.name
                              : "Not specified"}
                          </p>
                        </div>
                      </div>
                      {/* New: Direction and Type for selected history entry */}
                      {selectedHistoryEntry && (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-1.5 rounded-full">
                              <ArrowUpCircle className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Direction
                              </p>
                              <p className="text-sm font-medium">
                                {selectedHistoryEntry.direction || "N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-1.5 rounded-full">
                              <Box className="h-4 w-4 text-indigo-500" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Type
                              </p>
                              <p className="text-sm font-medium">
                                {selectedHistoryEntry.type || "N/A"}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-4">
                    <Badge
                      variant={
                        selectedTool.situation === "available"
                          ? "success"
                          : selectedTool.situation === "partial"
                          ? "warning"
                          : "destructive"
                      }
                      className="px-3 py-1"
                    >
                      {selectedTool.situation.toUpperCase()}
                    </Badge>
                    <div className="w-[200px]">
                      <StockBar
                        current={selectedTool.currentQte}
                        max={selectedTool.originalQte}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 mt-6">
                  {/* Only show the Convert to M11 button if there are PV entries */}
                  {historyData &&
                    historyData.some(
                      (entry) =>
                        entry.eventType === "entry" &&
                        entry.reference &&
                        entry.reference.startsWith("pv-")
                    ) && (
                      <ConversionDialog
                        tool={selectedTool}
                        onConvert={(conversionData) =>
                          handleConversion({
                            id: selectedToolId,
                            conversionData,
                          })
                        }
                      >
                        <Button variant="outline" className="gap-2">
                          Convert to M11
                        </Button>
                      </ConversionDialog>
                    )}

                  {/* Edit Tool Button */}
                  <Button
                    variant="outline"
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary dark:border-primary/40 dark:text-primary dark:hover:bg-primary/20"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Tool
                  </Button>

                  {/* Delete Tool Button */}
                  <Button
                    variant="outline"
                    className="gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive dark:border-destructive/40 dark:text-destructive dark:hover:bg-destructive/20"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Tool
                  </Button>
                </div>
              </div>

              {/* History Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Transaction History
                </h3>
                <HistoryTable
                  data={historyData || []}
                  columns={historyColumns}
                  onRowClick={setSelectedHistoryEntry}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Tool Dialog */}
      {selectedTool && (
        <DeleteToolDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            // If the tool was deleted, go back to the main view
            if (!selectedToolId) setSelectedToolId(null);
          }}
          tool={selectedTool}
        />
      )}

      {/* Edit Tool Modal */}
      {selectedTool && (
        <EditToolModal
          key={selectedToolId + "-" + isEditModalOpen}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          toolId={selectedToolId}
        />
      )}
    </div>
  );
}
