import { useState } from "react";
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
  
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useStateContext } from "../../contexts/ContextProvider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ToolingAcquisitionForm() {
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [activeTab, setActiveTab] = useState("entry");
  const queryClient = useQueryClient();
  const { currentColor } = useStateContext();

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
    mutation.mutate(data);
  };
  
  // Add tools data to your query
  const { data: tools } = useQuery({
    queryKey: ["toolings"],
    queryFn: fetchAllTooling,
  });
  const matPreview = generateMatPreview(designation, tools || []);

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
                Tool Management
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {activeTab === "entry" ? "Add a new tool to your inventory" : "Record tool exit from inventory"}
              </p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entry" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Tool Entry</span>
              </TabsTrigger>
              <TabsTrigger value="exit" className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                <span>Tool Exit</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Designation and MAT Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Tool Information</h3>
                  <Separator className="flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <FormLabel className="text-sm font-medium">Designation</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="HAMMER"
                              className="pl-9 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e.target.value.toUpperCase());
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel className="text-sm font-medium">MAT (Auto-generated)</FormLabel>
                    <div className="flex items-center h-11 px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      {matPreview ? (
                        <Badge variant="outline" className="text-primary">
                          {matPreview}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">
                          Enter designation (min 2 chars)
                        </span>
                      )}
                    </div>
                    {designation?.length >= 2 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on existing tools starting with{" "}
                        {designation.substring(0, 2).toUpperCase()}
                      </p>
                    )}
                  </FormItem>
                </div>
              </div>

              {/* Acquisition Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Acquisition Details</h3>
                  <Separator className="flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="acquisitionType"
                    rules={{ required: "Acquisition type is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Acquisition Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectItem value="PV" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span>PV</span>
                            </SelectItem>
                            <SelectItem value="M11" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span>M11</span>
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
                        <FormLabel className="text-sm font-medium">Reference Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                              <Hash className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-primary">{acquisitionType}-</span>
                            </div>
                            <Input
                              placeholder="Enter number"
                              className="pl-20 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary"
                              {...field}
                              onChange={(e) => {
                                let value = e.target.value;
                                // Remove any prefix that might have been pasted in
                                if (value.match(/^(PV|M11|C12)[-]/)) {
                                  value = value.replace(/^(PV|M11|C12)[-]/, '');
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="acquisitionDate"
                    rules={{ required: "Acquisition date is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Acquisition Date</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="date"
                              className="pl-9 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary"
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
                        <FormLabel className="text-sm font-medium">Quantity</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              min="1"
                              className="pl-9 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary"
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

              {/* Tool Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Tool Details</h3>
                  <Separator className="flex-1" />
                </div>

                {/* Responsible and Location - Same Line */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="responsible"
                    rules={{ required: "Responsible is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Responsible</FormLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary">
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
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{res.grade} {res.name}</span>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => setShowResponsibleModal(true)}
                          >
                            <PlusCircle className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    rules={{ required: "Location is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Location</FormLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary">
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
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{loc.name}</span>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => setShowLocationModal(true)}
                          >
                            <PlusCircle className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Placement and Type - Same Line */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="placement"
                    rules={{ required: "Placement is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Placement</FormLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary">
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
                                    <Building className="h-4 w-4 text-muted-foreground" />
                                    <span>{place.name}</span>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => setShowPlacementModal(true)}
                          >
                            <PlusCircle className="h-4 w-4 text-primary" />
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
                        <FormLabel className="text-sm font-medium">Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectItem value="calibration" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span>Calibration</span>
                            </SelectItem>
                            <SelectItem value="maintenance" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span>Maintenance</span>
                            </SelectItem>
                            <SelectItem value="common" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span>Common</span>
                            </SelectItem>
                            <SelectItem value="didactic" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span>Didactic</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Direction */}
                <FormField
                  control={form.control}
                  name="direction"
                  rules={{ required: "Direction is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Direction</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary">
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <SelectItem value="DEMRE" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>DEMRE</span>
                          </SelectItem>
                          <SelectItem value="DGTI" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>DGTI</span>
                          </SelectItem>
                          <SelectItem value="DGGM" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>DGGM</span>
                          </SelectItem>
                          <SelectItem value="DHS" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>DHS</span>
                          </SelectItem>
                          <SelectItem value="DASIC" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>DASIC</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Notes</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Additional information"
                            className="pl-9 h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary"
                            {...field}
                          />
                        </div>
                      </FormControl>
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
            className="w-full h-11 text-base font-medium"
            size="lg"
            style={{ backgroundColor: currentColor }}
            disabled={mutation.isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {activeTab === "entry" ? "Acquiring Tool..." : "Recording Exit..."}
              </>
            ) : (
              activeTab === "entry" ? "Acquire Tool" : "Record Exit"
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
