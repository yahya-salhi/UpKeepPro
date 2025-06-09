import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Target,
  BarChart3,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";

const TestResults = () => {
  const { testId, attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Get results from navigation state (immediate results) or fetch from API
  const [results, setResults] = useState(location.state?.results || null);

  // Fetch test attempt details if not provided in state
  const { data: attemptData, isLoading } = useQuery({
    queryKey: ["testAttempt", attemptId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/attempts/${attemptId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch test results");
      }
      return response.json();
    },
    enabled: !results && !!attemptId,
  });

  // Fetch test details
  const { data: testData } = useQuery({
    queryKey: ["test", testId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${testId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch test details");
      }
      return response.json();
    },
    enabled: !!testId,
  });

  useEffect(() => {
    if (attemptData?.data && !results) {
      setResults(attemptData.data);
    }
  }, [attemptData, results]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getScoreColor = (score, passingScore) => {
    if (score >= passingScore) {
      return "text-green-600";
    } else if (score >= passingScore * 0.7) {
      return "text-yellow-600";
    }
    return "text-red-600";
  };

  const getResultIcon = (passed) => {
    return passed ? (
      <CheckCircle className="w-8 h-8 text-green-600" />
    ) : (
      <XCircle className="w-8 h-8 text-red-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">No results found.</p>
        <Button onClick={() => navigate("/tests")} className="mt-4">
          Back to Tests
        </Button>
      </div>
    );
  }

  const test = testData?.data;
  const passingScore = test?.passingScore || 60;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-main-dark-bg">
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/tests")}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Tests
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Trophy className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  Test Results
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {test?.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Results Card */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader
            className={`${
              results.passed
                ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
                : "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20"
            } border-b border-gray-200 dark:border-gray-600 p-8`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${
                    results.passed
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-red-100 dark:bg-red-900/30"
                  }`}
                >
                  {getResultIcon(results.passed)}
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {results.passed ? "Congratulations!" : "Keep Trying!"}
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                    {results.passed
                      ? "You have successfully passed this test with flying colors!"
                      : "You didn't reach the passing score this time, but don't give up!"}
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={results.passed ? "default" : "destructive"}
                className={`text-xl px-6 py-3 font-bold ${
                  results.passed
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {results.passed ? "PASSED" : "FAILED"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Score */}
              <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-center mb-4">
                  <Trophy
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                </div>
                <div
                  className={`text-4xl font-bold mb-2 ${getScoreColor(
                    results.score,
                    passingScore
                  )}`}
                >
                  {results.score}%
                </div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                  Your Score
                </p>
                <Progress value={results.score} className="h-3" />
              </div>

              {/* Passing Score */}
              <div className="text-center bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-center mb-4">
                  <Target
                    className="text-purple-600 dark:text-purple-400"
                    size={24}
                  />
                </div>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {passingScore}%
                </div>
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Passing Score
                </p>
              </div>

              {/* Time Spent */}
              <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-center mb-4">
                  <Clock
                    className="text-green-600 dark:text-green-400"
                    size={24}
                  />
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {formatTime(results.timeSpent)}
                </div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Time Spent
                </p>
              </div>

              {/* Questions */}
              <div className="text-center bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-center mb-4">
                  <BarChart3
                    className="text-orange-600 dark:text-orange-400"
                    size={24}
                  />
                </div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {results.answeredQuestions}/{results.totalQuestions}
                </div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Questions Answered
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        {results.detailedResults && (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600 p-6">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Eye className="text-white" size={20} />
                </div>
                Question-by-Question Results
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Review your answers and see the correct solutions for each
                question
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {results.detailedResults.map((result, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <h4 className="font-semibold text-xl text-gray-900 dark:text-white">
                            Question {index + 1}
                          </h4>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                          {result.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div
                          className={`p-2 rounded-full ${
                            result.isCorrect
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-red-100 dark:bg-red-900/30"
                          }`}
                        >
                          {result.isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <Badge
                          variant={result.isCorrect ? "default" : "destructive"}
                          className="text-sm px-3 py-1"
                        >
                          {result.pointsEarned} pts
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                          Your Answer:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.selectedOptions.map((optionIndex) => (
                            <Badge
                              key={optionIndex}
                              variant={
                                result.isCorrect ? "default" : "destructive"
                              }
                              className="text-sm px-3 py-1"
                            >
                              Option {optionIndex + 1}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {!result.isCorrect && (
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-3">
                            Correct Answer:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.correctOptions.map((optionIndex) => (
                              <Badge
                                key={optionIndex}
                                variant="outline"
                                className="border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 text-sm px-3 py-1"
                              >
                                Option {optionIndex + 1}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/tests")}
              className="flex items-center gap-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors px-6 py-3"
            >
              <ArrowLeft size={16} />
              Back to Tests
            </Button>

            {test?.allowRetake && !results.passed && (
              <Button
                onClick={() => navigate(`/tests/${testId}/take`)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Trophy size={16} />
                Retake Test
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors px-6 py-3"
            >
              <Download size={16} />
              Print Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResults;
