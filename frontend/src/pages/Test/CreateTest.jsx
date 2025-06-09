import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Plus } from "lucide-react";
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
import toast from "react-hot-toast";

const CreateTest = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
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
    startDate: new Date().toISOString().slice(0, 16),
    endDate: "",
    category: "Test",
    tags: [],
  });

  const createTestMutation = useMutation({
    mutationFn: async (testData) => {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create test");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Test created successfully! Now add some questions.");
      queryClient.invalidateQueries(["tests"]);
      navigate(`/tests/${data.data._id}/edit`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Test title is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Test description is required");
      return;
    }

    if (!formData.endDate) {
      toast.error("End date is required");
      return;
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      toast.error("End date must be after start date");
      return;
    }

    createTestMutation.mutate(formData);
  };

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
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create New Test
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Set up a comprehensive test for your students with customizable
                settings and options
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600 p-6">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                Basic Information
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Provide the essential details for your test including title,
                category, and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Test Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter a descriptive test title"
                    required
                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg"
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
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger className="h-11 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg">
                      <SelectValue placeholder="Select test category" />
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
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Provide a detailed description of what this test covers and its objectives"
                  rows={4}
                  required
                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="instructions"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Instructions for Students
                </Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) =>
                    handleInputChange("instructions", e.target.value)
                  }
                  placeholder="Provide clear instructions for test takers (e.g., time limits, allowed resources, etc.)"
                  rows={4}
                  className="border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-lg resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Configuration */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600 p-6">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                Test Configuration
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Configure the test settings, timing, and scoring parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    min="1"
                    max="480"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", parseInt(e.target.value))
                    }
                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recommended: 60-120 minutes
                  </p>
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
                    min="0"
                    max="100"
                    value={formData.passingScore}
                    onChange={(e) =>
                      handleInputChange(
                        "passingScore",
                        parseInt(e.target.value)
                      )
                    }
                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Minimum score to pass
                  </p>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="maxAttempts"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Max Attempts
                  </Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.maxAttempts}
                    onChange={(e) =>
                      handleInputChange("maxAttempts", parseInt(e.target.value))
                    }
                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Number of retakes allowed
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="startDate"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Start Date & Time
                  </Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    When students can start taking the test
                  </p>
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="endDate"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    End Date & Time *
                  </Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    required
                    className="h-11 border-gray-300 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Test will be unavailable after this time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Options */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600 p-6">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                Test Options
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300 mt-2">
                Configure additional test behavior and student experience
                settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Shuffle Questions
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Randomize question order for each attempt to prevent
                      cheating
                    </p>
                  </div>
                  <Switch
                    checked={formData.shuffleQuestions}
                    onCheckedChange={(checked) =>
                      handleInputChange("shuffleQuestions", checked)
                    }
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Shuffle Answers
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Randomize answer options for each question
                    </p>
                  </div>
                  <Switch
                    checked={formData.shuffleAnswers}
                    onCheckedChange={(checked) =>
                      handleInputChange("shuffleAnswers", checked)
                    }
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Show Results
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Show detailed results and feedback after completion
                    </p>
                  </div>
                  <Switch
                    checked={formData.showResults}
                    onCheckedChange={(checked) =>
                      handleInputChange("showResults", checked)
                    }
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Allow Retake
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow multiple attempts (up to max attempts limit)
                    </p>
                  </div>
                  <Switch
                    checked={formData.allowRetake}
                    onCheckedChange={(checked) =>
                      handleInputChange("allowRetake", checked)
                    }
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Ready to create your test? You can add questions after
                  creation.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/tests")}
                  className="px-6 py-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTestMutation.isPending}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Save size={16} />
                  {createTestMutation.isPending ? "Creating..." : "Create Test"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTest;
