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
            Create New Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set up a new test for your students
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the basic details for your test
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Test Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Enter test title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
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

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe what this test covers"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) =>
                  handleInputChange("instructions", e.target.value)
                }
                placeholder="Provide instructions for test takers"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Configure the test settings and behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="480"
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) =>
                    handleInputChange("passingScore", parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Max Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxAttempts}
                  onChange={(e) =>
                    handleInputChange("maxAttempts", parseInt(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date & Time</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date & Time *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Options */}
        <Card>
          <CardHeader>
            <CardTitle>Test Options</CardTitle>
            <CardDescription>
              Configure additional test behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Shuffle Questions</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Randomize question order for each attempt
                  </p>
                </div>
                <Switch
                  checked={formData.shuffleQuestions}
                  onCheckedChange={(checked) =>
                    handleInputChange("shuffleQuestions", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Shuffle Answers</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Randomize answer options for each question
                  </p>
                </div>
                <Switch
                  checked={formData.shuffleAnswers}
                  onCheckedChange={(checked) =>
                    handleInputChange("shuffleAnswers", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Results</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Show detailed results after completion
                  </p>
                </div>
                <Switch
                  checked={formData.showResults}
                  onCheckedChange={(checked) =>
                    handleInputChange("showResults", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Retake</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Allow multiple attempts (up to max attempts)
                  </p>
                </div>
                <Switch
                  checked={formData.allowRetake}
                  onCheckedChange={(checked) =>
                    handleInputChange("allowRetake", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/tests")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createTestMutation.isPending}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            {createTestMutation.isPending ? "Creating..." : "Create Test"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTest;
