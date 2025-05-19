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

// Configure axios to send credentials (cookies) with requests
// This is crucial for interacting with a backend that uses cookie-based authentication
axios.defaults.withCredentials = true;

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

const CATEGORIES = ["General", "Technical", "Report", "Documentation", "Other"];

const Editor = () => {
  const { id } = useParams(); // Document ID from URL
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [currentDocument, setCurrentDocument] = useState(null); // Stores the loaded document object

  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false); // For initial document load
  const [isSaving, setIsSaving] = useState(false); // For create, update, delete operations
  const [saveStatus, setSaveStatus] = useState(""); // User feedback message

  const [isNewDocument, setIsNewDocument] = useState(!id); // True if creating a new document
  const [recentDocuments, setRecentDocuments] = useState([]);

  // Fetch recent documents (e.g., for a quick access list)
  const fetchRecentDocuments = useCallback(async () => {
    try {
      const response = await axios.get(
        "/api/documents?limit=5&sort=createdAt_desc"
      );
      if (response.data && response.data.success) {
        setRecentDocuments(response.data.data);
      } else {
        console.error(
          "Failed to fetch recent documents:",
          response.data?.message
        );
      }
    } catch (error) {
      console.error(
        "Error fetching recent documents:",
        error.response?.data?.message || error.message
      );
    }
  }, [setRecentDocuments]);

  // Fetch a specific document by ID
  const fetchDocument = useCallback(
    async (documentId) => {
      if (!documentId) return;

      setIsLoading(true);
      setSaveStatus("Loading document...");
      try {
        const response = await axios.get(`/api/documents/${documentId}`);
        if (response.data && response.data.success) {
          const doc = response.data.data;
          setCurrentDocument(doc);
          setTitle(doc.title);
          setContent(doc.content);
          setCategory(doc.category || CATEGORIES[0]);
          setIsNewDocument(false);
          setSaveStatus("Document loaded successfully.");
        } else {
          throw new Error(response.data?.message || "Failed to load document.");
        }
      } catch (error) {
        console.error(
          "Error fetching document:",
          error.response?.data?.message || error.message
        );
        setSaveStatus(
          `Error: ${
            error.response?.data?.message ||
            error.message ||
            "Could not load document."
          }`
        );
        setCurrentDocument(null);
        setTitle("");
        setContent("");
        setCategory(CATEGORIES[0]);
        // Optional: navigate to a new document or dashboard if load fails and ID was present
        // if (id) navigate("/editor");
      } finally {
        setIsLoading(false);
        setTimeout(() => setSaveStatus(""), 3000);
      }
    },
    [
      setCurrentDocument,
      setTitle,
      setContent,
      setCategory,
      setIsNewDocument,
      setIsLoading,
      setSaveStatus,
    ]
  );

  // Effect to load document when ID changes or to set up for a new document
  useEffect(() => {
    if (id) {
      fetchDocument(id);
    } else {
      setIsNewDocument(true);
      setCurrentDocument(null);
      setTitle("");
      setContent("");
      setCategory(CATEGORIES[0]);
      setSaveStatus(""); // Clear status for new doc
      setIsLoading(false); // Not loading if new
    }
  }, [id, fetchDocument]);

  // Effect to fetch recent documents on component mount
  useEffect(() => {
    fetchRecentDocuments();
  }, [fetchRecentDocuments]);

  // Effect to update word and character counts when content changes
  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, ""); // Strip HTML tags for accurate count
    setCharCount(text.length);
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  }, [content]);

  // Function to save (create or update) a document
  const handleSaveDocument = useCallback(
    async (documentData) => {
      setIsSaving(true);
      setSaveStatus(
        isNewDocument ? "Creating document..." : "Saving changes..."
      );
      try {
        let response;
        if (isNewDocument) {
          response = await axios.post("/api/documents", documentData);
        } else {
          if (!id) throw new Error("Document ID is missing for update.");
          response = await axios.put(`/api/documents/${id}`, documentData);
        }

        if (response.data && response.data.success) {
          const savedDoc = response.data.data;
          setCurrentDocument(savedDoc);
          setTitle(savedDoc.title); // Update title if backend modifies it (e.g. sanitization)
          setContent(savedDoc.content); // Update content if backend modifies it
          setCategory(savedDoc.category);
          setIsNewDocument(false);
          setSaveStatus(
            isNewDocument
              ? "Document created successfully!"
              : "Changes saved successfully!"
          );
          if (isNewDocument && savedDoc._id) {
            navigate(`/editor/${savedDoc._id}`, { replace: true });
          }
          fetchRecentDocuments(); // Refresh recent documents list
          return savedDoc;
        } else {
          throw new Error(response.data?.message || "Failed to save document.");
        }
      } catch (error) {
        console.error(
          "Save error:",
          error.response?.data?.message || error.message
        );
        setSaveStatus(
          `Error: ${
            error.response?.data?.message ||
            error.message ||
            (isNewDocument
              ? "Could not create document."
              : "Could not save changes.")
          }`
        );
        // Do not re-throw, allow user to try again. If re-thrown, debouncedSave might not recover well.
      } finally {
        setIsSaving(false);
        setTimeout(() => setSaveStatus(""), 3500); // Slightly longer for user to read
      }
    },
    [
      id,
      isNewDocument,
      navigate,
      fetchRecentDocuments,
      setIsSaving,
      setSaveStatus,
      setIsNewDocument,
      setCurrentDocument,
      setTitle,
      setContent,
      setCategory,
    ]
  );

  // Debounced autosave function
  const debouncedSave = useCallback(
    debounce(async (currentTitle, currentContent, currentCategory) => {
      if (!currentTitle.trim()) {
        setSaveStatus("Title is required to save.");
        setTimeout(() => setSaveStatus(""), 3000);
        return;
      }
      // Avoid saving if nothing material has changed for an existing document
      if (
        !isNewDocument &&
        currentDocument &&
        currentTitle === currentDocument.title &&
        currentContent === currentDocument.content &&
        currentCategory === currentDocument.category
      ) {
        // setSaveStatus("No changes to save."); // Can be noisy, so commented out
        // setTimeout(() => setSaveStatus(""), 1500);
        return;
      }
      await handleSaveDocument({
        title: currentTitle,
        content: currentContent,
        category: currentCategory,
        // Add tags here if a tags input is implemented: tags: currentTags
      });
    }, 1500),
    [handleSaveDocument, isNewDocument, currentDocument]
  );

  const handleContentChange = (value) => {
    setContent(value);
    if (!isLoading) {
      // Avoid saving while initially loading content
      debouncedSave(title, value, category);
    }
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    debouncedSave(newTitle, content, category);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    debouncedSave(title, content, value);
  };

  const handleCreateNew = useCallback(() => {
    navigate("/editor"); // Navigate to the base editor route for a new document
  }, [navigate]);

  const handleDelete = useCallback(async () => {
    if (!id || !currentDocument) {
      setSaveStatus("No document selected to delete.");
      setTimeout(() => setSaveStatus(""), 3000);
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${currentDocument.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsSaving(true);
    setSaveStatus("Deleting document...");
    try {
      const response = await axios.delete(`/api/documents/${id}`);
      if (response.data && response.data.success) {
        setSaveStatus("Document deleted successfully.");
        fetchRecentDocuments();
        navigate("/editor");
      } else {
        throw new Error(response.data?.message || "Failed to delete document.");
      }
    } catch (error) {
      console.error(
        "Error deleting document:",
        error.response?.data?.message || error.message
      );
      setSaveStatus(
        `Error: ${
          error.response?.data?.message ||
          error.message ||
          "Could not delete document."
        }`
      );
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(""), 3500);
    }
  }, [
    id,
    currentDocument,
    navigate,
    fetchRecentDocuments,
    setIsSaving,
    setSaveStatus,
  ]);

  return (
    <div className="m-2 md:m-10 mt-24 p-4 md:p-10 bg-base-100 rounded-xl shadow-lg">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center">
          <h2
            className="text-2xl font-semibold truncate pr-4"
            title={
              isNewDocument
                ? "Create New Document"
                : currentDocument
                ? currentDocument.title
                : id
                ? "Loading..."
                : "Document Editor"
            }
          >
            {isNewDocument
              ? "Create New Document"
              : currentDocument
              ? currentDocument.title
              : id
              ? "Loading..."
              : "Document Editor"}
          </h2>
          <div className="flex gap-2 flex-shrink-0">
            <Button onClick={handleCreateNew} disabled={isLoading || isSaving}>
              New Document
            </Button>
            {!isNewDocument && id && currentDocument && (
              <Button
                onClick={handleDelete}
                variant="destructive" // Assumes your Button component supports this for styling
                disabled={isSaving || isLoading}
              >
                {isSaving && saveStatus.startsWith("Deleting")
                  ? "Deleting..."
                  : "Delete"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <Input
            type="text"
            placeholder="Document Title (required)"
            value={title}
            onChange={handleTitleChange}
            className="flex-1 text-lg"
            disabled={isLoading || isSaving}
            aria-label="Document Title"
          />
          <Select
            value={category}
            onValueChange={handleCategoryChange}
            disabled={isLoading || isSaving}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
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

        <div className="flex items-center gap-4 text-sm text-gray-600 min-h-[20px]">
          {" "}
          {/* Min height for status */}
          <span>
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span>
            {charCount} {charCount === 1 ? "character" : "characters"}
          </span>
          {(isLoading || isSaving || saveStatus) && (
            <span
              className={`font-medium ${
                saveStatus.toLowerCase().includes("error") ||
                saveStatus.toLowerCase().includes("failed") ||
                saveStatus.toLowerCase().includes("could not")
                  ? "text-red-600"
                  : saveStatus.toLowerCase().includes("success")
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
              role="status"
              aria-live="polite"
            >
              {isLoading
                ? "Loading..."
                : isSaving
                ? saveStatus || "Processing..."
                : saveStatus}
            </span>
          )}
        </div>

        {recentDocuments.length > 0 && (
          <div className="text-sm">
            <span className="font-medium text-gray-700">Recent Documents:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {recentDocuments.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => navigate(`/editor/${doc._id}`)}
                  className="text-primary hover:underline px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors disabled:opacity-50"
                  disabled={isLoading || isSaving}
                  title={doc.title}
                >
                  {doc.title.length > 25
                    ? doc.title.substring(0, 22) + "..."
                    : doc.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-base-200 p-1 rounded-lg shadow-inner">
        <ReactQuill
          value={content}
          onChange={handleContentChange}
          modules={modules}
          formats={formats}
          placeholder="Start typing your document here..."
          className={`bg-white rounded-lg [&_.ql-toolbar]:bg-gray-50 [&_.ql-toolbar]:border-b [&_.ql-toolbar]:border-gray-300 [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:rounded-b-lg [&_.ql-editor]:min-h-[400px] [&_.ql-editor]:p-4 [&_.ql-editor]:text-base ${
            isLoading || isSaving ? "opacity-50" : ""
          }`}
          theme="snow"
          readOnly={isLoading || isSaving}
        />
      </div>
    </div>
  );
};

export default Editor;
