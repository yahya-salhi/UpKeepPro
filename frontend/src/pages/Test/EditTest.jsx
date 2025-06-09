import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus, Edit, Trash2, Eye, Play } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
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
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Badge } from "../../components/ui/badge";
import QCMEditor from "../../components/Test/QCMEditor";
import toast from "react-hot-toast";

const EditTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    instructions: "",
    duration: 60,
    passingScore: 60,
    shuffleQuestions: false,
    shuffleAnswers: false,
    showResults: true,
    allowRetake: false,
    maxAttempts: 1,
    startDate: "",
    endDate: "",
    category: "Test",
    tags: [],
  });

  // Fetch test details
  const { data: test, isLoading: testLoading } = useQuery({
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

  useEffect(() => {
    if (test?.data) {
      const testInfo = test.data;
      setTestData({
        title: testInfo.title,
        description: testInfo.description,
        instructions: testInfo.instructions || "",
        duration: testInfo.duration,
        passingScore: testInfo.passingScore,
        shuffleQuestions: testInfo.shuffleQuestions,
        shuffleAnswers: testInfo.shuffleAnswers,
        showResults: testInfo.showResults,
        allowRetake: testInfo.allowRetake,
        maxAttempts: testInfo.maxAttempts,
        startDate: new Date(testInfo.startDate).toISOString().slice(0, 16),
        endDate: new Date(testInfo.endDate).toISOString().slice(0, 16),
        category: testInfo.category,
        tags: testInfo.tags || [],
      });
    }
  }, [test]);

  // Fetch questions for this test
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: ["questions", testId],
    queryFn: async () => {
      const response = await fetch(`/api/tests/questions?testId=${testId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      return response.json();
    },
  });

  // Update test mutation
  const updateTestMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(`/api/tests/${testId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update test");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Test updated successfully!");
      queryClient.invalidateQueries(["test", testId]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Create/Update question mutation
  const saveQuestionMutation = useMutation({
    mutationFn: async (questionData) => {
      const url = editingQuestion
        ? `/api/tests/questions/${editingQuestion._id}`
        : `/api/tests/questions`;

      const method = editingQuestion ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...questionData,
          testId: testId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save question");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(
        editingQuestion ? "Question updated!" : "Question created!"
      );
      queryClient.invalidateQueries(["questions", testId]);
      queryClient.invalidateQueries(["test", testId]);
      setShowQuestionEditor(false);
      setEditingQuestion(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId) => {
      const response = await fetch(`/api/tests/questions/${questionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete question");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Question deleted!");
      queryClient.invalidateQueries(["questions", testId]);
      queryClient.invalidateQueries(["test", testId]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Publish test mutation
  const publishTestMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tests/${testId}/publish`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to publish test");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Test published successfully!");
      queryClient.invalidateQueries(["test", testId]);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleInputChange = (field, value) => {
    setTestData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateTest = (e) => {
    e.preventDefault();
    updateTestMutation.mutate(testData);
  };

  const handleSaveQuestion = (questionData) => {
    saveQuestionMutation.mutate(questionData);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowQuestionEditor(true);
  };

  const handleDeleteQuestion = (questionId) => {
    toast(
      (t) => (
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                Delete Question
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this question?
              </p>
            </div>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
            This action cannot be undone and will permanently remove the
            question from the test.
          </div>
          <div className="flex space-x-2 justify-end">
            <button
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              onClick={() => {
                toast.dismiss(t.id);
                deleteQuestionMutation.mutate(questionId);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          maxWidth: "400px",
        },
      }
    );
  };

  const handlePublishTest = () => {
    if (questions.length === 0) {
      toast.error("Please add at least one question before publishing");
      return;
    }
    publishTestMutation.mutate();
  };

  if (testLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const questions = questionsData?.data?.questions || [];

  if (showQuestionEditor) {
    return (
      <div className="p-6">
        <QCMEditor
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setShowQuestionEditor(false);
            setEditingQuestion(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-main-dark-bg">
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/tests")}
                className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Tests
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Edit Test: {test?.data?.title}
                </h1>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      test?.data?.status === "published"
                        ? "default"
                        : "secondary"
                    }
                    className={`${
                      test?.data?.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {test?.data?.status}
                  </Badge>
                  <span className="text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm">
                    {questions.length} questions
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {test?.data?.status === "draft" && questions.length > 0 && (
                <Button
                  onClick={handlePublishTest}
                  disabled={publishTestMutation.isPending}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Play size={16} />
                  {publishTestMutation.isPending
                    ? "Publishing..."
                    : "Publish Test"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Settings */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600 p-6">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Edit className="text-white" size={20} />
                </div>
                Test Settings
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Configure your test parameters and behavior settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateTest} className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Test Title
                  </Label>
                  <Input
                    id="title"
                    value={testData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={testData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="category"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Category
                  </Label>
                  <Select
                    value={testData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                      <SelectItem value="Test">Test</SelectItem>
                      <SelectItem value="Exam">Exam</SelectItem>
                      <SelectItem value="Rattrapage">Rattrapage</SelectItem>
                      <SelectItem value="Exercice">Exercice</SelectItem>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                      <SelectItem value="Pré-Test">Pré-Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="duration"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Duration (minutes)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      value={testData.duration}
                      onChange={(e) =>
                        handleInputChange("duration", parseInt(e.target.value))
                      }
                      className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="passingScore"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Passing Score (%)
                    </Label>
                    <Input
                      id="passingScore"
                      type="number"
                      value={testData.passingScore}
                      onChange={(e) =>
                        handleInputChange(
                          "passingScore",
                          parseInt(e.target.value)
                        )
                      }
                      className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    type="submit"
                    disabled={updateTestMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Save size={16} className="mr-2" />
                    {updateTestMutation.isPending
                      ? "Updating..."
                      : "Update Test"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Questions Management */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {questions.length}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                      Questions ({questions.length})
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300 mt-1">
                      Create and manage your test questions
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => setShowQuestionEditor(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus size={16} />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {questionsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <Plus size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No questions yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Add your first question to get started with this test!
                  </p>
                  <Button
                    onClick={() => setShowQuestionEditor(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus size={16} className="mr-2" />
                    Create First Question
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div
                      key={question._id}
                      className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {index + 1}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-white dark:bg-gray-800"
                            >
                              {question.questionType}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-white dark:bg-gray-800"
                            >
                              {question.difficulty}
                            </Badge>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {question.points} points
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2 text-lg">
                            {question.question || "Rich text question"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full inline-block">
                            {question.options.length} answer options
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                            className="flex items-center gap-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                          >
                            <Edit size={14} />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question._id)}
                            className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditTest;
