import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import styles

const Editor = () => {
  const [content, setContent] = useState("");

  return (
    <div className="m-2 md:m-10 mt-24 p-4 md:p-10 bg-base-100 rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-4 text-xl font-semibold">Rich Text Editor</div>

      {/* Editor */}
      <div className="bg-base-200 p-4 rounded-lg">
        <ReactQuill
          value={content}
          onChange={setContent}
          className="bg-white rounded-lg"
          theme="snow"
        />
      </div>
    </div>
  );
};

export default Editor;
