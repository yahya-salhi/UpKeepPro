function TaskStatusTabs({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="my-2">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`px-4 py-2 rounded-lg ${
              activeTab === tab.label
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            } cursor-pointer`}
            onClick={() => setActiveTab(tab.label)}
          >
            <div className="flex items-center">
              <span>{tab.label}</span>
              <span
                className={`text-xs ml-2 px-2 py-0.5 rounded-full ${
                  activeTab === tab.label
                    ? "bg-white text-blue-500"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {tab.count}
              </span>
            </div>
            {activeTab === tab.label && (
              <div className="absolute w-full h-1 bg-blue-500 rounded-b-lg"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default TaskStatusTabs;
