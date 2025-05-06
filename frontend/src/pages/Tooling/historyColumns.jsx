export const historyColumns = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    accessorKey: "eventType",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.eventType}</span>
    ),
  },
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => row.original.reference || row.original.exitRef || "N/A",
  },
  {
    accessorKey: "qteChange",
    header: "Quantity Change",
    cell: ({ row }) => (
      <span
        className={`font-medium ${
          row.original.qteChange > 0 ? "text-green-600" : "text-red-600"
        }`}
      >
        {row.original.qteChange > 0 ? "+" : ""}
        {row.original.qteChange}
      </span>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.exitReason || row.original.notes || "N/A"}
      </span>
    ),
  },
];
