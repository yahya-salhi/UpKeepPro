import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#FBBF24", "#3B82F6", "#10B981"]; // yellow, blue, green

export default function PieChart({ data, colors = COLORS }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RePieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="red"
          dataKey="count"
          nameKey="status"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} tasks`, "Count"]} />
        <Legend
          formatter={(value) => <span className="text-sm">{value}</span>}
        />
      </RePieChart>
    </ResponsiveContainer>
  );
}
