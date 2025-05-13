function TaskStatusTabs({ tabs, activeTab, setActiveTab }) {
  // For debugging - print out the current props

  return (
    <div className="my-2">
      <div className="flex space-x-2 overflow-x-auto p-1">
        {tabs.map((tab) => {
          // Check if this tab is active
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.label}
              className={`px-4 py-2 rounded-lg flex-shrink-0 transition-colors ${
                isActive
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => {
                setActiveTab(tab.value);
              }}
            >
              <div className="flex items-center">
                <span>{tab.label}</span>
                <span
                  className={`text-xs ml-2 px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white text-blue-500"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {tab.count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TaskStatusTabs;
