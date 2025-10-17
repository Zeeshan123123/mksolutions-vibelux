"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Invoice = {
  id: string
  number: string
  status: string
  issueDate: string
  dueDate?: string | null
  customer?: string | null
  currency: string
  total: number
  payments?: { amount: number }[]
}

export default function FinanceDashboardPage() {
  const [facilityId, setFacilityId] = useState('')
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [budgets, setBudgets] = useState<any[]>([])
  const [cashflow, setCashflow] = useState<{ month: string; cashIn: number; billedOut: number } | null>(null)
  const [pl, setPl] = useState<{ month: string; revenue: number; expenses: number; net: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [newInv, setNewInv] = useState<{ number: string; customer?: string; dueDate?: string; currency?: string; lines: { description: string; quantity: number; unitPrice: number }[] }>({ number: '', customer: '', dueDate: '', currency: 'USD', lines: [{ description: '', quantity: 1, unitPrice: 0 }] })
  const [newBudget, setNewBudget] = useState<{ category: string; amount: number }>({ category: '', amount: 0 })
  const [newJE, setNewJE] = useState<{ debitAcct: string; debitType?: string; creditAcct: string; creditType?: string; amount: number; memo?: string }>({ debitAcct: '', debitType: 'expense', creditAcct: '', creditType: 'revenue', amount: 0, memo: '' })

  const loadAll = async () => {
    if (!facilityId) return
    setLoading(true)
    try {
      const [invRes, payRes, budRes, cfRes] = await Promise.all([
        fetch(`/api/finance/invoices?facilityId=${facilityId}`),
        fetch(`/api/finance/payments?facilityId=${facilityId}`),
        fetch(`/api/finance/budgets?facilityId=${facilityId}&periodMonth=${month}`),
        fetch(`/api/finance/reports/cashflow?facilityId=${facilityId}&month=${month}`)
      ])
      setInvoices(await invRes.json())
      setPayments(await payRes.json())
      setBudgets(await budRes.json())
      const [cf, plRes] = await Promise.all([
        cfRes.json(),
        fetch(`/api/finance/reports/pl?facilityId=${facilityId}&month=${month}`).then(r => r.json())
      ])
      setCashflow(cf)
      setPl(plRes)
    } finally {
      setLoading(false)
    }
  }

  const totalUnpaid = useMemo(() => {
    return invoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0)
  }, [invoices])

  const addInvoiceLine = () => {
    setNewInv(prev => ({ ...prev, lines: [...prev.lines, { description: '', quantity: 1, unitPrice: 0 }] }))
  }

  const saveInvoice = async () => {
    if (!facilityId || !newInv.number || newInv.lines.length === 0) return
    await fetch('/api/finance/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId,
        number: newInv.number,
        customer: newInv.customer || undefined,
        dueDate: newInv.dueDate || undefined,
        currency: newInv.currency || 'USD',
        lines: newInv.lines
      })
    })
    setNewInv({ number: '', customer: '', dueDate: '', currency: 'USD', lines: [{ description: '', quantity: 1, unitPrice: 0 }] })
    await loadAll()
  }

  const saveBudget = async () => {
    if (!facilityId || !month || !newBudget.category) return
    await fetch('/api/finance/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId,
        periodMonth: month,
        category: newBudget.category,
        amount: Number(newBudget.amount)
      })
    })
    setNewBudget({ category: '', amount: 0 })
    await loadAll()
  }

  const postJournal = async () => {
    if (!facilityId || !newJE.debitAcct || !newJE.creditAcct || !(newJE.amount > 0)) return
    await fetch('/api/finance/journals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        facilityId,
        memo: newJE.memo || undefined,
        debit: { accountName: newJE.debitAcct, type: newJE.debitType, amount: Number(newJE.amount) },
        credit: { accountName: newJE.creditAcct, type: newJE.creditType, amount: Number(newJE.amount) },
      })
    })
    setNewJE({ debitAcct: '', debitType: 'expense', creditAcct: '', creditType: 'revenue', amount: 0, memo: '' })
    await loadAll()
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Finance Dashboard</h1>
          <p className="text-gray-400">Track invoices, payments, budgets and cash flow.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 outline-none"
            placeholder="Facility ID"
            value={facilityId}
            onChange={(e) => setFacilityId(e.target.value)}
          />
          <input
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 outline-none"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
          <button
            onClick={loadAll}
            className="bg-purple-600 hover:bg-purple-700 rounded-lg px-4 py-2 disabled:opacity-50"
            disabled={!facilityId || loading}
          >
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>

        {cashflow && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-sm">Cash In ({cashflow.month})</div>
              <div className="text-2xl font-bold">${cashflow.cashIn.toFixed(2)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-sm">Billed Out ({cashflow.month})</div>
              <div className="text-2xl font-bold">${cashflow.billedOut.toFixed(2)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-sm">Unpaid Invoices</div>
              <div className="text-2xl font-bold">${totalUnpaid.toFixed(2)}</div>
            </div>
          </div>
        )}
        {pl && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-sm">Revenue ({pl.month})</div>
              <div className="text-2xl font-bold">${pl.revenue.toFixed(2)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-sm">Expenses ({pl.month})</div>
              <div className="text-2xl font-bold">${pl.expenses.toFixed(2)}</div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-gray-400 text-sm">Net</div>
              <div className={`text-2xl font-bold ${pl.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>${pl.net.toFixed(2)}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Invoices</h2>
              <Link href="/docs" className="text-sm text-gray-400 hover:text-white">Docs</Link>
            </div>
            {/* Quick Create Invoice */}
            <div className="bg-gray-800/50 rounded-lg p-3 mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Number" value={newInv.number} onChange={(e) => setNewInv(v => ({ ...v, number: e.target.value }))} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Customer" value={newInv.customer} onChange={(e) => setNewInv(v => ({ ...v, customer: e.target.value }))} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="date" placeholder="Due Date" value={newInv.dueDate} onChange={(e) => setNewInv(v => ({ ...v, dueDate: e.target.value }))} />
              <div className="md:col-span-3 space-y-2">
                {newInv.lines.map((l, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <input className="col-span-6 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Description" value={l.description} onChange={(e) => {
                      const v = e.target.value; setNewInv(prev => ({ ...prev, lines: prev.lines.map((x, i) => i === idx ? { ...x, description: v } : x) }))
                    }} />
                    <input className="col-span-2 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="number" step="0.01" placeholder="Qty" value={l.quantity} onChange={(e) => {
                      const v = Number(e.target.value); setNewInv(prev => ({ ...prev, lines: prev.lines.map((x, i) => i === idx ? { ...x, quantity: v } : x) }))
                    }} />
                    <input className="col-span-2 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="number" step="0.01" placeholder="Unit Price" value={l.unitPrice} onChange={(e) => {
                      const v = Number(e.target.value); setNewInv(prev => ({ ...prev, lines: prev.lines.map((x, i) => i === idx ? { ...x, unitPrice: v } : x) }))
                    }} />
                    <div className="col-span-2 text-right text-sm text-gray-300 pt-1">${(l.quantity * l.unitPrice).toFixed(2)}</div>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <button className="text-xs text-gray-400 hover:text-white" onClick={addInvoiceLine}>+ Add line</button>
                  <button className="bg-purple-600 hover:bg-purple-700 rounded px-3 py-1 text-sm" onClick={saveInvoice} disabled={!facilityId || !newInv.number}>Save Invoice</button>
                </div>
              </div>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                  <div>
                    <div className="font-medium">{inv.number} <span className="text-xs px-2 py-0.5 bg-gray-700 rounded ml-2">{inv.status}</span></div>
                    <div className="text-xs text-gray-400">Issue {new Date(inv.issueDate).toLocaleDateString()} • Due {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{inv.currency} {inv.total.toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && (<div className="text-sm text-gray-500">No invoices</div>)}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Payments</h2>
              <Link href="/docs" className="text-sm text-gray-400 hover:text-white">Docs</Link>
            </div>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {payments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                  <div>
                    <div className="font-medium">{p.method?.toUpperCase() || 'OTHER'}</div>
                    <div className="text-xs text-gray-400">{new Date(p.receivedAt).toLocaleString()} {p.reference && `• ${p.reference}`}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{p.currency} {Number(p.amount).toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {payments.length === 0 && (<div className="text-sm text-gray-500">No payments</div>)}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Budget ({month})</h2>
              <Link href="/docs" className="text-sm text-gray-400 hover:text-white">Docs</Link>
            </div>
            {/* Quick Upsert Budget */}
            <div className="bg-gray-800/50 rounded-lg p-3 mb-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Category (e.g., Electricity)" value={newBudget.category} onChange={(e) => setNewBudget({ ...newBudget, category: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="number" step="0.01" placeholder="Amount" value={newBudget.amount} onChange={(e) => setNewBudget({ ...newBudget, amount: Number(e.target.value) })} />
              <button className="bg-purple-600 hover:bg-purple-700 rounded px-3 py-1 text-sm" onClick={saveBudget} disabled={!facilityId || !month || !newBudget.category}>Save Budget</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {budgets.map((b: any) => (
                <div key={`${b.category}`} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-sm text-gray-400">{b.category}</div>
                  <div className="text-xl font-semibold">${Number(b.amount).toFixed(2)}</div>
                </div>
              ))}
              {budgets.length === 0 && (<div className="text-sm text-gray-500">No budget rows</div>)}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Post Journal Entry</h2>
              <Link href="/docs" className="text-sm text-gray-400 hover:text-white">Docs</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Debit Account (e.g., Electricity Expense)" value={newJE.debitAcct} onChange={(e) => setNewJE({ ...newJE, debitAcct: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Debit Type" value={newJE.debitType} onChange={(e) => setNewJE({ ...newJE, debitType: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Credit Account (e.g., Product Sales)" value={newJE.creditAcct} onChange={(e) => setNewJE({ ...newJE, creditAcct: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Credit Type" value={newJE.creditType} onChange={(e) => setNewJE({ ...newJE, creditType: e.target.value })} />
              <input className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" type="number" step="0.01" placeholder="Amount" value={newJE.amount} onChange={(e) => setNewJE({ ...newJE, amount: Number(e.target.value) })} />
              <input className="md:col-span-4 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm" placeholder="Memo (optional)" value={newJE.memo} onChange={(e) => setNewJE({ ...newJE, memo: e.target.value })} />
              <div className="text-right md:col-span-5">
                <button className="bg-purple-600 hover:bg-purple-700 rounded px-3 py-1 text-sm" onClick={postJournal} disabled={!facilityId || !newJE.debitAcct || !newJE.creditAcct || !(newJE.amount > 0)}>Post Journal</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


