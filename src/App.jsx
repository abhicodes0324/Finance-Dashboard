import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { RoleSwitcher } from './components/RoleSwitcher'
import { SummaryCards } from './components/SummaryCards'
import { ChartsSection } from './components/ChartsSection'
import { TransactionsSection } from './components/TransactionsSection'
import { InsightsSection } from './components/InsightsSection'
import { initialTransactions } from './data/transactions'
import { fetchTransactions } from './services/mockApi'
import {
  calculateSummary,
  getBalanceTrend,
  getSpendingBreakdown,
  getInsights,
} from './utils/dashboard'

const normalizeTransaction = (item, fallbackId) => {
  const date = String(item?.date || '').trim()
  const category = String(item?.category || '').trim()
  const type = String(item?.type || '')
    .trim()
    .toLowerCase()
  const description = String(item?.description || '').trim()
  const amount = Number(item?.amount)

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
  const validType = type === 'income' || type === 'expense'
  if (!validDate || !validType || !category || !Number.isFinite(amount)) {
    return null
  }

  return {
    id: item?.id || fallbackId,
    date,
    amount,
    category,
    type,
    description,
  }
}

const normalizeTransactions = (rows) =>
  rows
    .map((item, idx) => normalizeTransaction(item, `tx-sanitized-${Date.now()}-${idx}`))
    .filter(Boolean)

const ensureUniqueIds = (incoming, existing) => {
  const usedIds = new Set(existing.map((item) => String(item.id)))

  return incoming.map((item, idx) => {
    const baseId = String(item.id || `tx-import-${Date.now()}-${idx}`)
    let nextId = baseId
    let suffix = 1

    while (usedIds.has(nextId)) {
      nextId = `${baseId}-dup-${suffix}`
      suffix += 1
    }

    usedIds.add(nextId)
    return { ...item, id: nextId }
  })
}

const getSavedTransactions = () => {
  const saved = localStorage.getItem('finance_transactions')
  if (!saved) return null
  try {
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) return null
    return normalizeTransactions(parsed)
  } catch {
    localStorage.removeItem('finance_transactions')
    return null
  }
}

function App() {
  const [initialState] = useState(() => {
    const savedTransactions = getSavedTransactions()
    return {
      savedTransactions,
      hasSavedTransactions: savedTransactions !== null,
    }
  })

  const [role, setRole] = useState(() => localStorage.getItem('finance_role') || 'viewer')
  const [theme, setTheme] = useState(() => localStorage.getItem('finance_theme') || 'light')
  const [transactions, setTransactions] = useState(initialState.savedTransactions || [])
  const [isLoading, setIsLoading] = useState(!initialState.hasSavedTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [groupByCategory, setGroupByCategory] = useState(false)

  useEffect(() => {
    if (initialState.hasSavedTransactions) return

    fetchTransactions(initialTransactions)
      .then((data) => {
        setTransactions(data)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [initialState.hasSavedTransactions])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('finance_theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('finance_role', role)
  }, [role])

  useEffect(() => {
    if (!isLoading) {
      const cleaned = normalizeTransactions(transactions)
      localStorage.setItem('finance_transactions', JSON.stringify(cleaned))
    }
  }, [transactions, isLoading])

  const categories = useMemo(() => {
    const all = transactions.map((item) => item.category)
    return [...new Set(all)].sort()
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    let next = [...transactions]

    if (searchTerm.trim()) {
      const needle = searchTerm.toLowerCase()
      next = next.filter((item) =>
        `${item.category} ${item.description}`.toLowerCase().includes(needle),
      )
    }

    if (categoryFilter !== 'all') {
      next = next.filter((item) => item.category === categoryFilter)
    }

    if (typeFilter !== 'all') {
      next = next.filter((item) => item.type === typeFilter)
    }

    if (fromDate) {
      next = next.filter((item) => item.date >= fromDate)
    }

    if (toDate) {
      next = next.filter((item) => item.date <= toDate)
    }

    switch (sortBy) {
      case 'oldest':
        next.sort((a, b) => new Date(a.date) - new Date(b.date))
        break
      case 'highest':
        next.sort((a, b) => b.amount - a.amount)
        break
      case 'lowest':
        next.sort((a, b) => a.amount - b.amount)
        break
      default:
        next.sort((a, b) => new Date(b.date) - new Date(a.date))
    }

    return next
  }, [transactions, searchTerm, categoryFilter, typeFilter, sortBy, fromDate, toDate])

  const groupedTransactions = useMemo(() => {
    const groups = filteredTransactions.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { income: 0, expense: 0, count: 0 }
      }
      acc[item.category][item.type] += item.amount
      acc[item.category].count += 1
      return acc
    }, {})

    return Object.entries(groups)
      .map(([category, details]) => ({
        category,
        ...details,
        net: details.income - details.expense,
      }))
      .sort((a, b) => b.expense - a.expense)
  }, [filteredTransactions])

  const summary = useMemo(
    () => calculateSummary(transactions),
    [transactions],
  )
  const trendData = useMemo(() => getBalanceTrend(transactions), [transactions])
  const spendingData = useMemo(
    () => getSpendingBreakdown(transactions),
    [transactions],
  )
  const insights = useMemo(() => getInsights(transactions), [transactions])

  const handleAddTransaction = (transaction) => {
    const normalized = normalizeTransaction(transaction, `tx-added-${Date.now()}`)
    if (!normalized) return
    setTransactions((current) => [normalized, ...current])
  }

  const handleDeleteTransaction = (transactionId) => {
    setTransactions((current) => current.filter((item) => item.id !== transactionId))
  }

  const handleUpdateTransaction = (updated) => {
    const normalized = normalizeTransaction(updated, updated.id || `tx-updated-${Date.now()}`)
    if (!normalized) return
    setTransactions((current) => current.map((item) => (item.id === normalized.id ? normalized : item)))
  }

  const handleExportJson = () => {
    const payload = JSON.stringify(filteredTransactions, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'transactions-export.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCsv = () => {
    const header = 'date,category,type,description,amount'
    const rows = filteredTransactions.map(
      (item) =>
        `${item.date},"${item.category}","${item.type}","${item.description.replace(/"/g, '""')}",${item.amount}`,
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'transactions-export.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const parseCsvLine = (line) => {
    const cols = []
    let token = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i]
      if (char === '"') {
        const nextChar = line[i + 1]
        if (inQuotes && nextChar === '"') {
          token += '"'
          i += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        cols.push(token)
        token = ''
      } else {
        token += char
      }
    }
    cols.push(token)
    return cols
  }

  const normalizeImported = (rows) =>
    rows
      .map((item, idx) => normalizeTransaction(item, `tx-import-${Date.now()}-${idx}`))
      .filter(Boolean)

  const handleImportJson = async (file) => {
    const text = await file.text()
    const parsed = JSON.parse(text)
    const incoming = Array.isArray(parsed) ? parsed : []
    const normalized = normalizeImported(incoming)
    if (normalized.length) {
      setTransactions((current) => {
        const uniqueImported = ensureUniqueIds(normalized, current)
        return [...uniqueImported, ...current]
      })
    }
  }

  const handleImportCsv = async (file) => {
    const text = await file.text()
    const lines = text.trim().split('\n')
    if (lines.length < 2) return
    const headers = parseCsvLine(lines[0]).map((header) => header.trim())
    const rows = lines.slice(1).map((line) => {
      const values = parseCsvLine(line)
      return headers.reduce((acc, header, index) => {
        acc[header] = values[index]
        return acc
      }, {})
    })
    const normalized = normalizeImported(rows)
    if (normalized.length) {
      setTransactions((current) => {
        const uniqueImported = ensureUniqueIds(normalized, current)
        return [...uniqueImported, ...current]
      })
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Finance Dashboard</p>
          <h1>Financial Activity Overview</h1>
          <p className="subtitle">
            Track income, monitor expenses, and spot spending patterns quickly.
          </p>
        </div>
        <RoleSwitcher
          role={role}
          onRoleChange={setRole}
          theme={theme}
          onThemeChange={setTheme}
        />
      </header>

      {isLoading ? <section className="card loading-card">Loading transactions from mock API...</section> : null}

      <SummaryCards summary={summary} />

      <ChartsSection
        trendData={trendData}
        spendingData={spendingData}
        selectedCategory={categoryFilter}
        onCategorySelect={(category) => setCategoryFilter(category)}
      />

      <TransactionsSection
        role={role}
        transactions={filteredTransactions}
        categories={categories}
        searchTerm={searchTerm}
        categoryFilter={categoryFilter}
        typeFilter={typeFilter}
        sortBy={sortBy}
        fromDate={fromDate}
        toDate={toDate}
        groupByCategory={groupByCategory}
        groupedTransactions={groupedTransactions}
        onSearchTermChange={setSearchTerm}
        onCategoryFilterChange={setCategoryFilter}
        onTypeFilterChange={setTypeFilter}
        onSortByChange={setSortBy}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onGroupByCategoryChange={setGroupByCategory}
        onAddTransaction={handleAddTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        onUpdateTransaction={handleUpdateTransaction}
        onExportCsv={handleExportCsv}
        onExportJson={handleExportJson}
        onImportCsv={handleImportCsv}
        onImportJson={handleImportJson}
      />

      <InsightsSection insights={insights} />
    </main>
  )
}

export default App
