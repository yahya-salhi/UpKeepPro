import React from 'react';
import { useThemeStore } from "../store/useThemeStore.js";
import UserDataChatbot from "../components/UserDataChatbot";
import { Bot, Database, Users, BarChart3 } from 'lucide-react';

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

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      User Queries
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ask about user counts, roles, and status
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Real-time Data
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get live data from your MongoDB
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Analytics
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get insights and breakdowns
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Interface */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-16rem)]">
            <UserDataChatbot />
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              🤖 Powered by TinyLlama running locally via Ollama • 
              🔒 Completely offline and private • 
              📊 Real-time MongoDB data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChat;
