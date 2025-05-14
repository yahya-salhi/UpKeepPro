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
import { Loader2, Tag, MapPin, User, Building } from "lucide-react";
import { useStateContext } from "../../contexts/ContextProvider";

const EditToolModal = ({ isOpen, onClose, toolId }) => {
  const queryClient = useQueryClient();
  const { currentColor } = useStateContext();
  const [loading, setLoading] = useState(true);

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

  // Update form values when tool data is loaded
  useEffect(() => {
    if (tool && isOpen) {
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
  }, [tool, form, isOpen]);

  // Reset loading state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
    }
  }, [isOpen]);

  const onSubmit = (data) => {
    mutation.mutate({ id: toolId, data });
  };

  // Check if any required data is still loading
  const isDataLoading = isLoadingTool || loadingResponsibles || loadingLocations || loadingPlacements;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
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
                    <FormLabel className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-blue-500" />
                      <span>Responsible</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select responsible" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {responsibles?.map((resp) => (
                          <SelectItem key={resp._id} value={resp._id}>
                            {resp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                      <FormLabel className="flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-green-500" />
                        <span>Location</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations?.map((loc) => (
                            <SelectItem key={loc._id} value={loc._id}>
                              {loc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                      <FormLabel className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-amber-500" />
                        <span>Placement</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select placement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {placements?.map((place) => (
                            <SelectItem key={place._id} value={place._id}>
                              {place.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="calibration">Calibration</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="common">Common</SelectItem>
                          <SelectItem value="didactic">Didactic</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
                      <FormLabel>Direction</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="DGTI">DGTI</SelectItem>
                          <SelectItem value="DGPC">DGPC</SelectItem>
                          <SelectItem value="FINANCE">FINANCE</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="DGPS">DGPS</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
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
      </DialogContent>
    </Dialog>
  );
};

export default EditToolModal;
