export function InsightsSection({ insights }) {
  const insightItems = [
    { title: 'Highest Spending Category', value: insights.topCategory },
    { title: 'Monthly Comparison', value: insights.monthlyComparison },
    { title: 'Observation', value: insights.netObservation },
  ]

  return (
    <section className="card insights-card">
      <h2>Insights</h2>
      <div className="insight-grid">
        {insightItems.map((item) => (
          <article key={item.title} className="insight-item">
            <h3>{item.title}</h3>
            <p>{item.value}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
