import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const QCMEditor = ({ question, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    question: question?.question || "",
    questionHtml: question?.questionHtml || "",
    questionType: question?.questionType || "multiple-choice",
    options: question?.options || [
      { text: "", isCorrect: false, explanation: "" },
      { text: "", isCorrect: false, explanation: "" },
    ],
    points: question?.points || 1,
    difficulty: question?.difficulty || "medium",
    timeLimit: question?.timeLimit || 0,
    category: question?.category || "Test",
    tags: question?.tags || [],
  });

  const [useRichText, setUseRichText] = useState(!!question?.questionHtml);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "bullet",
    "link",
    "image",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { text: "", isCorrect: false, explanation: "" },
      ],
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const handleCorrectAnswerChange = (index, isCorrect) => {
    const newOptions = [...formData.options];

    if (
      formData.questionType === "single-choice" ||
      formData.questionType === "true-false"
    ) {
      // For single choice, only one can be correct
      newOptions.forEach((option, i) => {
        option.isCorrect = i === index ? isCorrect : false;
      });
    } else {
      // For multiple choice, multiple can be correct
      newOptions[index].isCorrect = isCorrect;
    }

    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const handleQuestionTypeChange = (type) => {
    let newOptions = [...formData.options];

    if (type === "true-false") {
      newOptions = [
        { text: "True", isCorrect: false, explanation: "" },
        { text: "False", isCorrect: false, explanation: "" },
      ];
    } else if (
      type === "single-choice" &&
      formData.questionType === "multiple-choice"
    ) {
      // Ensure only one correct answer for single choice
      const correctIndex = newOptions.findIndex((opt) => opt.isCorrect);
      newOptions.forEach((option, i) => {
        option.isCorrect = i === correctIndex && correctIndex !== -1;
      });
    }

    setFormData((prev) => ({
      ...prev,
      questionType: type,
      options: newOptions,
    }));
  };

  const validateQuestion = () => {
    if (!formData.question.trim() && !formData.questionHtml.trim()) {
      return "Question content is required";
    }

    if (formData.options.length < 2) {
      return "At least 2 options are required";
    }

    if (!formData.options.some((opt) => opt.text.trim())) {
      return "At least one option must have text";
    }

    if (!formData.options.some((opt) => opt.isCorrect)) {
      return "At least one correct answer is required";
    }

    return null;
  };

  const handleSave = () => {
    const error = validateQuestion();
    if (error) {
      alert(error);
      return;
    }

    const questionData = {
      ...formData,
      questionHtml: useRichText ? formData.questionHtml : "",
      question: useRichText ? "" : formData.question,
    };

    onSave(questionData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {question ? "Edit Question" : "Create New Question"}
        </CardTitle>
        <CardDescription>
          Create multiple choice questions with rich text support
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Type and Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={formData.questionType}
              onValueChange={handleQuestionTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="single-choice">Single Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value) => handleInputChange("difficulty", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Points</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={formData.points}
              onChange={(e) =>
                handleInputChange("points", parseInt(e.target.value))
              }
            />
          </div>
        </div>

        {/* Rich Text Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Use Rich Text Editor</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enable formatting, images, and advanced content
            </p>
          </div>
          <Switch checked={useRichText} onCheckedChange={setUseRichText} />
        </div>

        {/* Question Content */}
        <div className="space-y-2">
          <Label>Question *</Label>
          {useRichText ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
              <ReactQuill
                value={formData.questionHtml}
                onChange={(value) => handleInputChange("questionHtml", value)}
                modules={modules}
                formats={formats}
                placeholder="Enter your question here..."
                className="[&_.ql-editor]:min-h-[120px]"
              />
            </div>
          ) : (
            <Textarea
              value={formData.question}
              onChange={(e) => handleInputChange("question", e.target.value)}
              placeholder="Enter your question here..."
              rows={4}
            />
          )}
        </div>

        {/* Answer Options */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label>Answer Options</Label>
            {formData.questionType !== "true-false" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Option
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <div className="flex items-center pt-2">
                  <input
                    type={
                      formData.questionType === "multiple-choice"
                        ? "checkbox"
                        : "radio"
                    }
                    name="correct-answer"
                    checked={option.isCorrect}
                    onChange={(e) =>
                      handleCorrectAnswerChange(index, e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex-1 space-y-2">
                  <Input
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(index, "text", e.target.value)
                    }
                    placeholder={`Option ${index + 1}`}
                    disabled={formData.questionType === "true-false"}
                  />
                  <Input
                    value={option.explanation}
                    onChange={(e) =>
                      handleOptionChange(index, "explanation", e.target.value)
                    }
                    placeholder="Explanation (optional)"
                    className="text-sm"
                  />
                </div>

                {formData.questionType !== "true-false" &&
                  formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="mt-1"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save Question
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QCMEditor;
