import {
  convertPVtoM11,
  //   fetchToolingById,
  //   fetchToolHistory,
} from "./toolingApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enhancedToast, toolingToast } from "./enhancedToast.jsx";

export const useToolingActions = () => {
  const queryClient = useQueryClient();

  // Conversion mutation
  const conversionMutation = useMutation({
    mutationFn: ({ id, conversionData }) => convertPVtoM11(id, conversionData),
    onSuccess: (data, { id, conversionData }) => {
      queryClient.invalidateQueries(["toolings"]);
      queryClient.invalidateQueries(["toolHistory", id]);

      // Enhanced toast with action button
      toolingToast.conversionComplete(data.designation || "Tool", "PV", "M11");
    },
    onError: (error) => {
      enhancedToast.error("Failed to convert tool", {
        details: error.response?.data?.error || error.message,
        actionLabel: "Retry",
        onAction: () => {
          // Could retry the conversion
          console.log("Retry conversion");
        },
      });
    },
  });

  return {
    handleConversion: conversionMutation.mutate,
    isConverting: conversionMutation.isLoading,
  };
};
