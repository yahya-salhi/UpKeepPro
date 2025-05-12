const columns = [
  {
    accessorKey: "designation",
    header: "Designation",
  },
  {
    accessorKey: "mat",
    header: "MAT",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("type")}</span>
    ),
  },
  {
    accessorKey: "direction",
    header: "Direction",
  },
  {
    accessorKey: "currentQte",
    header: "Available Qty",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.getValue("currentQte")}/{row.original.originalQte}
      </span>
    ),
  },
  {
    accessorKey: "situation",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          row.getValue("situation") === "available" || row.getValue("situation") === "partial"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {row.getValue("situation") === "partial" ? "available" : row.getValue("situation")}
      </span>
    ),
  },
];

export default columns;
