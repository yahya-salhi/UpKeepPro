function Progress({ progress, status }) {
  const getColor = () => {
    switch (status) {
      case "In Progress":
        return "bg-yellow-500";
      case "Completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };
  return (
    <div className="w-full h-1.5 bg-gray-200 rounded-full">
      <div
        className={`${getColor()} h-1.5 rounded-full`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

export default Progress;
