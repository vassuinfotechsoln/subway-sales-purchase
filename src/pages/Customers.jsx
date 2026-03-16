import React, { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Search,
  User,
  Mail,
  Phone,
} from "lucide-react";

export default function Customers() {
  const { user, sales, businessInfo } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Group sales by customer to get stats
  const customerStats = useMemo(() => {
    const clients = {};
    sales.forEach((s) => {
      const name = s.customer || "Guest";
      if (!clients[name]) {
        clients[name] = {
          name,
          totalSpent: 0,
          orderCount: 0,
          lastOrder: s.date,
          avgOrderValue: 0,
        };
      }
      clients[name].totalSpent += s.amount;
      clients[name].orderCount += 1;
      if (new Date(s.date) > new Date(clients[name].lastOrder)) {
        clients[name].lastOrder = s.date;
      }
    });

    return Object.values(clients)
      .map((c) => ({
        ...c,
        avgOrderValue: c.totalSpent / c.orderCount,
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [sales]);

  const filteredCustomers = customerStats.filter((c) =>
    (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()),
  );

  const totalCustomers = customerStats.length;
  const highValueCustomers = customerStats.filter(
    (c) => c.totalSpent > 100,
  ).length;

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
                MARKET ANALYSIS
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
                GUEST LOYALTY
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
              ? "CRM & Customer Demographics"
              : "Guest Relations & Orders"}
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              marginTop: "4px",
            }}
          >
            {user?.role === "admin"
              ? "Analyzing network-wide consumer behavior and retention"
              : "View your regular guests and their recent visit frequency"}
          </p>
        </div>
        <div className="search-bar" style={{ width: "300px" }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="stat-card glass-panel">
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Total Customer Base
            </span>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginTop: "8px",
              }}
            >
              {totalCustomers} Customers
            </div>
          </div>
          <div className="icon-primary stat-icon">
            <Users size={24} />
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              High-Value (Loyal)
            </span>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginTop: "8px",
                color: "var(--success)",
              }}
            >
              {highValueCustomers} Members
            </div>
          </div>
          <div className="icon-success stat-icon">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Total Sales (Lifetime)
            </span>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginTop: "8px",
              }}
            >
              {businessInfo.currency}{customerStats.reduce((a, b) => a + b.totalSpent, 0).toFixed(2)}
            </div>
          </div>
          <div className="icon-warning stat-icon">
            < ShoppingBag size={24} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "24px" }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Customer Identity</th>
              <th>Total Spent</th>
              <th>Visits</th>
              <th>Avg. Ticket</th>
              <th>Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "var(--text-muted)",
                  }}
                >
                  No customer data available yet.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c, i) => (
                <tr key={i}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "var(--primary-glow)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--primary)",
                        }}
                      >
                        <User size={18} />
                      </div>
                      <div style={{ fontWeight: "700" }}>{c.name}</div>
                    </div>
                  </td>
                  <td style={{ fontWeight: "700" }}>
                    {businessInfo.currency}{c.totalSpent.toFixed(2)}
                  </td>
                  <td>{c.orderCount} Orders</td>
                  <td>{businessInfo.currency}{c.avgOrderValue.toFixed(2)}</td>
                  <td
                    style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}
                  >
                    {new Date(c.lastOrder).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
