import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { exitTooling } from "./toolingApi";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useStateContext } from "../../contexts/ContextProvider";
import { useTooling } from "./useTooling";
// Removed unused imports
import { 
  Check, 
  ChevronsUpDown, 
  Package, 
  Calendar, 
  Hash, 
  FileText, 
  AlertCircle,
  ArrowLeft,
  Loader2,
  Search,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ToolingExitForm() {
  const queryClient = useQueryClient();
  const { currentColor } = useStateContext();
  const { toolingList } = useTooling();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTools, setFilteredTools] = useState([]);
  const searchInputRef = useRef(null);

  const form = useForm({
    defaultValues: {
      toolId: "",
      exitRefType: "M11",
      exitRefNumber: "",
      exitRef: "",
      exitDate: new Date().toISOString().split("T")[0],
      exitQte: 1,
      exitReason: "consumed",
      notes: "",
    },
  });

  const selectedToolId = form.watch("toolId");
  const selectedTool = toolingList?.find((tool) => tool._id === selectedToolId);

  // Filter tools based on search term
  useEffect(() => {
    if (!toolingList) return;
    
    // First filter by available tools
    let availableTools = toolingList.filter(t => t.currentQte > 0);
    
    // Then apply search filter if there's a search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      availableTools = availableTools.filter(tool => 
        (tool.designation && tool.designation.toLowerCase().includes(searchLower)) || 
        (tool.mat && tool.mat.toLowerCase().includes(searchLower))
      );
    }
    
    setFilteredTools(availableTools);
  }, [toolingList, searchTerm]);

  // Focus search input when popover opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [open]);

  // Mutation for exiting tool
  const mutation = useMutation({
    mutationFn: ({ id, exitData }) => exitTooling(id, exitData),
    onSuccess: () => {
      toast.success("Tool exit recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["toolings"] });
      form.reset();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || error.message || "Failed to record exit"
      );
    },
  });

  const onSubmit = (formData) => {
    const exitData = {
      exitRef: formData.exitRef,
      exitDate: formData.exitDate,
      exitQte: parseInt(formData.exitQte),
      exitReason: formData.exitReason,
      notes: formData.notes,
    };

    mutation.mutate({
      id: formData.toolId,
      exitData,
    });
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800">
        <CardHeader className="pb-4 space-y-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-primary/10 rounded-full"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Record Tool Exit (M11/C12)
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Record the exit of tools from inventory with M11 or C12 reference
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Enhanced Tool Selection with Search */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Select Tool</h3>
                  <Separator className="flex-1" />
                </div>
                <FormField
                  control={form.control}
                  name="toolId"
                  rules={{ required: "Tool selection is required" }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-medium">Tool</FormLabel>
                      <div className="relative">
                        <div 
                          className="flex items-center justify-between w-full h-11 px-3 py-2 bg-white dark:bg-gray-800 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                          onClick={() => setOpen(!open)}
                        >
                          <div className="flex items-center gap-2">
                            {field.value ? (
                              <>
                                <Package className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                  {toolingList?.find(tool => tool._id === field.value)?.designation}
                                </span>
                              </>
                            ) : (
                              <span className="text-muted-foreground">Select a tool...</span>
                            )}
                          </div>
                          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        {open && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg">
                            <div className="p-2 border-b">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  ref={searchInputRef}
                                  placeholder="Search by name or MAT..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-9 h-9 bg-transparent border-0 focus-visible:ring-0"
                                />
                                {searchTerm && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      clearSearch();
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            
                            <div className="max-h-[300px] overflow-y-auto">
                              {filteredTools.length === 0 ? (
                                <div className="p-4 text-center">
                                  <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                  <p className="font-medium">No tools found</p>
                                  <p className="text-xs text-muted-foreground">
                                    Try adjusting your search terms
                                  </p>
                                </div>
                              ) : (
                                <div className="py-1">
                                  {filteredTools.map((tool) => (
                                    <div
                                      key={tool._id}
                                      className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                                        field.value === tool._id ? 'bg-primary/5 dark:bg-primary/10' : ''
                                      }`}
                                      onClick={() => {
                                        form.setValue("toolId", tool._id);
                                        setOpen(false);
                                        setSearchTerm("");
                                      }}
                                    >
                                      <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
                                        {field.value === tool._id && (
                                          <Check className="h-3 w-3 text-primary" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{tool.designation}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <span>MAT: {tool.mat}</span>
                                          <span>•</span>
                                          <span>Available: {tool.currentQte}</span>
                                          {tool.location?.name && (
                                            <>
                                              <span>•</span>
                                              <span className="truncate">Location: {tool.location.name}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <Badge 
                                        variant={tool.currentQte > 5 ? "outline" : "warning"}
                                        className="ml-2 shrink-0"
                                      >
                                        {tool.currentQte}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedTool && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{selectedTool.designation}</h3>
                      <p className="text-muted-foreground">MAT: {selectedTool.mat}</p>
                    </div>
                    <Badge 
                
                      variant={selectedTool.currentQte > 5 ? "default" : "warning"}
                      className="px-3 py-1"
                    >
                      {selectedTool.currentQte} Available
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{selectedTool.type}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{selectedTool.location?.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Direction</p>
                      <p className="font-medium">{selectedTool.direction}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Responsible</p>
                      <p className="font-medium">{selectedTool.responsible?.name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Exit Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Exit Details</h3>
                  <Separator className="flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {/* Reference Type Dropdown */}
                    <FormField
                      control={form.control}
                      name="exitRefType"
                      rules={{ required: "Reference type is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Type</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // When type changes, update the full reference
                              const currentRef = form.getValues("exitRefNumber") || "";
                              form.setValue("exitRef", `${value}-${currentRef}`);
                              // Force re-render of the form to update the prefix display
                              form.trigger("exitRefNumber");
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-gray-800">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M11">M11</SelectItem>
                              <SelectItem value="C12">C12</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Reference Number Input with Prefix */}
                    <FormField
                      control={form.control}
                      name="exitRefNumber"
                      rules={{
                        required: "Reference number is required"
                      }}
                      render={({ field }) => {
                        const refType = form.getValues("exitRefType") || "M11";
                        return (
                          <FormItem>
                            <FormLabel>Reference Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                  <Hash className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium text-primary">{refType}-</span>
                                </div>
                                <Input
                                  placeholder="Enter number"
                                  className="pl-20 h-11 bg-white dark:bg-gray-800"
                                  {...field}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(value);
                                    // Update the hidden full reference field
                                    form.setValue("exitRef", `${refType}-${value}`);
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    
                    {/* Hidden field to store the complete reference */}
                    <FormField
                      control={form.control}
                      name="exitRef"
                      rules={{
                        required: "Reference is required",
                        pattern: {
                          value: /^(M11|C12)[-]?.*$/,
                          message: "Must be a valid M11 or C12 reference"
                        }
                      }}
                      render={({ field }) => (
                        <input type="hidden" {...field} />
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="exitDate"
                    rules={{ required: "Exit date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exit Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="date"
                              className="pl-9 h-11 bg-white dark:bg-gray-800"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="exitQte"
                    rules={{
                      required: "Quantity is required",
                      min: { value: 1, message: "Must be at least 1" },
                      validate: (value) =>
                        !selectedTool ||
                        value <= selectedTool.currentQte ||
                        `Cannot exceed available quantity (${selectedTool.currentQte})`,
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              min="1"
                              max={selectedTool?.currentQte}
                              className="pl-9 h-11 bg-white dark:bg-gray-800"
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

                  <FormField
                    control={form.control}
                    name="exitReason"
                    rules={{ required: "Reason is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exit Reason</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                    
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white dark:bg-gray-800 ">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="consumed">Consumed</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                            <SelectItem value="transferred">
                              Transferred
                            </SelectItem>
                            <SelectItem value="re-form">
                              Re-form
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
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
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Additional information"
                            className="pl-9 h-11 bg-white dark:bg-gray-800"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {selectedTool && form.watch("exitQte") > selectedTool.currentQte && (
                <div className="bg-destructive/10 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Quantity Exceeds Available Stock</p>
                    <p className="text-sm text-destructive/80">
                      You cannot exit more than the available quantity ({selectedTool.currentQte})
                    </p>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <CardFooter className="pt-4">
          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            size="lg"
            style={{ backgroundColor: currentColor }}
            disabled={mutation.isPending || !selectedTool}
            onClick={form.handleSubmit(onSubmit)}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Record Exit"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
