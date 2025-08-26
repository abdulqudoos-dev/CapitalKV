import React from "react";
import PropTypes from "prop-types";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

const RevenueImpactChart = ({
  totalRevenue = 10000, // Dummy data for total revenue
  revenuePerConversion = 2500, // Dummy data for revenue per conversion
  conversionCount = 4, // Dummy data for conversion count
}) => {
  const chartData = [
    { name: "Total Revenue", value: totalRevenue },
    { name: "Revenue per Conversion", value: revenuePerConversion },
  ];

  const COLORS = ["#8884d8", "#82ca9d"];

  return (
    <div
      className="revenue-impact-chart"
      style={{ width: "100%", height: 300 }}
    >
      <h3>Revenue Impact Analysis</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`$${value.toLocaleString()}`]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// PropTypes for type checking
RevenueImpactChart.propTypes = {
  totalRevenue: PropTypes.number.isRequired,
  revenuePerConversion: PropTypes.number.isRequired,
  conversionCount: PropTypes.number.isRequired,
};

export default RevenueImpactChart;
