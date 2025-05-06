// hooks/useDashboardData.js
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export const useDashboardData = () => {
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/tasks/dashboard-data");
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const result = await response.json();

        if (!result.charts || !result.recentTasks) {
          throw new Error("Invalid data structure received from API");
        }

        return result;
      } catch (err) {
        throw new Error(err.message || "Failed to fetch dashboard data");
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (data) {
      // Process pie chart data (task status distribution)
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

      // Process bar chart data (task priority levels)
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

  // Prepare safe data with fallbacks
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
