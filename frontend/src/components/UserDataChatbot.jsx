import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  BarChart3,
  Users,
  Database,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const UserDataChatbot = () => {
  const [activeTab, setActiveTab] = useState("user-queries");
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      content:
        "👋 Hello! I'm your **Professional User Analytics Assistant**. Choose a category above to get started:\n\n**👥 User Queries**: Basic user counts, roles, and status\n**📊 Real-time Data**: Live MongoDB data with auto-refresh\n**📈 Analytics**: Trends, insights, and breakdowns\n\nSelect a tab above or ask me anything!",
      timestamp: new Date(),
      meta: { isUserDataQuery: false },
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const scrollToBottom = () => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Check if user is near the bottom of the chat
  const checkScrollPosition = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  useEffect(() => {
    // Only auto-scroll if user is near the bottom or it's the first message
    if (messages.length <= 1 || shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  // Add scroll event listener to detect user scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Force auto-scroll when user sends a message
    setShouldAutoScroll(true);

    try {
      const response = await fetch("/api/chat/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: data.data.message,
          timestamp: new Date(),
          meta: data.data.meta,
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error(data.message || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");

      const errorMessage = {
        id: Date.now() + 1,
        type: "bot",
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Categorized suggested questions
  const questionCategories = {
    "user-queries": {
      title: "👥 User Queries",
      icon: Users,
      questions: [
        "How many users are in my app?",
        "Who's online right now?",
        "Show me admin users",
        "Who is available?",
        "Show me offline users",
        "How many users are unavailable?",
      ],
    },
    "real-time": {
      title: "📊 Real-time Data",
      icon: Database,
      questions: [
        "User status overview",
        "Role distribution",
        "Department breakdown",
        "Current online users",
        "Available users right now",
        "Live user statistics",
      ],
    },
    analytics: {
      title: "📈 Analytics",
      icon: TrendingUp,
      questions: [
        "User trends this week",
        "Weekly activity report",
        "Peak activity hours",
        "User engagement trends",
        "Department analytics",
        "Growth patterns",
      ],
    },
  };

  const currentQuestions = questionCategories[activeTab]?.questions || [];

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);

    // Add a helpful message when switching tabs
    const category = questionCategories[newTab];
    const helpMessage = {
      id: Date.now(),
      type: "bot",
      content: `🎯 **${category.title}** selected! Here are some questions you can ask in this category. Click any suggestion below or type your own question.`,
      timestamp: new Date(),
      meta: { isUserDataQuery: false, isTabSwitch: true },
    };

    setMessages((prev) => [...prev, helpMessage]);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        {/* Title Bar */}
        <div className="flex items-center gap-3 p-4">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              User Data Assistant
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Professional analytics and insights
            </p>
          </div>
          <div className="ml-auto">
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-gray-200 dark:border-gray-700">
          {Object.entries(questionCategories).map(([key, category]) => {
            const IconComponent = category.icon;
            const isActive = activeTab === key;

            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{category.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.type === "bot" && (
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            )}

            <div
              className={`max-w-2xl lg:max-w-4xl px-5 py-4 rounded-lg ${
                message.type === "user"
                  ? "bg-blue-600 text-white"
                  : message.isError
                  ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              }`}
            >
              <div className="text-base leading-relaxed whitespace-pre-wrap">
                {/* Render markdown-style formatting for user data responses */}
                {message.meta?.isUserDataQuery ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                        .replace(/\n/g, "<br>"),
                    }}
                  />
                ) : (
                  message.content
                )}
              </div>
              <p
                className={`text-xs mt-1 ${
                  message.type === "user"
                    ? "text-blue-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </p>

              {/* Show clean metadata for user data queries */}
              {message.meta?.isUserDataQuery &&
                message.meta?.userDataContext && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                    <p className="font-medium text-green-800 dark:text-green-200 flex items-center gap-1">
                      <span>📊</span> User Data Query
                    </p>
                    <p className="text-green-700 dark:text-green-300 mt-1">
                      Query Type:{" "}
                      {message.meta.userDataContext.data?.type || "Unknown"}
                    </p>
                  </div>
                )}

              {/* Show indicator for tab switch messages */}
              {message.meta?.isTabSwitch && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
                  <p className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-1">
                    <span>🎯</span> Category Selected
                  </p>
                </div>
              )}
            </div>

            {message.type === "user" && (
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex-shrink-0">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Categorized Suggested Questions - Compact */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          {React.createElement(questionCategories[activeTab]?.icon || Users, {
            className: "w-4 h-4 text-blue-600 dark:text-blue-400",
          })}
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {questionCategories[activeTab]?.title} - Quick Questions:
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
          {currentQuestions.slice(0, 6).map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedQuestion(question)}
              className="text-xs px-2 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 transition-colors border border-gray-200 dark:border-gray-600 text-left truncate"
              title={question}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your users..."
            className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="1"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDataChatbot;
