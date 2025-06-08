import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Eye,
  Download,
  Filter,
  Search,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Clock,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
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
import { Progress } from "../../components/ui/progress";

const TestResultsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [testFilter, setTestFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Fetch all test results for formateur's tests
  const {
    data: resultsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "formateurResults",
      {
        search: searchTerm,
        test: testFilter,
        status: statusFilter,
        sort: sortBy,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (testFilter !== "all") params.append("testId", testFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("sort", sortBy);

      const response = await fetch(
        `/api/tests/formateur-results?${params.toString()}`,
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

  // Fetch formateur's tests for filter dropdown
  const { data: testsData } = useQuery({
    queryKey: ["formateurTests"],
    queryFn: async () => {
      const response = await fetch("/api/tests?status=published", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tests");
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

  const exportResults = () => {
    // Create CSV export
    const results = resultsData?.data?.results || [];
    const csvContent = [
      ["Student", "Test", "Score", "Status", "Time Spent", "Completed At"].join(
        ","
      ),
      ...results.map((result) =>
        [
          result.user.username,
          result.test.title,
          `${result.score}%`,
          result.passed ? "Passed" : "Failed",
          formatTime(result.timeSpent),
          formatDate(result.endTime),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "test-results.csv";
    a.click();
    window.URL.revokeObjectURL(url);
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
  const tests = testsData?.data?.tests || [];
  const stats = resultsData?.data?.stats || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Test Results Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor student performance and test analytics
          </p>
        </div>
        <Button onClick={exportResults} className="flex items-center gap-2">
          <Download size={16} />
          Export Results
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Attempts
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalAttempts || 0}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pass Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.passRate || 0}%
                </p>
              </div>
              <Trophy className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Score
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.averageScore || 0}%
                </p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg. Time
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatTime(stats.averageTime || 0)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
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
                  placeholder="Search by student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={testFilter} onValueChange={setTestFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by test" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                {tests.map((test) => (
                  <SelectItem key={test._id} value={test._id}>
                    {test.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
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
                <SelectItem value="student">Student Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      {results.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <BarChart3 size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No test results match your current filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Test Results ({results.length})</CardTitle>
            <CardDescription>
              Detailed view of all student test attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result._id}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(result.passed)}
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {result.user.username}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {result.test.title}
                          </p>
                        </div>
                        {getScoreBadge(
                          result.score,
                          result.test.passingScore,
                          result.passed
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span>{formatDate(result.endTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <span>{formatTime(result.timeSpent)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target size={14} />
                          <span>
                            {result.answeredQuestions}/{result.totalQuestions}{" "}
                            questions
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy size={14} />
                          <span>
                            {result.earnedPoints}/{result.totalPoints} points
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Score Progress</span>
                          <span>{result.score}%</span>
                        </div>
                        <Progress value={result.score} className="h-2" />
                      </div>
                    </div>

                    <div className="ml-4">
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestResultsDashboard;
