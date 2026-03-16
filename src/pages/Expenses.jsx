import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Plus,
  Trash2,
  Home,
  CreditCard,
  DollarSign,
  PieChart,
  Search,
  Filter,
  Edit2,
} from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";

export default function Expenses() {
  const {
    user,
    businessInfo,
    expenses: allExpenses,
    filteredExpenses: contextFilteredExpenses,
    addExpense,
    deleteExpense,
    updateExpense,
    stats,
  } = useAppContext();
  const expenses = user?.role === "admin" ? allExpenses : contextFilteredExpenses;
  const [isModalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState("All");

  const filteredExpenses = React.useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        (e.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (e.category?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesStore = storeFilter === "All" || e.storeId === storeFilter;
      return matchesSearch && matchesStore;
    });
  }, [expenses, searchTerm, storeFilter]);

  // Deletion Alert State
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) deleteExpense(deleteId);
    setDeleteModalOpen(false);
  };

  // Form State
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Operating");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [editingExpense, setEditingExpense] = useState(null);

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setTitle(expense.title);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setNotes(expense.notes || "");
    setDate(new Date(expense.date).toISOString().split("T")[0]);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
    setTitle("");
    setAmount("");
    setCategory("Operating");
    setNotes("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    if (editingExpense) {
      updateExpense({
        ...editingExpense,
        title,
        amount: parseFloat(amount),
        category,
        notes,
        date: new Date(date).toISOString(),
      });
    } else {
      addExpense({
        title,
        amount: parseFloat(amount),
        category,
        notes,
        date: new Date(date).toISOString(),
      });
    }

    handleCloseModal();
  };

  return (
    <div className="animate-fade-in">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "4px",
            }}
          >
            {user?.role === "admin" ? (
              <span
                className="badge"
                style={{
                  background: "var(--primary)",
                  color: "white",
                  fontSize: "0.6rem",
                  padding: "2px 8px",
                }}
              >
                CAPEX & OPEX
              </span>
            ) : (
              <span
                className="badge"
                style={{
                  background: "var(--success)",
                  color: "white",
                  fontSize: "0.6rem",
                  padding: "2px 8px",
                }}
              >
                STORE OVERHEADS
              </span>
            )}
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "var(--text-main)",
            }}
          >
            {user?.role === "admin"
              ? "Indirect Cashflow Expenses"
              : "Store Operating Costs"}
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              marginTop: "4px",
            }}
          >
            {user?.role === "admin"
              ? "Monitoring rent, utilities, and payroll across the network"
              : "Manage daily store utilities, local expenses and small petty cash"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="search-bar" style={{ width: "280px" }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => { setEditingExpense(null); setModalOpen(true); }}>
            <Plus size={18} /> Log Expense
          </button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="stat-card glass-panel">
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Total Monthly Burn
            </span>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginTop: "8px",
                color: "var(--text-main)",
              }}
            >
              {businessInfo.currency}{stats.expenseTotal.toFixed(2)}
            </div>
          </div>
          <div
            className="stat-icon"
            style={{
              background: "var(--bg-card-hover)",
              color: "var(--text-muted)",
            }}
          >
            <CreditCard size={24} />
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Business Net Margin
            </span>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginTop: "8px",
                color: "var(--primary)",
              }}
            >
              {businessInfo.currency}{stats.netProfit.toFixed(2)}
            </div>
          </div>
          <div
            className="stat-icon"
            style={{
              background: "var(--primary-glow)",
              color: "var(--primary)",
            }}
          >
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "24px" }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Notes</th>
              <th style={{ textAlign: "right" }}>Amount</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-muted)",
                  }}
                >
                  No expenses recorded this period.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((e) => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td style={{ fontWeight: "600" }}>{e.title}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: "var(--bg-card-hover)",
                        color: "var(--text-main)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {e.category}
                    </span>
                  </td>
                  <td
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    {e.notes || "-"}
                  </td>
                  <td style={{ fontWeight: "700", color: "var(--text-main)", textAlign: "right" }}>
                    {businessInfo.currency}
                    {e.amount.toFixed(2)}
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: "24px", justifyContent: "flex-end", paddingRight: "8px" }}>
                      <button
                        onClick={() => openEditModal(e)}
                        style={{
                          color: "var(--text-muted)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center"
                        }}
                        className="action-hover-primary"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(e.id)}
                        style={{
                          color: "var(--text-muted)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center"
                        }}
                        className="action-hover-danger"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <div className="modal-header">
              <h2>{editingExpense ? "Edit Expense" : "Log New Expense"}</h2>
              <button
                className="close-btn"
                onClick={handleCloseModal}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={24} style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Expense Date</label>
                <input
                  type="date"
                  className="input-control"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Expense Title</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Shop Rent - March"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select
                  className="input-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Operating">Operating</option>
                  <option value="Salary">Salary</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="input-group">
                <label>Amount ({businessInfo.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-control"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <label>Notes (Optional)</label>
                <textarea
                  className="input-control"
                  style={{ minHeight: "80px" }}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
              </div>
              <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                   onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {editingExpense ? "Update Expense" : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Expense Record?"
        message="Are you sure you want to remove this expense entry? This action cannot be undone."
        confirmText="Delete Now"
      />
    </div>
  );
}
