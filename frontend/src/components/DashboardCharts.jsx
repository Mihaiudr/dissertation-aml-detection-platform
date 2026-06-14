import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

function DashboardCharts({ summary, alerts }) {
  const clearedTransactions = summary
    ? Math.max(summary.total_transactions - summary.total_alerts, 0)
    : 0;

  const outcomeData = summary
    ? [
        { name: "Alerts", value: summary.total_alerts },
        { name: "Normal transactions", value: clearedTransactions },
      ]
    : [];

  const paymentTypeMap = {};

  alerts.forEach((alert) => {
    const type = alert.Payment_type || "Unknown";
    paymentTypeMap[type] = (paymentTypeMap[type] || 0) + 1;
  });

  const paymentTypeData = Object.entries(paymentTypeMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const colors = ["#ef4444", "#22c55e"];

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <h3>Total Transactions: Alerts vs Normal Transactions</h3>

        {summary ? (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={72}
                  outerRadius={108}
                  minAngle={3}
                  paddingAngle={3}
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="chart-summary-row">
              <span><strong>{summary.total_alerts.toLocaleString()}</strong> Alerts</span>
              <span><strong>{clearedTransactions.toLocaleString()}</strong> Normal</span>
            </div>
          </>
        ) : (
          <div className="chart-empty">
            Upload a CSV file to generate chart data.
          </div>
        )}
      </div>

      <div className="chart-card">
        <h3>Review Alerts by Payment Type</h3>

        {alerts.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={paymentTypeData} margin={{ top: 12, right: 12, bottom: 72, left: 0 }}>
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                interval={0}
                angle={-45}
                textAnchor="end"
              />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#5aae6b"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="chart-empty">
            No review candidates available yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardCharts;
