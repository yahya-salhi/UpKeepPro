import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  fetchResponsibles,
  fetchLocations,
  fetchPlacements,
  updateTooling,
  fetchToolingById,
} from "./toolingApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Tag,
  MapPin,
  User,
  Building,
  Axe,
  NotebookPen,
  PlusCircle,
} from "lucide-react";
import { useStateContext } from "../../contexts/ContextProvider";
import ResponsibleModal from "./ResponsibleModal";
import LocationModal from "./LocationModal";
import PlacementModal from "./PlacementModal";

const EditToolModal = ({ isOpen, onClose, toolId, initialData }) => {
  const queryClient = useQueryClient();
  const { currentColor } = useStateContext();
  const [loading, setLoading] = useState(true);

  // State for modals
  const [showResponsibleModal, setShowResponsibleModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPlacementModal, setShowPlacementModal] = useState(false);

  // Initialize form
  const form = useForm({
    defaultValues: {
      designation: "",
      responsible: "",
      location: "",
      placement: "",
      type: "",
      direction: "",
      notes: "",
    },
  });

  // Fetch current tool data
  const { data: tool, isLoading: isLoadingTool } = useQuery({
    queryKey: ["tool", toolId],
    queryFn: () => fetchToolingById(toolId),
    enabled: isOpen && !!toolId,
  });

  // Fetch reference data
  const { data: responsibles, isLoading: loadingResponsibles } = useQuery({
    queryKey: ["responsibles"],
    queryFn: fetchResponsibles,
    enabled: isOpen,
  });

  const { data: locations, isLoading: loadingLocations } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
    enabled: isOpen,
  });

  const { data: placements, isLoading: loadingPlacements } = useQuery({
    queryKey: ["placements"],
    queryFn: fetchPlacements,
    enabled: isOpen,
  });

  // Mutation for updating tool
  const mutation = useMutation({
    mutationFn: ({ id, data }) => updateTooling(id, data),
    onSuccess: () => {
      toast.success("Tool updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["toolings"] });
      queryClient.invalidateQueries({ queryKey: ["tool", toolId] });
      onClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error || error.message || "Failed to update tool"
      );
    },
  });

  // Update form values when tool data or initialData is loaded
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          designation: tool?.designation || "", // Keep tool designation if history entry doesn't have it
          responsible: initialData.responsible?._id || "",
          location: initialData.location?._id || "",
          placement: initialData.placement?._id || "",
          type: initialData.type || "",
          direction: initialData.direction || "",
          notes: initialData.notes || "",
        });
        setLoading(false);
      } else if (tool && !isLoadingTool) {
        form.reset({
          designation: tool.designation || "",
          responsible: tool.responsible?._id || "",
          location: tool.location?._id || "",
          placement: tool.placement?._id || "",
          type: tool.type || "",
          direction: tool.direction || "",
          notes: tool.notes || "",
        });
        setLoading(false);
      }
    }
  }, [tool, form, isOpen, initialData, isLoadingTool]);

  // Reset loading state when modal opens and form resets
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
    } else {
      setLoading(true); // Reset loading state when modal closes
      form.reset({
        designation: "",
        responsible: "",
        location: "",
        placement: "",
        type: "",
        direction: "",
        notes: "",
      });
      queryClient.removeQueries({ queryKey: ["tool", toolId] });
    }
  }, [isOpen, form, queryClient, toolId]);

  const onSubmit = (data) => {
    mutation.mutate({ id: toolId, data });
  };

  // Check if any required data is still loading
  const isDataLoading =
    isLoadingTool ||
    loadingResponsibles ||
    loadingLocations ||
    loadingPlacements;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Tag className="h-5 w-5 text-amber-500" />
            Edit Tool
          </DialogTitle>
        </DialogHeader>

        {isDataLoading || loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Designation */}
              <FormField
                control={form.control}
                name="designation"
                rules={{ required: "Designation is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="Tool designation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Responsible */}
              <FormField
                control={form.control}
                name="responsible"
                rules={{ required: "Responsible is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                      <User className="h-4 w-4 text-amber-500" />
                      <span>Responsible</span>
                    </FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700">
                            <SelectValue placeholder="Select responsible" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                          {responsibles?.map((resp) => (
                            <SelectItem
                              key={resp._id}
                              value={resp._id}
                              className="hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              {resp.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400 dark:hover:border-green-800/30 transition-colors"
                        onClick={() => setShowResponsibleModal(true)}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                    <FormMessage className="text-destructive text-sm mt-1" />
                  </FormItem>
                )}
              />

              {/* Location & Placement in same row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <FormField
                  control={form.control}
                  name="location"
                  rules={{ required: "Location is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                        <Building className="h-4 w-4 text-amber-500" />
                        <span>Location</span>
                      </FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                            {locations?.map((loc) => (
                              <SelectItem
                                key={loc._id}
                                value={loc._id}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {loc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400 dark:hover:border-green-800/30 transition-colors"
                          onClick={() => setShowLocationModal(true)}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </div>
                      <FormMessage className="text-destructive text-sm mt-1" />
                    </FormItem>
                  )}
                />

                {/* Placement */}
                <FormField
                  control={form.control}
                  name="placement"
                  rules={{ required: "Placement is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                        <MapPin className="h-4 w-4 text-amber-500" />
                        <span>Placement</span>
                      </FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700">
                              <SelectValue placeholder="Select placement" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                            {placements?.map((place) => (
                              <SelectItem
                                key={place._id}
                                value={place._id}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                {place.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-10 w-10 shrink-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-green-50 hover:text-green-600 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:text-green-400 dark:hover:border-green-800/30 transition-colors"
                          onClick={() => setShowPlacementModal(true)}
                        >
                          <PlusCircle className="h-5 w-5" />
                        </Button>
                      </div>
                      <FormMessage className="text-destructive text-sm mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Type & Direction in same row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  rules={{ required: "Type is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                        <Axe className="h-4 w-4 text-amber-500" />
                        <span>Type</span>
                      </FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                          <SelectItem
                            value="calibration"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Calibration
                          </SelectItem>
                          <SelectItem
                            value="maintenance"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Maintenance
                          </SelectItem>
                          <SelectItem
                            value="common"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Common
                          </SelectItem>
                          <SelectItem
                            value="didactic"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            Didactic
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage className="text-destructive text-sm mt-1" />
                    </FormItem>
                  )}
                />

                {/* Direction */}
                <FormField
                  control={form.control}
                  name="direction"
                  rules={{ required: "Direction is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                        <NotebookPen className="w-4 h-4 text-amber-500" />
                        <span>Direction</span>
                      </FormLabel>

                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700">
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                          <SelectItem
                            value="DGTI"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            DGTI
                          </SelectItem>
                          <SelectItem
                            value="DGMRE"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            DGMRE
                          </SelectItem>
                          <SelectItem
                            value="DGGM"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            DGGM
                          </SelectItem>
                          <SelectItem
                            value="DHS"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            DHS
                          </SelectItem>
                          <SelectItem
                            value="DASIC"
                            className="hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            DASIC
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <FormMessage className="text-destructive text-sm mt-1" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional information about this tool"
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="w-full md:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  style={{ backgroundColor: currentColor }}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Tool"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {/* Modals */}
        {showResponsibleModal && (
          <ResponsibleModal
            isOpen={showResponsibleModal}
            onClose={() => {
              setShowResponsibleModal(false);
              // Refresh responsibles list after adding a new one
              queryClient.invalidateQueries({ queryKey: ["responsibles"] });
            }}
          />
        )}

        {showLocationModal && (
          <LocationModal
            isOpen={showLocationModal}
            onClose={() => {
              setShowLocationModal(false);
              // Refresh locations list after adding a new one
              queryClient.invalidateQueries({ queryKey: ["locations"] });
            }}
          />
        )}

        {showPlacementModal && (
          <PlacementModal
            isOpen={showPlacementModal}
            onClose={() => {
              setShowPlacementModal(false);
              // Refresh placements list after adding a new one
              queryClient.invalidateQueries({ queryKey: ["placements"] });
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditToolModal;
