import { formatCurrency } from '../utils/dashboard'

export function SummaryCards({ summary }) {
  const cards = [
    { label: 'Total Balance', value: summary.totalBalance, className: summary.totalBalance >= 0 ? 'pos' : 'neg' },
    { label: 'Income', value: summary.income, className: 'pos' },
    { label: 'Expenses', value: summary.expenses, className: 'neg' },
  ]

  return (
    <section className="summary-grid">
      {cards.map((card) => (
        <article key={card.label} className="card summary-card">
          <p className="summary-label">{card.label}</p>
          <p className={`summary-value ${card.className}`}>{formatCurrency(card.value)}</p>
        </article>
      ))}
    </section>
  )
}
