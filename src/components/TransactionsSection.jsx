import { useRef, useState } from 'react'
import { formatCurrency } from '../utils/dashboard'

const today = new Date().toISOString().slice(0, 10)

const defaultForm = {
  date: today,
  amount: '',
  category: '',
  type: 'expense',
  description: '',
}

export function TransactionsSection({
  role,
  transactions,
  categories,
  searchTerm,
  categoryFilter,
  typeFilter,
  sortBy,
  fromDate,
  toDate,
  groupByCategory,
  onSearchTermChange,
  onCategoryFilterChange,
  onTypeFilterChange,
  onSortByChange,
  onFromDateChange,
  onToDateChange,
  onGroupByCategoryChange,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
  onExportCsv,
  onExportJson,
  onImportCsv,
  onImportJson,
}) {
  const [form, setForm] = useState(defaultForm)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(defaultForm)
  const csvInputRef = useRef(null)
  const jsonInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    const amount = Number(form.amount)

    if (!form.category.trim() || !form.description.trim() || !amount) {
      return
    }

    onAddTransaction({
      id: `tx-${Date.now()}`,
      date: form.date,
      amount,
      category: form.category.trim(),
      type: form.type,
      description: form.description.trim(),
    })

    setForm(defaultForm)
  }

  const handleEditStart = (item) => {
    setEditingId(item.id)
    setEditForm({
      date: item.date,
      amount: item.amount,
      category: item.category,
      type: item.type,
      description: item.description,
    })
  }

  const handleEditSave = () => {
    const amount = Number(editForm.amount)
    if (!editForm.category.trim() || !editForm.description.trim() || !amount) {
      return
    }
    onUpdateTransaction({
      id: editingId,
      date: editForm.date,
      amount,
      category: editForm.category.trim(),
      type: editForm.type,
      description: editForm.description.trim(),
    })
    setEditingId(null)
  }

  const handleImportChange = async (event, parser) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      await parser(file)
    } catch {
      // Ignore malformed import files to keep UI simple.
    }
    event.target.value = ''
  }

  const validTransactions = transactions.filter(
    (item) =>
      item &&
      typeof item.category === 'string' &&
      typeof item.type === 'string' &&
      Number.isFinite(Number(item.amount)),
  )

  const safeGroupedTransactions = validTransactions
    .reduce((acc, item) => {
      const category = item.category.trim()
      const type = item.type.trim().toLowerCase()
      const amount = Number(item.amount)

      if (!category || (type !== 'income' && type !== 'expense')) {
        return acc
      }

      if (!acc[category]) {
        acc[category] = { category, count: 0, income: 0, expense: 0, net: 0 }
      }

      acc[category].count += 1
      acc[category][type] += amount
      acc[category].net = acc[category].income - acc[category].expense
      return acc
    }, {})

  const validGroupedTransactions = Object.values(safeGroupedTransactions).sort(
    (a, b) => b.expense - a.expense,
  )

  return (
    <section className="card transactions-card">
      <div className="section-heading">
        <h2>Transactions</h2>
        <div className="actions-row">
          <button type="button" onClick={onExportCsv}>
            Export CSV
          </button>
          <button type="button" onClick={onExportJson}>
            Export JSON
          </button>
          <button type="button" onClick={() => csvInputRef.current?.click()}>
            Import CSV
          </button>
          <button type="button" onClick={() => jsonInputRef.current?.click()}>
            Import JSON
          </button>
        </div>
      </div>
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden-file-input"
        onChange={(event) => handleImportChange(event, onImportCsv)}
      />
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden-file-input"
        onChange={(event) => handleImportChange(event, onImportJson)}
      />

      <div className="filter-row">
        <input
          type="search"
          value={searchTerm}
          placeholder="Search category or note"
          onChange={(e) => onSearchTermChange(e.target.value)}
        />

        <select value={categoryFilter} onChange={(e) => onCategoryFilterChange(e.target.value)}>
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select value={typeFilter} onChange={(e) => onTypeFilterChange(e.target.value)}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select value={sortBy} onChange={(e) => onSortByChange(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>

        <div className="date-input-wrapper">
          <label htmlFor="from-date" className="date-label">From</label>
          <input
            id="from-date"
            type="date"
            value={fromDate}
            aria-label="From date"
            onChange={(e) => onFromDateChange(e.target.value)}
          />
        </div>

        <div className="date-input-wrapper">
          <label htmlFor="to-date" className="date-label">To</label>
          <input
            id="to-date"
            type="date"
            value={toDate}
            aria-label="To date"
            onChange={(e) => onToDateChange(e.target.value)}
          />
        </div>

        <label className="check-label">
          <input
            type="checkbox"
            checked={groupByCategory}
            onChange={(e) => onGroupByCategoryChange(e.target.checked)}
          />
          Group by category
        </label>
      </div>

      {role === 'admin' ? (
        <form className="admin-form" onSubmit={handleSubmit}>
          <h3>Add Transaction (Admin)</h3>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
          <input
            type="number"
            min="1"
            value={form.amount}
            placeholder="Amount"
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
          />
          <input
            type="text"
            value={form.category}
            placeholder="Category"
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          />
          <input
            type="text"
            value={form.description}
            placeholder="Description"
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <select
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          <button type="submit">Add</button>
        </form>
      ) : null}

      <div className="table-wrap">
        {groupByCategory && validGroupedTransactions.length ? (
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Transactions</th>
                <th>Income</th>
                <th>Expenses</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {validGroupedTransactions.map((item) => (
                <tr key={item.category}>
                  <td>{item.category}</td>
                  <td>{item.count}</td>
                  <td className="amt-income">{formatCurrency(item.income)}</td>
                  <td className="amt-expense">{formatCurrency(item.expense)}</td>
                  <td className={item.net >= 0 ? 'amt-income' : 'amt-expense'}>
                    {formatCurrency(item.net)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : groupByCategory ? (
          <p className="empty-state">No grouped results for current filters.</p>
        ) : transactions.length ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                {role === 'admin' ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.id}>
                  {editingId === item.id ? (
                    <>
                      <td>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, date: e.target.value }))}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, category: e.target.value }))
                          }
                        />
                      </td>
                      <td>
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, type: e.target.value }))}
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={editForm.amount}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                        />
                      </td>
                      <td>
                        <div className="row-actions">
                          <button type="button" onClick={handleEditSave}>
                            Save
                          </button>
                          <button type="button" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{item.date}</td>
                      <td>{item.category}</td>
                      <td>
                        <span className={`pill ${item.type}`}>{item.type}</span>
                      </td>
                      <td>{item.description}</td>
                      <td className={item.type === 'income' ? 'amt-income' : 'amt-expense'}>
                        {item.type === 'expense' ? '-' : '+'}
                        {formatCurrency(item.amount)}
                      </td>
                      {role === 'admin' ? (
                        <td>
                          <div className="row-actions">
                            <button type="button" onClick={() => handleEditStart(item)}>
                              Edit
                            </button>
                            <button type="button" onClick={() => onDeleteTransaction(item.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No transactions match your current filters.</p>
        )}
      </div>
    </section>
  )
}
