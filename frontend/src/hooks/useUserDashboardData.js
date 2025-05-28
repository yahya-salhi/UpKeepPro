// hooks/useUserDashboardData.js
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export const useUserDashboardData = (userId) => {
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["userDashboardData", userId],
    queryFn: async () => {
      try {
        // NOTE: The backend route is '/user-dashborad-data' (typo in 'dashboard')
        const response = await fetch(
          `/api/tasks/user-dashborad-data?userId=${userId}`
        );
        if (!response.ok)
          throw new Error("Failed to fetch user dashboard data");
        const result = await response.json();
        if (!result.charts || !result.recentTasks) {
          throw new Error("Invalid data structure received from API");
        }
        return result;
      } catch (err) {
        throw new Error(err.message || "Failed to fetch user dashboard data");
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (data) {
      const taskDistribution = data.charts?.taskDistribution || {
        pending: 0,
        inprogress: 0,
        done: 0,
        All: 0,
      };
      setPieChartData([
        { status: "Pending", count: taskDistribution.pending },
        { status: "In Progress", count: taskDistribution.inprogress },
        { status: "Completed", count: taskDistribution.done },
      ]);
      const taskPriority = data.charts?.taskPriorityLevels || {
        high: 0,
        medium: 0,
        low: 0,
      };
      setBarChartData([
        { priority: "High", count: taskPriority.high },
        { priority: "Medium", count: taskPriority.medium },
        { priority: "Low", count: taskPriority.low },
      ]);
    }
  }, [data]);

  const safeData = {
    stats: {
      total: data?.charts?.taskDistribution?.All || 0,
      pending: data?.charts?.taskDistribution?.pending || 0,
      inProgress: data?.charts?.taskDistribution?.inprogress || 0,
      completed: data?.charts?.taskDistribution?.done || 0,
    },
    pieChartData,
    barChartData,
    recentTasks: data?.recentTasks || [],
  };

  return {
    data: safeData,
    isLoading,
    isError,
    error,
    refetch,
  };
};
