import { useState, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import debounce from "lodash/debounce";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = [
  "header",
  "font",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "align",
  "link",
  "image",
];

const CATEGORIES = [
  "General",
  "Technical",
  "Report",
  "Documentation",
  "Other"
];

const Editor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [isNewDocument, setIsNewDocument] = useState(!id);
  const [recentDocuments, setRecentDocuments] = useState([]);

  // Fetch document if editing
  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  // Fetch recent documents
  useEffect(() => {
    fetchRecentDocuments();
  }, []);

  const fetchDocument = async () => {
    try {
      const response = await axios.get(`/api/documents/${id}`);
      const { title, content, category } = response.data.data;
      setTitle(title);
      setContent(content);
      setCategory(category);
    } catch (error) {
      console.error("Error fetching document:", error);
      setSaveStatus("Error loading document");
    }
  };

  const fetchRecentDocuments = async () => {
    try {
      const response = await axios.get("/api/documents?limit=5");
      setRecentDocuments(response.data.data);
    } catch (error) {
      console.error("Error fetching recent documents:", error);
    }
  };

  // Update word and character count
  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, "");
    setCharCount(text.length);
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  }, [content]);

  // Save document
  const saveDocument = async (documentData) => {
    try {
      if (isNewDocument) {
        const response = await axios.post("/api/documents", documentData);
        setIsNewDocument(false);
        navigate(`/editor/${response.data.data._id}`, { replace: true });
      } else {
        await axios.put(`/api/documents/${id}`, documentData);
      }
      return true;
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  };

  // Autosave functionality
  const debouncedSave = useCallback(
    debounce(async () => {
      if (!title) return;
      
      try {
        setIsSaving(true);
        await saveDocument({
          title,
          content,
          category,
        });
        setSaveStatus("Changes saved");
      } catch (error) {
        setSaveStatus("Error saving changes");
      } finally {
        setIsSaving(false);
        setTimeout(() => setSaveStatus(""), 3000);
      }
    }, 1000),
    [title, content, category, id, isNewDocument]
  );

  const handleChange = (value) => {
    setContent(value);
    debouncedSave();
  };

  const handleCreateNew = () => {
    setIsNewDocument(true);
    setTitle("");
    setContent("");
    setCategory("General");
    navigate("/editor");
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-4 md:p-10 bg-base-100 rounded-xl shadow-lg">
      {/* Header with controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Document Editor</h2>
          <Button onClick={handleCreateNew}>New Document</Button>
        </div>

        {/* Document Info */}
        <div className="flex gap-4 items-start">
          <Input
            type="text"
            placeholder="Document Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              debouncedSave();
            }}
            className="flex-1"
          />
          <Select value={category} onValueChange={(value) => {
            setCategory(value);
            debouncedSave();
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status and Counts */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span className="text-gray-600">
            {charCount} {charCount === 1 ? "character" : "characters"}
          </span>
          {saveStatus && (
            <span className={`${saveStatus.includes("Error") ? "text-red-500" : "text-green-500"}`}>
              {saveStatus}
            </span>
          )}
        </div>

        {/* Recent Documents */}
        {recentDocuments.length > 0 && (
          <div className="flex gap-2 text-sm">
            <span className="text-gray-600">Recent:</span>
            {recentDocuments.map((doc) => (
              <button
                key={doc._id}
                onClick={() => navigate(`/editor/${doc._id}`)}
                className="text-primary hover:underline"
              >
                {doc.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="bg-base-200 p-4 rounded-lg">
        <ReactQuill
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder="Start typing..."
          className="bg-white rounded-lg [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg [&_.ql-editor]:min-h-[200px]"
          theme="snow"
        />
      </div>
    </div>
  );
};

export default Editor;