import { Link } from "react-router-dom";
import { MessageSquare, Settings } from "lucide-react";
import { useThemeStore } from "../../store/useThemeStore";

function NavBarChat() {
  const { theme } = useThemeStore();
  return (
    <header
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 z-40 backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 w-full shadow-sm"
      data-theme={theme}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chatty</h1>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={"/settings"}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavBarChat;

//2h42
