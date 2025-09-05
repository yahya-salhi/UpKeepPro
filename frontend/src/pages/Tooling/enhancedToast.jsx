import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Undo,
  Eye,
  ExternalLink,
} from "lucide-react";

// Enhanced toast utility with action buttons and better styling
export const enhancedToast = {
  success: (message, options = {}) => {
    const {
      action,
      actionLabel = "View",
      onAction,
      duration = 4000,
      undoAction,
      undoLabel = "Undo",
    } = options;

    return toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-gray-300 dark:ring-black ring-opacity-20 dark:ring-opacity-5 border-l-4 border-l-green-500`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Success
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            {undoAction && (
              <button
                onClick={() => {
                  undoAction();
                  toast.dismiss(t.id);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-orange-700 dark:text-orange-600 hover:text-orange-600 dark:hover:text-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <Undo className="h-4 w-4 mr-1" />
                {undoLabel}
              </button>
            )}

            {action && onAction && (
              <button
                onClick={() => {
                  onAction();
                  toast.dismiss(t.id);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-600 hover:text-blue-600 dark:hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Eye className="h-4 w-4 mr-1" />
                {actionLabel}
              </button>
            )}

            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      ),
      { duration }
    );
  },

  error: (message, options = {}) => {
    const {
      action,
      actionLabel = "Retry",
      onAction,
      duration = 5000,
      details,
    } = options;

    return toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-gray-300 dark:ring-black ring-opacity-20 dark:ring-opacity-5 border-l-4 border-l-red-500`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Error
                </p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {message}
                </p>
                {details && (
                  <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    {details}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex border-l border-gray-200 dark:border-gray-700">
            {action && onAction && (
              <button
                onClick={() => {
                  onAction();
                  toast.dismiss(t.id);
                }}
                className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                {actionLabel}
              </button>
            )}

            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      ),
      { duration }
    );
  },

  info: (message, options = {}) => {
    const {
      action,
      actionLabel = "Learn More",
      onAction,
      duration = 4000,
    } = options;

    return toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-l-blue-500`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Information
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="flex border-l border-gray-200 dark:border-gray-700">
            {action && onAction && (
              <button
                onClick={() => {
                  onAction();
                  toast.dismiss(t.id);
                }}
                className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                {actionLabel}
              </button>
            )}

            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      ),
      { duration }
    );
  },

  warning: (message, options = {}) => {
    const {
      action,
      actionLabel = "Review",
      onAction,
      duration = 4000,
    } = options;

    return toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-4 border-l-yellow-500`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Warning
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
          </div>

          <div className="flex border-l border-gray-200 dark:border-gray-700">
            {action && onAction && (
              <button
                onClick={() => {
                  onAction();
                  toast.dismiss(t.id);
                }}
                className="w-full border border-transparent rounded-none p-4 flex items-center justify-center text-sm font-medium text-yellow-600 hover:text-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                {actionLabel}
              </button>
            )}

            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      ),
      { duration }
    );
  },
};

// Specific tooling-related toast functions
export const toolingToast = {
  toolCreated: (toolName, toolId) => {
    return enhancedToast.success(`Tool "${toolName}" created successfully`, {
      actionLabel: "View Tool",
      onAction: () => {
        // Navigate to tool details
        window.location.href = `/tools?selected=${toolId}`;
      },
      undoAction: () => {
        // Could implement undo functionality here
        console.log("Undo tool creation");
      },
    });
  },

  toolUpdated: (toolName, toolId) => {
    return enhancedToast.success(`Tool "${toolName}" updated successfully`, {
      actionLabel: "View Changes",
      onAction: () => {
        window.location.href = `/tools?selected=${toolId}`;
      },
    });
  },

  toolDeleted: (toolName, onUndo) => {
    return enhancedToast.success(`Tool "${toolName}" deleted successfully`, {
      undoAction: onUndo,
      undoLabel: "Restore",
      duration: 6000, // Longer duration for undo actions
    });
  },

  lowStock: (toolName, currentStock, minStock) => {
    return enhancedToast.warning(
      `Low stock alert: ${toolName} has only ${currentStock} units remaining`,
      {
        actionLabel: "Reorder",
        onAction: () => {
          // Navigate to reorder page or open reorder modal
          console.log("Navigate to reorder");
        },
      }
    );
  },

  conversionComplete: (toolName, fromType, toType) => {
    return enhancedToast.success(
      `Tool "${toolName}" converted from ${fromType} to ${toType}`,
      {
        actionLabel: "View History",
        onAction: () => {
          // Show conversion history
          console.log("Show conversion history");
        },
      }
    );
  },
};
