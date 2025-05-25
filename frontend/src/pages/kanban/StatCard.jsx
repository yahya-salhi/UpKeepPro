function StatCard({ label, count, status }) {
  // Define styles based on the status
  const statCard = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "inprogress":
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  return (
    <div className={`flex-1 text-[10px] font-medium ${statCard()} px-4 py-0.5`}>
      <span className="text-[12px] font-semibold">{count}</span> <br /> {label}
    </div>
  );
}

export default StatCard;
