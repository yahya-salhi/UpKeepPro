import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';

// Historical data for ISO 9001 since June 2019
const iso9001Data = [
  { month: 'Jun 2019', iso9001: 65 },
  { month: 'Dec 2019', iso9001: 72 },
  { month: 'Jun 2020', iso9001: 68 },
  { month: 'Dec 2020', iso9001: 75 },
  { month: 'Jun 2021', iso9001: 70 },
  { month: 'Dec 2021', iso9001: 82 },
  { month: 'Jun 2022', iso9001: 78 },
  { month: 'Dec 2022', iso9001: 85 },
  { month: 'Jun 2023', iso9001: 80 },
  { month: 'Dec 2023', iso9001: 88 },
  { month: 'Jun 2024', iso9001: 92 },
  { month: 'Dec 2024', iso9001: 95 },
  { month: 'Jun 2025', iso9001: 98 },
];

// Projected data for ISO 21001 from June 2025
const iso21001Data = [
  { month: 'Jun 2025', iso21001: 45 },
  { month: 'Dec 2025', iso21001: 52 },
  { month: 'Jun 2026', iso21001: 58 },
  { month: 'Dec 2026', iso21001: 65 },
  { month: 'Jun 2027', iso21001: 72 },
  { month: 'Dec 2027', iso21001: 78 },
  { month: 'Jun 2028', iso21001: 85 },
  { month: 'Dec 2028', iso21001: 92 },
];

// Combine data for the chart
const combinedData = [
  ...iso9001Data.map(item => ({ ...item, iso21001: null })),
  ...iso21001Data.filter(item => item.month !== 'Jun 2025').map(item => ({ 
    month: item.month, 
    iso9001: iso9001Data.find(d => d.month === 'Jun 2025')?.iso9001 || 98,
    iso21001: item.iso21001 
  }))
];

// Custom tooltip component with enhanced styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <p className="text-gray-900 dark:text-gray-100 font-semibold mb-2 text-sm">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            entry.value && (
              <div key={`item-${index}`} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-600 dark:text-gray-300 text-sm">{entry.name}:</span>
                <span className="text-gray-900 dark:text-white font-bold">{entry.value}%</span>
              </div>
            )
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function LineChart() {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={combinedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <defs>
            <linearGradient id="iso9001Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="iso21001Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#E5E7EB" 
            strokeOpacity={0.5}
            vertical={false}
            className="dark:stroke-gray-700"
          />
          <XAxis 
            dataKey="month" 
            stroke="#6B7280"
            tick={{ fill: '#4B5563', fontSize: 12 }}
            interval="preserveStartEnd"
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={{ stroke: '#E5E7EB' }}
            className="dark:text-gray-400 dark:stroke-gray-600"
          />
          <YAxis 
            stroke="#6B7280"
            tick={{ fill: '#4B5563' }}
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={{ stroke: '#E5E7EB' }}
            className="dark:text-gray-400 dark:stroke-gray-600"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36}
            wrapperStyle={{
              paddingBottom: '1rem'
            }}
            formatter={(value) => (
              <span className="text-gray-700 dark:text-gray-300 text-sm">{value}</span>
            )}
          />
          <ReferenceLine 
            x="Jun 2025" 
            stroke="#D97706" 
            strokeDasharray="3 3" 
            label={{ 
              value: "ISO 21001 Launch", 
              position: "top", 
              fill: "#D97706",
              fontSize: 12,
              fontWeight: 500
            }} 
          />
          <Area
            type="monotone"
            dataKey="iso9001"
            stroke="none"
            fillOpacity={1}
            fill="url(#iso9001Gradient)"
          />
          <Area
            type="monotone"
            dataKey="iso21001"
            stroke="none"
            fillOpacity={1}
            fill="url(#iso21001Gradient)"
          />
          <Line
            type="monotone"
            dataKey="iso9001"
            name="ISO 9001"
            stroke="#2563EB"
            strokeWidth={3}
            dot={{ 
              fill: '#2563EB', 
              strokeWidth: 2, 
              r: 4,
              stroke: '#1E40AF'
            }}
            activeDot={{ 
              r: 8, 
              strokeWidth: 2,
              stroke: '#1E40AF',
              fill: '#2563EB'
            }}
            connectNulls={true}
          />
          <Line
            type="monotone"
            dataKey="iso21001"
            name="ISO 21001 (Projected)"
            stroke="#059669"
            strokeWidth={3}
            dot={{ 
              fill: '#059669', 
              strokeWidth: 2, 
              r: 4,
              stroke: '#065F46'
            }}
            activeDot={{ 
              r: 8, 
              strokeWidth: 2,
              stroke: '#065F46',
              fill: '#059669'
            }}
            connectNulls={true}
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChart;
