const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

export const calculateSummary = (transactions) => {
  const income = transactions
    .filter((item) => item.type === 'income')
    .reduce((total, item) => total + item.amount, 0)

  const expenses = transactions
    .filter((item) => item.type === 'expense')
    .reduce((total, item) => total + item.amount, 0)

  return {
    income,
    expenses,
    totalBalance: income - expenses,
  }
}

export const getBalanceTrend = (transactions) => {
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date))
  let runningBalance = 0

  return sorted.map((item) => {
    runningBalance += item.type === 'income' ? item.amount : -item.amount
    const dateObj = new Date(item.date)
    return {
      label: `${MONTHS[dateObj.getMonth()]} ${dateObj.getDate()}`,
      balance: runningBalance,
    }
  })
}

export const getSpendingBreakdown = (transactions) => {
  const grouped = transactions
    .filter((item) => item.type === 'expense')
    .reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount
      return acc
    }, {})

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export const getInsights = (transactions) => {
  const expensesByCategory = getSpendingBreakdown(transactions)
  const topCategory = expensesByCategory[0]

  const monthly = transactions.reduce((acc, item) => {
    const dateObj = new Date(item.date)
    const key = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`
    if (!acc[key]) {
      acc[key] = { income: 0, expense: 0, label: `${MONTHS[dateObj.getMonth()]} ${dateObj.getFullYear()}` }
    }
    acc[key][item.type] += item.amount
    return acc
  }, {})

  const monthData = Object.values(monthly).sort((a, b) => a.label.localeCompare(b.label))
  const latest = monthData[monthData.length - 1]
  const previous = monthData[monthData.length - 2]

  const monthlyDiff = latest && previous ? latest.expense - previous.expense : 0
  const monthlyDiffText =
    !latest || !previous
      ? 'Not enough data for month-over-month comparison.'
      : monthlyDiff > 0
        ? `Expenses are up by ${formatCurrency(monthlyDiff)} compared to last month.`
        : `Expenses are down by ${formatCurrency(Math.abs(monthlyDiff))} compared to last month.`

  return {
    topCategory: topCategory
      ? `${topCategory.name} is the highest spending category at ${formatCurrency(topCategory.value)}.`
      : 'No expense transactions available yet.',
    monthlyComparison: monthlyDiffText,
    netObservation:
      calculateSummary(transactions).totalBalance >= 0
        ? 'Your net balance is positive. Keep monitoring discretionary spending.'
        : 'Your net balance is negative. Consider reducing non-essential expenses.',
  }
}
