import { useState, useRef, useEffect } from "react";
import axios from "../lib/axios";
import { Send, Loader2, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { type: "user", content: input }]);
    setInput("");

    try {
      const response = await axios.post("/chat/send-message", {
        message: input,
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          { type: "ai", content: response.data.data.message },
        ]);
      } else {
        throw new Error("Failed to get response from AI");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Unable to process your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-t-2xl">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          AI Chat Assistant
        </h2>
        <p className="text-sm text-blue-100">
          Your personal assistant for ISO21001-related queries.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex flex-col h-[600px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg p-4 max-w-[75%] shadow-md ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 p-3 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
