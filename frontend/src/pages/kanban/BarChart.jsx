import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = ["#EF4444", "#F59E0B", "#10B981"]; // red, orange, green

export default function BarChart({ data, colors = COLORS }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="priority" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          formatter={(value) => [`${value} tasks`, "Count"]}
          labelFormatter={(label) => `Priority: ${label}`}
        />
        <Legend
          formatter={(value) => <span className="text-sm">{value}</span>}
        />
        <Bar dataKey="count" name="Task Count" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}
