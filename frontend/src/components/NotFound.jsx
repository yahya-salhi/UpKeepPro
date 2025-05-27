import { useNavigate } from "react-router-dom";
import { FiHome, FiArrowLeft, FiSearch, FiHelpCircle } from "react-icons/fi";
import { MdError } from "react-icons/md";
import { useStateContext } from "../contexts/ContextProvider";
import { Button } from "./ui/button";

const NotFound = () => {
  const navigate = useNavigate();
  const { currentColor, currentMode } = useStateContext();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const popularPages = [
    { name: "Dashboard", path: "/dashboard", icon: <FiHome className="text-sm" /> },
    { name: "Calendar", path: "/calendar", icon: <FiSearch className="text-sm" /> },
    { name: "Kanban Board", path: "/kanban", icon: <FiHelpCircle className="text-sm" /> },
    { name: "Chat", path: "/chat", icon: <FiHelpCircle className="text-sm" /> },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <div className="text-center">
          {/* Error Icon and Code */}
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div
                className="p-6 rounded-full"
                style={{
                  backgroundColor: currentMode === "Dark" ? "#33373E" : "#F7F7F7",
                  border: `2px solid ${currentColor}`,
                }}
              >
                <MdError
                  className="text-6xl"
                  style={{ color: currentColor }}
                />
              </div>
            </div>
            <h1
              className="text-8xl font-bold mb-4"
              style={{ color: currentColor }}
            >
              404
            </h1>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, it happens to the best of us!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105"
              style={{ backgroundColor: currentColor }}
            >
              <FiHome className="text-lg" />
              Go to Dashboard
            </Button>
            <Button
              onClick={handleGoBack}
              variant="outline"
              className={`flex items-center gap-2 px-6 py-3 font-medium rounded-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105 ${
                currentMode === "Dark"
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FiArrowLeft className="text-lg" />
              Go Back
            </Button>
          </div>

          {/* Popular Pages */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Popular Pages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularPages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => navigate(page.path)}
                  className={`p-4 rounded-xl transition-all duration-200 hover:shadow-md transform hover:scale-105 ${
                    currentMode === "Dark"
                      ? "bg-gray-700/50 hover:bg-gray-700 text-gray-300"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: `${currentColor}20`,
                        color: currentColor,
                      }}
                    >
                      {page.icon}
                    </div>
                    <span className="font-medium">{page.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              currentMode === "Dark"
                ? "bg-blue-900/20 text-blue-400"
                : "bg-blue-100 text-blue-600"
            }`}>
              <FiHelpCircle className="text-lg" />
              <span className="text-sm font-medium">
                Need help? Contact our support team
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
