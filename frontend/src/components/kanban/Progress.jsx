function Progress({ progress }) {
  const getProgressColors = () => {
    // If task is complete (100%), show green
    if (progress === 100) {
      return {
        bg: "bg-green-100 dark:bg-green-900/20",
        bar: "bg-green-500",
        text: "text-green-700 dark:text-green-400",
      };
    }
    // If task has no progress (0%), show blue
    else if (progress === 0) {
      return {
        bg: "bg-blue-100 dark:bg-blue-900/20",
        bar: "bg-blue-500",
        text: "text-blue-700 dark:text-blue-400",
      };
    }
    // For tasks in progress (1-99%), show yellow
    else {
      return {
        bg: "bg-yellow-100 dark:bg-yellow-900/20",
        bar: "bg-yellow-500", // Solid yellow for better progress visibility
        text: "text-yellow-700 dark:text-yellow-400",
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
