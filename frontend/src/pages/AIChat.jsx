import React from "react";
import { useThemeStore } from "../store/useThemeStore.js";
import UserDataChatbot from "../components/UserDataChatbot";
import { Bot, Database, Users, BarChart3 } from "lucide-react";

function AIChat() {
  const { theme } = useThemeStore();

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      data-theme={theme}
    >
      <div className="pt-16 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Bot className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  AI Assistant
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Get insights about your app's user data using natural language
                </p>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Professional Analytics Interface
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Use the tabs below to navigate between User Queries,
                    Real-time Data, and Analytics
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-12rem)]">
            <UserDataChatbot />
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🤖 Powered by TinyLlama running locally via Ollama • 🔒 Completely
              offline and private • 📊 Real-time MongoDB data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChat;
