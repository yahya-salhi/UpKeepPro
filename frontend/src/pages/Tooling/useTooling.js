import { useQuery } from "@tanstack/react-query";
import { fetchAllTooling } from "./toolingApi";

export function useTooling() {
  const { data: toolingList, isLoading } = useQuery({
    queryKey: ["toolings"],
    queryFn: fetchAllTooling,
    select: (data) =>
      data?.map((tool) => ({
        ...tool,
        // Ensure _id is properly formatted if needed
        _id: tool._id.toString(),
      })),
  });

  return { toolingList, isLoading };
}
