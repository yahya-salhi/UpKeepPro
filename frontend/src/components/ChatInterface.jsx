import { useState, useRef, useEffect } from "react";
import axios from "../lib/axios";
import {
  Send,
  Loader2,
  BookOpen,
  XCircle,
  Copy,
  CheckCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sample ISO21001 quick prompts
  const quickPrompts = [
    {
      category: "Standards",
      questions: [
        "What are the core principles of ISO21001?",
        "How does ISO21001 improve educational quality?",
        "Explain ISO21001 compliance requirements",
      ],
    },
    {
      category: "Implementation",
      questions: [
        "Steps to implement ISO21001",
        "Best practices for ISO21001 adoption",
        "Common ISO21001 challenges",
      ],
    },
  ];

  // Auto-scroll and focus handling
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCopyMessage = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const MessageContent = ({ content }) => {
    return (
      <ReactMarkdown
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="relative group">
                <button
                  onClick={() => handleCopyMessage(children)}
                  className="absolute right-2 top-2 p-1 rounded bg-gray-800/30 hover:bg-gray-800/50 
                           invisible group-hover:visible transition-all"
                  aria-label="Copy code"
                >
                  {copiedIndex === props.index ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                <SyntaxHighlighter
                  style={tomorrow}
                  language={match[1]}
                  PreTag="div"
                  className="!bg-gray-900 !p-4 rounded-lg"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="bg-gray-800/20 rounded px-1.5 py-0.5" {...props}>
                {children}
              </code>
            );
          },
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc ml-6 mb-4 space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal ml-6 mb-4 space-y-2">{children}</ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mb-2">{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const handleSubmit = async (e, isRetry = false) => {
    e.preventDefault();
    if (!input.trim() && !isRetry) return;

    setIsLoading(true);
    setError(null);

    // If this is a retry, use the last message from the user
    const messageToSend = isRetry
      ? messages[messages.length - 2]?.content || input
      : input;

    if (!isRetry) {
      const userMessage = { type: "user", content: messageToSend };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
    }

    try {
      const response = await axios.post("/chat/send-message", {
        message: messageToSend,
      });

      if (response.data.success) {
        const aiMessage = {
          type: "ai",
          content: response.data.data.message,
          meta: response.data.data.meta,
        };
        setMessages((prev) => {
          // If retry, replace last AI message
          if (isRetry) {
            return [...prev.slice(0, -1), aiMessage];
          }
          return [...prev, aiMessage];
        });
      } else {
        throw new Error("Failed to get response from AI");
      }
    } catch (err) {
      const isTimeout =
        err.response?.status === 504 || err.response?.data?.meta?.isTimeout;

      setError({
        message:
          err.response?.data?.message || "Unable to process your request.",
        isTimeout,
        retryable: err.response?.data?.meta?.retryable,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = (e) => {
    handleSubmit(e, true);
  };

  const handleQuickPrompt = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="relative h-full">
      <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
        {/* Header - More compact */}
        <div className="mb-2 flex-none">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-xl" />
            ISO21001 Educational Assistant
          </h3>
        </div>

        {/* Quick Prompts - More compact */}
        <div className="flex-none bg-gray-50 dark:bg-gray-900 p-2 rounded-lg mb-2">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((category) => (
              <div key={category.category} className="flex-1 min-w-[200px]">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  {category.category}
                </div>
                <div className="flex flex-col gap-1">
                  {category.questions.map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(question)}
                      className="text-left px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded-lg 
                               hover:bg-blue-50 dark:hover:bg-blue-900 border border-gray-200 dark:border-gray-700
                               hover:border-blue-200 dark:hover:border-blue-500 transition-colors"
                      disabled={isLoading}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Container - No horizontal scroll */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative group w-auto max-w-[90%] ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  } rounded-2xl shadow-sm p-6`}
                >
                  <div
                    className={`prose ${
                      msg.type === "user"
                        ? "prose-invert"
                        : "prose-gray dark:prose-invert"
                    } max-w-none text-[15px] leading-relaxed break-words`}
                  >
                    <MessageContent content={msg.content} />
                  </div>
                  {msg.type === "ai" && (
                    <button
                      onClick={() => handleCopyMessage(msg.content, index)}
                      className="absolute -right-10 top-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 
                               invisible group-hover:visible transition-all"
                      aria-label="Copy message"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      Processing your request...
                    </span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-red-500">
                  <XCircle className="w-5 h-5" />
                  <span>{error.message}</span>
                </div>
                {error.retryable && (
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-800 
                             text-red-600 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 
                             transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled={isLoading}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Form */}
        <div className="flex-none mt-2">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask about ISO21001..."
                rows={1}
                className="w-full p-3 pr-12 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 
                         dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         focus:outline-none resize-none"
                style={{
                  minHeight: "44px",
                  maxHeight: "120px",
                }}
              />
              <div className="absolute right-2 bottom-1.5">
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 
                           disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
