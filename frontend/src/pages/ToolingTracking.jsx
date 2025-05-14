import { useQuery } from "@tanstack/react-query";
import { fetchAllTooling, fetchToolHistory } from "../pages/Tooling/toolingApi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "./Tooling/DataTable";
import columns from "./Tooling/columns";
import { useState } from "react";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConversionDialog } from "./Tooling/ConversionDialog";
import { useToolingActions } from "../pages/Tooling/toolingActions.js";
import DeleteToolDialog from "./Tooling/DeleteToolDialog";

// 1. Enhanced Metric Card Component
const MetricCard = ({ title, value, icon, trend, className }) => (
  <Card className={`p-6 transition-all duration-200 hover:shadow-md ${className}`}>
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold">{value || 0}</h3>
          {trend && (
            <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
      </div>
      <div className="p-3 rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
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
          className={`h-full rounded-full transition-all duration-300 ${getColorClass(percentage)}`}
          style={{ width: `${percentage}%` }}
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
          filteredTools = data.filter((t) => 
            t.acquisitionType === "PV" || 
            (t.history && t.history.some(entry => 
              entry.eventType === "entry" && 
              entry.reference && 
              entry.reference.toLowerCase().startsWith("pv-")
            ))
          );
          break;
        case "maintenance":
          filteredTools = data.filter((t) => t.type === "maintenance");
          break;
      }

      // Apply search filter
      if (searchQuery) {
        filteredTools = filteredTools.filter((tool) =>
          tool.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                      <Button
                        variant={activeFilter === "maintenance" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveFilter("maintenance")}
                      >
                        Maintenance
                      </Button>
                    </div>
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
                  value={toolingData?.summary.total - toolingData?.summary.available}
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
                      <h2 className="text-2xl font-bold">{selectedTool.designation}</h2>
                      <p className="text-muted-foreground">MAT: {selectedTool.mat}</p>
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
                          <p className="text-xs text-muted-foreground">Responsible</p>
                          <p className="text-sm font-medium">
                            {selectedTool.responsible ? selectedTool.responsible.name : "Not assigned"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Location */}
                      <div className="flex items-center gap-2">
                        <div className="bg-green-50 dark:bg-green-900/20 p-1.5 rounded-full">
                          <Building className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm font-medium">
                            {selectedTool.location ? selectedTool.location.name : "Not specified"}
                          </p>
                        </div>
                      </div>
                      
                      {/* Placement */}
                      <div className="flex items-center gap-2">
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-full">
                          <MapPin className="h-4 w-4 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Placement</p>
                          <p className="text-sm font-medium">
                            {selectedTool.placement ? selectedTool.placement.name : "Not specified"}
                          </p>
                        </div>
                      </div>
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
                    historyData.some((entry) =>
                      entry.eventType === "entry" && entry.reference && entry.reference.startsWith("pv-")
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
                    
                  {/* Delete Tool Button */}
                  <Button 
                    variant="outline" 
                    className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Tool
                  </Button>
                </div>
              </div>

              {/* History Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Transaction History</h3>
                <HistoryTable
                  data={historyData || []}
                  columns={historyColumns}
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
    </div>
  );
}
