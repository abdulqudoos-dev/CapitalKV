import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CampaignOverviewChart = ({ campaignData }) => {
  const data = [
    { name: "Week 1", impressions: 400, clicks: 240, conversions: 50 },
    { name: "Week 2", impressions: 300, clicks: 139, conversions: 30 },
    { name: "Week 3", impressions: 200, clicks: 980, conversions: 70 },
    { name: "Week 4", impressions: 278, clicks: 390, conversions: 40 },
    { name: "Week 5", impressions: 189, clicks: 480, conversions: 60 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

        <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />

        <YAxis />
        <Tooltip
          contentStyle={{ backgroundColor: "#f5f5f5" }}
          labelStyle={{ color: "#333" }}
        />

        <Legend verticalAlign="top" height={36} />

        <Line
          type="monotone"
          dataKey="impressions"
          stroke="#8884d8"
          strokeWidth={3}
          activeDot={{
            r: 8,
            strokeWidth: 2,
            stroke: "#fff",
          }}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke="#82ca9d"
          strokeWidth={3}
          activeDot={{
            r: 8,
            strokeWidth: 2,
            stroke: "#fff",
          }}
        />
        <Line
          type="monotone"
          dataKey="conversions"
          stroke="#ff7300"
          strokeWidth={3}
          activeDot={{
            r: 8,
            strokeWidth: 2,
            stroke: "#fff",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CampaignOverviewChart;
