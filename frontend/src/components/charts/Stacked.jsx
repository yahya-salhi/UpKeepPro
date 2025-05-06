import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useStateContext } from "../../contexts/ContextProvider";

// Your stacked data
const stackedChartData = [
  { x: "Jan", Budget: 300, Expense: 200 },
  { x: "Feb", Budget: 250, Expense: 180 },
  { x: "Mar", Budget: 320, Expense: 240 },
  { x: "Apr", Budget: 400, Expense: 280 },
];

const Stacked = ({ width = "100%", height = 300 }) => {
  const { currentMode, currentColor } = useStateContext();

  return (
    <div style={{ width: "100%", minWidth: "300px", height: height }}>
      {" "}
      {/* Ensures container has a width */}
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={300}
        minHeight={250}
      >
        <BarChart
          data={stackedChartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="Budget"
            stackId="a"
            fill={currentColor}
            label={{ fill: currentColor }}
          />
          <Bar dataKey="Expense" stackId="a" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Stacked;
