import {
  convertPVtoM11,
  //   fetchToolingById,
  //   fetchToolHistory,
} from "./toolingApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export const useToolingActions = () => {
  const queryClient = useQueryClient();

  // Conversion mutation
  const conversionMutation = useMutation({
    mutationFn: ({ id, conversionData }) => convertPVtoM11(id, conversionData),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries(["toolings"]);
      queryClient.invalidateQueries(["toolHistory", id]);
      toast.success("Tool converted to M11 successfully");
    },
    onError: (error) => {
      toast.error("Failed to convert tool: " + error.message);
    },
  });

  return {
    handleConversion: conversionMutation.mutate,
    isConverting: conversionMutation.isLoading,
  };
};
