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
  Eye
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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/tests")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Tests
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Test Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {test?.title}
          </p>
        </div>
      </div>

      {/* Overall Results Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getResultIcon(results.passed)}
              <div>
                <CardTitle className="text-2xl">
                  {results.passed ? "Congratulations!" : "Keep Trying!"}
                </CardTitle>
                <CardDescription>
                  {results.passed 
                    ? "You have successfully passed this test" 
                    : "You didn't reach the passing score this time"
                  }
                </CardDescription>
              </div>
            </div>
            <Badge 
              variant={results.passed ? "default" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {results.passed ? "PASSED" : "FAILED"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(results.score, passingScore)}`}>
                {results.score}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Your Score
              </p>
              <Progress value={results.score} className="mt-2" />
            </div>

            {/* Passing Score */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {passingScore}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Passing Score
              </p>
              <div className="flex items-center justify-center mt-2">
                <Target size={16} className="text-gray-500" />
              </div>
            </div>

            {/* Time Spent */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {formatTime(results.timeSpent)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Time Spent
              </p>
              <div className="flex items-center justify-center mt-2">
                <Clock size={16} className="text-gray-500" />
              </div>
            </div>

            {/* Questions */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {results.answeredQuestions}/{results.totalQuestions}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Questions Answered
              </p>
              <div className="flex items-center justify-center mt-2">
                <BarChart3 size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {results.detailedResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Question-by-Question Results
            </CardTitle>
            <CardDescription>
              Review your answers and see the correct solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.detailedResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-lg mb-2">
                        Question {index + 1}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {result.question}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {result.isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                      <Badge variant={result.isCorrect ? "default" : "destructive"}>
                        {result.pointsEarned} pts
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Your Answer:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {result.selectedOptions.map((optionIndex) => (
                          <Badge 
                            key={optionIndex}
                            variant={result.isCorrect ? "default" : "destructive"}
                          >
                            Option {optionIndex + 1}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {!result.isCorrect && (
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-1">
                          Correct Answer:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {result.correctOptions.map((optionIndex) => (
                            <Badge key={optionIndex} variant="outline" className="border-green-600 text-green-600">
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
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/tests")}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Tests
        </Button>
        
        {test?.allowRetake && !results.passed && (
          <Button
            onClick={() => navigate(`/tests/${testId}/take`)}
            className="flex items-center gap-2"
          >
            <Trophy size={16} />
            Retake Test
          </Button>
        )}

        <Button
          variant="outline"
          onClick={() => window.print()}
          className="flex items-center gap-2"
        >
          <Download size={16} />
          Print Results
        </Button>
      </div>
    </div>
  );
};

export default TestResults;
