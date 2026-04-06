import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '../utils/dashboard'

const COLORS = ['#60a5fa', '#38bdf8', '#818cf8', '#22c55e', '#f59e0b', '#f97316', '#ef4444']

export function ChartsSection({
  theme,
  trendData,
  spendingData,
  selectedCategory,
  onCategorySelect,
}) {
  const isDarkMode = theme === 'dark'
  const axisColor = isDarkMode ? '#e2e8f0' : '#64748b'
  const gridColor = isDarkMode ? '#334155' : '#e5e7eb'
  const tooltipStyle = {
    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
    border: `1px solid ${gridColor}`,
    color: isDarkMode ? '#dbeafe' : '#1e293b',
    borderRadius: '0.75rem',
  }

  return (
    <section className="charts-grid">
      <article className="card chart-card">
        <h2>Balance Trend</h2>
        <div className="chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trendData} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
              <YAxis
                tickFormatter={formatCurrency}
                stroke={axisColor}
                tick={{ fill: axisColor, fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => formatCurrency(value)}
                contentStyle={tooltipStyle}
                labelStyle={{ color: axisColor }}
              />
              <Area type="monotone" dataKey="balance" stroke="#2563eb" fill="url(#balanceGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="card chart-card">
        <div className="section-heading">
          <h2>Spending Breakdown</h2>
          {selectedCategory !== 'all' ? (
            <button type="button" onClick={() => onCategorySelect('all')}>
              Clear Category Filter
            </button>
          ) : null}
        </div>
        <div className="chart-wrap">
          {spendingData.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={spendingData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={96}
                  onClick={(payload) => onCategorySelect(payload.name)}
                >
                  {spendingData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={selectedCategory === 'all' || selectedCategory === entry.name ? 1 : 0.3}
                    />
                  ))}
                </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: axisColor }}
                  />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-state">No expense data available.</p>
          )}
          <p className="chart-hint">Tip: click a pie slice to filter transactions by category.</p>
        </div>
      </article>
    </section>
  )
}
