    import React from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

const TaskPriorityChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <p className="text-sm text-gray-500">No data available.</p>
  );

  return (
    <div className="w-full h-64 bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">
        Task Priority Distribution
      </h2>

      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="total"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TaskPriorityChart;
