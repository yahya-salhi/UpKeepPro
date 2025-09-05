import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  X,
  Clock,
  ChevronDown,
  SlidersHorizontal,
  Bookmark,
  History,
} from "lucide-react";

export function DataTable({ columns, data, isLoading, onRowClick }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [savedFilters, setSavedFilters] = useState([]);
  const searchInputRef = useRef(null);

  // Quick filter presets
  const quickFilters = [
    {
      label: "Available",
      key: "situation",
      value: "available",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    },
    {
      label: "Low Stock",
      key: "lowStock",
      value: true,
      color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    },
    {
      label: "Maintenance",
      key: "type",
      value: "maintenance",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      label: "Calibration",
      key: "type",
      value: "calibration",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    },
  ];

  // Get unique values for filter dropdowns
  const getUniqueValues = (key) => {
    return [...new Set(data?.map((item) => item[key]).filter(Boolean))];
  };

  // Auto-complete suggestions based on data
  const getSuggestions = () => {
    if (!globalFilter || globalFilter.length < 2) return [];

    const suggestions = new Set();
    data?.forEach((item) => {
      Object.values(item).forEach((value) => {
        if (
          typeof value === "string" &&
          value.toLowerCase().includes(globalFilter.toLowerCase()) &&
          value.toLowerCase() !== globalFilter.toLowerCase()
        ) {
          suggestions.add(value);
        }
      });
    });

    return Array.from(suggestions).slice(0, 5);
  };

  // Handle search with history
  const handleSearch = (value) => {
    setGlobalFilter(value);
    if (value && value.length > 2 && !searchHistory.includes(value)) {
      setSearchHistory((prev) => [value, ...prev.slice(0, 4)]);
    }
  };

  // Handle quick filter toggle
  const toggleQuickFilter = (filter) => {
    const existingIndex = activeFilters.findIndex((f) => f.key === filter.key);
    if (existingIndex >= 0) {
      setActiveFilters((prev) => prev.filter((_, i) => i !== existingIndex));
    } else {
      setActiveFilters((prev) => [...prev, filter]);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setGlobalFilter("");
    setColumnFilters([]);
    setActiveFilters([]);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      globalFilter,
      columnFilters,
    },
    // Custom filter function for active filters
    globalFilterFn: (row, columnId, filterValue) => {
      const searchValue = filterValue?.toLowerCase() || "";

      // Apply active filters
      for (const filter of activeFilters) {
        if (filter.key === "lowStock") {
          const current = row.original.currentQte || 0;
          const original = row.original.originalQte || 1;
          if (current / original > 0.2) return false; // Not low stock
        } else if (row.original[filter.key] !== filter.value) {
          return false;
        }
      }

      // Apply global search
      if (!searchValue) return true;

      return Object.values(row.original).some((value) =>
        String(value).toLowerCase().includes(searchValue)
      );
    },
  });

  return (
    <div className="space-y-4">
      {/* Enhanced Search and Filter Section */}
      <div className="space-y-4">
        {/* Search Bar with Auto-complete */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search tools by designation, MAT, type..."
              value={globalFilter ?? ""}
              onChange={(event) => handleSearch(event.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-10 pr-10"
            />
            {globalFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch("")}
                className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Auto-complete Suggestions */}
            {showSuggestions &&
              (getSuggestions().length > 0 || searchHistory.length > 0) && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                  {getSuggestions().length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <Search className="h-3 w-3" />
                        Suggestions
                      </div>
                      {getSuggestions().map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(suggestion)}
                          className="w-full text-left px-2 py-1 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {searchHistory.length > 0 && (
                    <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <History className="h-3 w-3" />
                        Recent Searches
                      </div>
                      {searchHistory.map((term, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(term)}
                          className="w-full text-left px-2 py-1 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-2"
                        >
                          <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Advanced Filters Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="shrink-0">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {(activeFilters.length > 0 || columnFilters.length > 0) && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 p-0 text-xs"
                  >
                    {activeFilters.length + columnFilters.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Advanced Filters</h4>
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Column Filters */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select
                      onValueChange={(value) =>
                        setColumnFilters((prev) => [
                          ...prev.filter((f) => f.id !== "type"),
                          { id: "type", value },
                        ])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {getUniqueValues("type").map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Direction</label>
                    <Select
                      onValueChange={(value) =>
                        setColumnFilters((prev) => [
                          ...prev.filter((f) => f.id !== "direction"),
                          { id: "direction", value },
                        ])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All directions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All directions</SelectItem>
                        {getUniqueValues("direction").map((direction) => (
                          <SelectItem key={direction} value={direction}>
                            {direction}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => {
            const isActive = activeFilters.some(
              (f) => f.key === filter.key && f.value === filter.value
            );
            return (
              <Button
                key={filter.key + filter.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleQuickFilter(filter)}
                className={`transition-all ${isActive ? filter.color : ""}`}
              >
                {filter.label}
                {isActive && <X className="ml-1 h-3 w-3" />}
              </Button>
            );
          })}
        </div>

        {/* Active Filters Display */}
        {(activeFilters.length > 0 || globalFilter) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Active filters:</span>
            {globalFilter && (
              <Badge variant="secondary" className="gap-1">
                Search: "{globalFilter}"
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleSearch("")}
                />
              </Badge>
            )}
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {filter.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleQuickFilter(filter)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-muted/50 font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onRowClick && onRowClick(row.original)}
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
                  No tools found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
