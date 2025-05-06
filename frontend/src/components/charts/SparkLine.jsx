import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";

const SparkLine = ({ id, height, width, color, data, type, currentColor }) => {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Tooltip
            formatter={(value, name, props) => [
              `${value}`,
              `${props.payload.x}`,
            ]}
          />
          <Line
            type="monotone"
            dataKey="y"
            stroke={currentColor}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SparkLine;
