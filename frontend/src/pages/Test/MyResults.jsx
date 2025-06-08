import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Eye,
  Calendar,
  Clock,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  Filter,
  Search,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const MyResults = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const {
    data: resultsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "myTestResults",
      { search: searchTerm, status: statusFilter, sort: sortBy },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("sort", sortBy);

      const response = await fetch(
        `/api/tests/my-results?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch test results");
      }

      return response.json();
    },
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getScoreBadge = (score, passingScore, passed) => {
    if (passed) {
      return (
        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
          Passed ({score}%)
        </Badge>
      );
    } else {
      return <Badge variant="destructive">Failed ({score}%)</Badge>;
    }
  };

  const getStatusIcon = (passed) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading results: {error.message}
      </div>
    );
  }

  const results = resultsData?.data?.results || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          My Test Results
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View your test history and performance
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <Input
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Results</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="score-high">Highest Score</SelectItem>
                <SelectItem value="score-low">Lowest Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Trophy size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No test results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't taken any tests yet or no results match your filters.
            </p>
            <Link to="/tests">
              <Button>Browse Available Tests</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <Card
              key={result._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(result.passed)}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {result.test.title}
                      </h3>
                      {getScoreBadge(
                        result.score,
                        result.test.passingScore,
                        result.passed
                      )}
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {result.test.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar
                          size={14}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatDate(result.completedAt || result.endTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock
                          size={14}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        <span className="text-gray-600 dark:text-gray-400">
                          {formatTime(result.timeSpent)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Target
                          size={14}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        <span className="text-gray-600 dark:text-gray-400">
                          {result.answeredQuestions}/{result.totalQuestions}{" "}
                          questions
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Trophy
                          size={14}
                          className="text-gray-500 dark:text-gray-400"
                        />
                        <span className="text-gray-600 dark:text-gray-400">
                          {result.earnedPoints}/{result.totalPoints} points
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      to={`/tests/${result.test._id}/results/${result._id}`}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye size={14} />
                        View Details
                      </Button>
                    </Link>

                    {result.test.allowRetake && !result.passed && (
                      <Link to={`/tests/${result.test._id}/take`}>
                        <Button size="sm" className="flex items-center gap-2">
                          <Trophy size={14} />
                          Retake
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>
              Your overall test performance statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {results.length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tests Taken
                </p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results.filter((r) => r.passed).length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tests Passed
                </p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    results.reduce((sum, r) => sum + r.score, 0) /
                      results.length
                  )}
                  %
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Average Score
                </p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    (results.filter((r) => r.passed).length / results.length) *
                      100
                  )}
                  %
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pass Rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyResults;
