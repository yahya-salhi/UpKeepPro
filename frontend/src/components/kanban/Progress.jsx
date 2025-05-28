function Progress({ progress, status }) {
  const getProgressColors = () => {
    // Use task status to determine colors, not completion percentage
    const statusKey = status?.toLowerCase() || "pending";

    switch (statusKey) {
      case "done":
      case "completed":
        return {
          bg: "bg-green-100 dark:bg-green-900/20",
          bar: "bg-green-500",
          text: "text-green-700 dark:text-green-400",
        };
      case "inprogress":
      case "in-progress":
        return {
          bg: "bg-yellow-100 dark:bg-yellow-900/20",
          bar: "bg-yellow-500",
          text: "text-yellow-700 dark:text-yellow-400",
        };
      case "pending":
      default:
        return {
          bg: "bg-blue-100 dark:bg-blue-900/20",
          bar: "bg-blue-500",
          text: "text-blue-700 dark:text-blue-400",
        };
    }
  };

  const colors = getProgressColors();

  return (
    <div
      className={`w-full h-2.5 ${colors.bg} rounded-full relative overflow-hidden transition-all duration-300`}
    >
      <div
        className={`${colors.bar} h-full rounded-full transition-all duration-300 relative`}
        style={{ width: `${progress}%` }}
      >
        {progress >= 20 && (
          <span
            className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white`}
          >
            {progress}%
          </span>
        )}
      </div>
      {progress < 20 && (
        <span
          className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium ${colors.text}`}
        >
          {progress}%
        </span>
      )}
    </div>
  );
}

export default Progress;
