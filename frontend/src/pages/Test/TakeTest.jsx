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
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/tests")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Tests
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{test?.title}</CardTitle>
            <CardDescription>{test?.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Duration:</strong> {test?.duration} minutes
              </div>
              <div>
                <strong>Questions:</strong> {test?.totalQuestions}
              </div>
              <div>
                <strong>Passing Score:</strong> {test?.passingScore}%
              </div>
              <div>
                <strong>Attempts Allowed:</strong> {test?.maxAttempts}
              </div>
            </div>

            {test?.instructions && (
              <div>
                <h4 className="font-medium mb-2">Instructions:</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {test.instructions}
                </p>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleStartTest}
                disabled={startAttemptMutation.isPending}
              >
                {startAttemptMutation.isPending ? "Starting..." : "Start Test"}
              </Button>
            </div>
          </CardContent>
        </Card>
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header with timer */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{test?.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={20} />
          <span
            className={`font-mono text-lg ${
              timeRemaining < 300 ? "text-red-600" : ""
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
          }}
        ></div>
      </div>

      {/* Question */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.question || (
                <div
                  dangerouslySetInnerHTML={{
                    __html: currentQuestion.questionHtml,
                  }}
                />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center space-x-3 p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <input
                    type={
                      currentQuestion.questionType === "multiple-choice"
                        ? "checkbox"
                        : "radio"
                    }
                    name={`question-${currentQuestion._id}`}
                    checked={(answers[currentQuestion._id] || []).includes(
                      index
                    )}
                    onChange={(e) =>
                      handleAnswerChange(
                        currentQuestion._id,
                        index,
                        e.target.checked
                      )
                    }
                    className="w-4 h-4"
                  />
                  <span>{option.text}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              <Button
                onClick={handleNextQuestion}
                disabled={isSubmitting || submitAnswerMutation.isPending}
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
  );
};

export default TakeTest;
