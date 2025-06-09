import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import toast from "react-hot-toast";

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch test details
  const { data: testData, isLoading: testLoading } = useQuery({
    queryKey: ["test", testId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${testId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch test");
      }
      return response.json();
    },
  });

  // Start test attempt
  const startAttemptMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tests/attempts/start/${testId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start test");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentAttempt(data.data);
      setTimeRemaining(data.data.test.duration * 60); // Convert to seconds
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Fetch test questions
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["testQuestions", currentAttempt?._id],
    queryFn: async () => {
      const response = await fetch(
        `/api/tests/attempts/${currentAttempt._id}/questions`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      return response.json();
    },
    enabled: !!currentAttempt,
  });

  // Submit answer
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, selectedOptions }) => {
      const response = await fetch(
        `/api/tests/attempts/${currentAttempt._id}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            questionId,
            selectedOptions,
            timeSpent: 30, // You can track actual time spent
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to submit answer");
      }
      return response.json();
    },
  });

  // Complete test
  const completeTestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/tests/attempts/${currentAttempt._id}/complete`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error("Failed to complete test");
      }
      return response.json();
    },
    onSuccess: (data) => {
      navigate(`/tests/${testId}/results/${currentAttempt._id}`, {
        state: { results: data.data },
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && currentAttempt) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - auto submit
            handleCompleteTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, currentAttempt]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId, optionIndex, isChecked) => {
    const question = questionsData?.data?.questions[currentQuestionIndex];
    if (!question) return;

    setAnswers((prev) => {
      const currentAnswers = prev[questionId] || [];

      if (question.questionType === "multiple-choice") {
        // Multiple selection allowed
        if (isChecked) {
          return {
            ...prev,
            [questionId]: [...currentAnswers, optionIndex],
          };
        } else {
          return {
            ...prev,
            [questionId]: currentAnswers.filter((idx) => idx !== optionIndex),
          };
        }
      } else {
        // Single selection (single-choice, true-false)
        return {
          ...prev,
          [questionId]: isChecked ? [optionIndex] : [],
        };
      }
    });
  };

  const handleNextQuestion = async () => {
    const question = questionsData?.data?.questions[currentQuestionIndex];
    const selectedAnswers = answers[question._id] || [];

    if (selectedAnswers.length > 0) {
      await submitAnswerMutation.mutateAsync({
        questionId: question._id,
        selectedOptions: selectedAnswers,
      });
    }

    if (currentQuestionIndex < questionsData.data.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleCompleteTest();
    }
  };

  const handleCompleteTest = () => {
    setIsSubmitting(true);
    completeTestMutation.mutate();
  };

  const handleStartTest = () => {
    startAttemptMutation.mutate();
  };

  if (testLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const test = testData?.data;
  const questions = questionsData?.data?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  if (!currentAttempt) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-main-dark-bg">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/tests")}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Tests
            </Button>
          </div>

          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 p-8 border-b border-gray-200 dark:border-gray-600">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {test?.title}
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 text-lg">
                {test?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock
                      className="text-blue-600 dark:text-blue-400"
                      size={20}
                    />
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      Test Details
                    </h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Duration:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {test?.duration} minutes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Questions:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {test?.totalQuestions}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Passing Score:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {test?.passingScore}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Attempts Allowed:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {test?.maxAttempts}
                      </span>
                    </div>
                  </div>
                </div>

                {test?.instructions && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle
                        className="text-amber-600 dark:text-amber-400"
                        size={20}
                      />
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                        Instructions
                      </h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {test.instructions}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-8">
                <Button
                  onClick={handleStartTest}
                  disabled={startAttemptMutation.isPending}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {startAttemptMutation.isPending
                    ? "Starting..."
                    : "Start Test"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (questionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-main-dark-bg">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header with timer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {test?.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
              <Clock size={24} className="text-blue-600 dark:text-blue-400" />
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Time Remaining
                </p>
                <span
                  className={`font-mono text-xl font-bold ${
                    timeRemaining < 300
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Progress
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {Math.round(
                ((currentQuestionIndex + 1) / questions.length) * 100
              )}
              % Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-8 border-b border-gray-200 dark:border-gray-600">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                {currentQuestion.question || (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: currentQuestion.questionHtml,
                    }}
                  />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = (
                    answers[currentQuestion._id] || []
                  ).includes(index);
                  return (
                    <label
                      key={index}
                      className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                          : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <input
                        type={
                          currentQuestion.questionType === "multiple-choice"
                            ? "checkbox"
                            : "radio"
                        }
                        name={`question-${currentQuestion._id}`}
                        checked={isSelected}
                        onChange={(e) =>
                          handleAnswerChange(
                            currentQuestion._id,
                            index,
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span
                        className={`text-lg ${
                          isSelected
                            ? "font-medium text-blue-900 dark:text-blue-100"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {option.text}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between pt-8 border-t border-gray-200 dark:border-gray-600">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Previous
                </Button>

                <Button
                  onClick={handleNextQuestion}
                  disabled={isSubmitting || submitAnswerMutation.isPending}
                  className={`px-6 py-3 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
                    currentQuestionIndex === questions.length - 1
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {currentQuestionIndex === questions.length - 1
                    ? "Complete Test"
                    : "Next Question"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TakeTest;
