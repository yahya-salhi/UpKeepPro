import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchResponsibles,
  fetchLocations,
  fetchPlacements,
  acquireTooling,
  generateMatPreview,
  fetchAllTooling,
} from "./toolingApi";
import ResponsibleModal from "./ResponsibleModal";
import LocationModal from "./LocationModal";
import PlacementModal from "./PlacementModal";
import { useNavigate } from "react-router-dom";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PlusCircle,
  Package,
  Calendar,
  Hash,
  FileText,
  ArrowLeft,
  Loader2,
  Tag,
  MapPin,
  User,
  Building,
  Briefcase,
  LogOut,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useStateContext } from "../../contexts/ContextProvider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function ToolingAcquisitionForm() {
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [activeTab, setActiveTab] = useState("entry");
  const queryClient = useQueryClient();
  const { currentColor } = useStateContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "exit") {
      navigate("/ExitTooling");
    }
  }, [activeTab, navigate]);

  const form = useForm({
    defaultValues: {
      designation: "",
      acquisitionType: "PV",
      acquisitionRef: "",
      acquisitionDate: new Date().toISOString().split("T")[0],
      originalQte: 1,
      responsible: "",
      location: "",
      placement: "",
      type: "common",
      direction: "DGTI",
      notes: "",
    },
  });

  // Watch designation for MAT preview
  const designation = form.watch("designation");
  const acquisitionType = form.watch("acquisitionType");

  // Fetch reference data
  const { data: responsibles, isLoading: loadingResponsibles } = useQuery({
    queryKey: ["responsibles"],
    queryFn: fetchResponsibles,
  });

  const { data: locations, isLoading: loadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const { data: placements, isLoading: loadingPlacements } = useQuery({
    queryKey: ["placements"],
    queryFn: fetchPlacements,
  });

  // Mutation for acquiring new tool
  const mutation = useMutation({
    mutationFn: acquireTooling,
    onSuccess: () => {
      toast.success("Tool acquired successfully!");
      queryClient.invalidateQueries({ queryKey: ["toolings"] });
      form.reset();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || error.message || "Failed to acquire tool"
      );
    },
  });

  const onSubmit = (data) => {
    if (data.responsible === "") delete data.responsible;
    if (data.location === "") delete data.location;
    if (data.placement === "") delete data.placement;
    mutation.mutate(data);
  };

  // Add tools data to your query
  const { data: tools } = useQuery({
    queryKey: ["toolings"],
    queryFn: fetchAllTooling,
  });
  const matPreview = generateMatPreview(designation, tools || []);

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Card className="border-none shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        {/* Enhanced Header with Background Pattern */}
        <div className="relative bg-primary/10 dark:bg-primary/5 border-b border-primary/20 dark:border-primary/10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <CardHeader className="pb-4 space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-white/20 rounded-full transition-colors"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="  text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text">
                  Tool Management
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  {activeTab === "entry"
                    ? "Add a new tool to your inventory"
                    : "Record tool exit from inventory"}
                </p>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 p-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg">
                <TabsTrigger
                  value="entry"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Tool Entry</span>
                </TabsTrigger>
                <TabsTrigger
                  value="exit"
                  className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all duration-200"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Tool Exit</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
        </div>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Designation and MAT Preview - Enhanced */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Tool Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Basic details about the tool
                    </p>
                  </div>
                  <Separator className="flex-1 ml-2" />
                </div>

                <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg border border-gray-100 dark:border-gray-800">
                  <div className="flex-grow md:w-2/3">
                    <FormField
                      control={form.control}
                      name="designation"
                      rules={{
                        required: "Designation is required",
                        minLength: {
                          value: 2,
                          message: "Designation must be at least 2 characters",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                            <span>Designation</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between pl-9 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm"
                                  >
                                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    {field.value || "Select designation..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="p-0 bg-white border border-gray-200 shadow-md rounded-md overflow-hidden"
                                  align="start"
                                  sideOffset={5}
                                  alignWidth={true}
                                  forceMount
                                  style={{
                                    width: "var(--radix-popover-trigger-width)",
                                  }}
                                >
                                  <Command className="bg-white">
                                    <CommandInput
                                      placeholder="Search designation..."
                                      className="h-10 border-b border-gray-100 focus:ring-0 focus:border-gray-200"
                                      onValueChange={(value) => {
                                        field.onChange(value.toUpperCase());
                                      }}
                                    />
                                    <CommandList className="max-h-[200px] overflow-y-auto">
                                      <CommandEmpty className="py-3 text-center text-sm text-gray-500">
                                        No matching tools found
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {tools &&
                                          tools
                                            .filter(
                                              (tool) =>
                                                !field.value ||
                                                tool.designation
                                                  .toLowerCase()
                                                  .includes(
                                                    field.value.toLowerCase()
                                                  )
                                            )
                                            .sort((a, b) =>
                                              a.designation.localeCompare(
                                                b.designation
                                              )
                                            )
                                            .slice(0, 10)
                                            .map((tool) => (
                                              <CommandItem
                                                key={tool._id}
                                                value={tool.designation}
                                                onSelect={() => {
                                                  field.onChange(
                                                    tool.designation
                                                  );
                                                }}
                                                className="flex items-center py-2 px-3 text-sm cursor-pointer hover:bg-gray-50"
                                              >
                                                <Check
                                                  className={`mr-2 h-4 w-4 text-primary ${
                                                    field.value ===
                                                    tool.designation
                                                      ? "opacity-100"
                                                      : "opacity-0"
                                                  }`}
                                                />
                                                {tool.designation}
                                              </CommandItem>
                                            ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground mt-1">
                            Please select your Designation from the
                            alphabetically filtered list below. This ensures
                            consistency with our database and helps prevent
                            typing errors. For a better experience, start typing
                            to see suggestions.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="md:w-1/3">
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        <Hash className="h-3.5 w-3.5 text-primary" />
                        <span>MAT (Auto-generated)</span>
                      </FormLabel>
                      <div className="flex items-center h-11 px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                        {matPreview ? (
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-primary border-primary/30 bg-primary/5 font-mono"
                            >
                              {matPreview}
                            </Badge>
                            <span className="text-xs px-2 py-0.5 bg-green-50 text-green-600 rounded-full dark:bg-green-900/20 dark:text-green-400">
                              Ready
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-xs px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full dark:bg-yellow-900/20 dark:text-yellow-400">
                              Waiting
                            </span>
                            <span>Enter designation (min 2 chars)</span>
                          </div>
                        )}
                      </div>
                      {designation?.length >= 2 && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Based on existing tools starting with{" "}
                          <span className="font-medium text-primary">
                            {designation.substring(0, 2).toUpperCase()}
                          </span>
                        </p>
                      )}
                    </FormItem>
                  </div>
                </div>
              </div>

              {/* Acquisition Section - Enhanced */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Acquisition Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Information about how this tool was acquired
                    </p>
                  </div>
                  <Separator className="flex-1 ml-2" />
                </div>

                <div className="p-4 bg-blue-50/30 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                  {/* Acquisition Type and Reference */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <FormField
                      control={form.control}
                      name="acquisitionType"
                      rules={{ required: "Acquisition type is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            <span>Acquisition Type</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <SelectItem
                                value="PV"
                                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
                                  >
                                    PV
                                  </Badge>
                                  <span>Procès-Verbal</span>
                                </div>
                              </SelectItem>
                              <SelectItem
                                value="M11"
                                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30"
                                  >
                                    M11
                                  </Badge>
                                  <span>Bon de Sortie</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acquisitionRef"
                      rules={{
                        required: "Reference is required",
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-1">
                            <Hash className="h-3.5 w-3.5 text-blue-500" />
                            <span>Reference Number</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                <Badge className="h-6 px-1.5 py-0.5 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300">
                                  {acquisitionType}
                                </Badge>
                                <span className="text-sm font-medium text-blue-500">
                                  -
                                </span>
                              </div>
                              <Input
                                placeholder="Enter number"
                                className="pl-[4.5rem] h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm"
                                {...field}
                                onChange={(e) => {
                                  let value = e.target.value;
                                  // Remove any prefix that might have been pasted in
                                  if (value.match(/^(PV|M11|C12)[-]/)) {
                                    value = value.replace(
                                      /^(PV|M11|C12)[-]/,
                                      ""
                                    );
                                  }
                                  field.onChange(value);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Date and Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="acquisitionDate"
                      rules={{ required: "Acquisition date is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-blue-500" />
                            <span>Acquisition Date</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="date"
                                className="pl-9 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="originalQte"
                      rules={{
                        required: "Quantity is required",
                        min: {
                          value: 1,
                          message: "Quantity must be at least 1",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 text-blue-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            <span>Quantity</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                min="1"
                                className="pl-9 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Tool Information Section - Enhanced */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-500 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Tool Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Classification and location information
                    </p>
                  </div>
                  <Separator className="flex-1 ml-2" />
                </div>

                {/* Responsible and Location - Same Line */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                  <FormField
                    control={form.control}
                    name="responsible"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-green-500" />
                          <span>Responsible</span>
                        </FormLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm">
                                <SelectValue placeholder="Select responsible" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              {loadingResponsibles ? (
                                <div className="p-2 text-center text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                </div>
                              ) : responsibles?.length === 0 ? (
                                <div className="p-2 text-center text-muted-foreground">
                                  No responsibles found
                                </div>
                              ) : (
                                responsibles?.map((res) => (
                                  <SelectItem
                                    key={res._id}
                                    value={res._id}
                                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                        <User className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                      </div>
                                      <span>{res.name}</span>
                                      {res.position && (
                                        <Badge
                                          variant="outline"
                                          className="ml-auto text-xs bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                        >
                                          {res.position}
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400 dark:hover:border-green-800/30 transition-colors"
                            onClick={() => setShowResponsibleModal(true)}
                          >
                            <PlusCircle className="h-5 w-5" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          <Building className="h-3.5 w-3.5 text-green-500" />
                          <span>Location</span>
                        </FormLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm">
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              {loadingLocations ? (
                                <div className="p-2 text-center text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                </div>
                              ) : locations?.length === 0 ? (
                                <div className="p-2 text-center text-muted-foreground">
                                  No locations found
                                </div>
                              ) : (
                                locations?.map((loc) => (
                                  <SelectItem
                                    key={loc._id}
                                    value={loc._id}
                                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                        <Building className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                      </div>
                                      <span>{loc.name}</span>
                                      {loc.code && (
                                        <Badge
                                          variant="outline"
                                          className="ml-auto text-xs bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                        >
                                          {loc.code}
                                        </Badge>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400 dark:hover:border-green-800/30 transition-colors"
                            onClick={() => setShowLocationModal(true)}
                          >
                            <PlusCircle className="h-5 w-5" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Placement and Type - Same Line */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                  <FormField
                    control={form.control}
                    name="placement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-green-500" />
                          <span>Placement</span>
                        </FormLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm">
                                <SelectValue placeholder="Select placement" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              {loadingPlacements ? (
                                <div className="p-2 text-center text-muted-foreground">
                                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                </div>
                              ) : placements?.length === 0 ? (
                                <div className="p-2 text-center text-muted-foreground">
                                  No placements found
                                </div>
                              ) : (
                                placements?.map((place) => (
                                  <SelectItem
                                    key={place._id}
                                    value={place._id}
                                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <div className="flex items-center gap-2 w-full">
                                      <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                        <MapPin className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                      </div>
                                      <span>{place.name}</span>
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400 dark:hover:border-green-800/30 transition-colors"
                            onClick={() => setShowPlacementModal(true)}
                          >
                            <PlusCircle className="h-5 w-5" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    rules={{ required: "Type is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5 text-green-500" />
                          <span>Type</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectItem
                              value="calibration"
                              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                  <Tag className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span>Calibration</span>
                                <Badge
                                  variant="outline"
                                  className="ml-auto text-xs bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                >
                                  CAL
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="maintenance"
                              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                  <Tag className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span>Maintenance</span>
                                <Badge
                                  variant="outline"
                                  className="ml-auto text-xs bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                >
                                  MNT
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="common"
                              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                  <Tag className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span>Common</span>
                                <Badge
                                  variant="outline"
                                  className="ml-auto text-xs bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                >
                                  COM
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="didactic"
                              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                  <Tag className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span>Didactic</span>
                                <Badge
                                  variant="outline"
                                  className="ml-auto text-xs bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                                >
                                  DID
                                </Badge>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Direction */}
                <div className="p-4 bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20 mb-4">
                  <FormField
                    control={form.control}
                    name="direction"
                    rules={{ required: "Direction is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-green-500" />
                          <span>Direction</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm">
                              <SelectValue placeholder="Select direction" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectItem
                              value="DGMRE"
                              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                  <Briefcase className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span>DGMRE</span>
                                <Badge className="ml-auto text-xs bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                                  Direction Générale des Ressources et des
                                  Équilibres
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="DGTI"
                              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                  <Briefcase className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span>DGTI</span>
                                <Badge className="ml-auto text-xs bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                                  Direction Générale de la Transmission et de
                                  l&apos;Informatique
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="DGGM"
                              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                  <Briefcase className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span>DGGM</span>
                                <Badge className="ml-auto text-xs bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                                  Direction Générale du Matériel Roulant et du
                                  Carburant
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="DHS"
                              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                  <Briefcase className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span>DHS</span>
                                <Badge className="ml-auto text-xs bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                                  Direction de l’Habillement et des Subsistances
                                </Badge>
                              </div>
                            </SelectItem>
                            <SelectItem
                              value="DASIC"
                              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <div className="bg-green-50 dark:bg-green-900/30 p-1 rounded-full">
                                  <Briefcase className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                                </div>
                                <span>DASIC</span>
                                <Badge className="ml-auto text-xs bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
                                  Direction du Patrimoine, de l&apos;Information
                                  et de la Culture
                                </Badge>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-green-500" />
                        <span>Notes</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Textarea
                            placeholder="Additional information about this tool"
                            className="pl-9 pt-2 min-h-[80px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary shadow-sm resize-none"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground mt-1">
                        Add any relevant details about this tool that might be
                        helpful for future reference.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium shadow-md transition-all hover:shadow-lg"
            size="lg"
            style={{ backgroundColor: currentColor }}
            disabled={mutation.isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>
                  {activeTab === "entry"
                    ? "Acquiring Tool..."
                    : "Recording Exit..."}
                </span>
              </>
            ) : (
              <>
                {activeTab === "entry" ? (
                  <>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    <span>Acquire Tool</span>
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-5 w-5" />
                    <span>Record Exit</span>
                  </>
                )}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Modals */}
      {showResponsibleModal && (
        <ResponsibleModal
          isOpen={showResponsibleModal}
          onClose={() => setShowResponsibleModal(false)}
        />
      )}

      {showLocationModal && (
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
        />
      )}

      {showPlacementModal && (
        <PlacementModal
          isOpen={showPlacementModal}
          onClose={() => setShowPlacementModal(false)}
        />
      )}
    </div>
  );
}
