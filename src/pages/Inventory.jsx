import React, { useState, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { Archive, AlertTriangle, Box, Search, Filter } from "lucide-react";

export default function Inventory() {
  const {
    user,
    inventory: allInventory,
    filteredInventory,
    businessInfo,
    selectedStore,
    stores,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState(selectedStore?.id === 'ALL' ? 'All' : 'Selected');

  // Sync with global selectedStore
  React.useEffect(() => {
    if (selectedStore?.id === 'ALL') {
      setStoreFilter('All');
    } else {
      setStoreFilter('Selected');
    }
  }, [selectedStore]);

  const lowStockThreshold = 20;

  const displayInventory = useMemo(() => {
    let base =
      storeFilter === "All" && user?.role === "admin"
        ? allInventory
        : filteredInventory;

    return base.filter(
      (item) =>
        (item.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        String(item.id || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [allInventory, filteredInventory, searchTerm, storeFilter, user]);

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
                ASSET MANAGEMENT
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
                STOCK CONTROL
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
              ? "Inventory Assets & Valuation"
              : "Raw Material Inventory"}
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              marginTop: "4px",
            }}
          >
            {user?.role === "admin"
              ? "Monitoring capital tied in stock and expiry risks"
              : "Real-time batch tracking and expiry management (FEFO)"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <div className="search-bar" style={{ width: "280px" }}>
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {user?.role === "admin" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Filter size={14} style={{ color: "var(--text-muted)" }} />
              <select
                className="input-control"
                style={{
                  width: "150px",
                  padding: "4px 8px",
                  fontSize: "0.8rem",
                }}
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
              >
                <option value="Selected">Selected Store</option>
                <option value="All">All Stores</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div className="stat-card glass-panel" style={{ padding: "20px" }}>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Categorized Materials
            </span>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginTop: "8px",
              }}
            >
              {displayInventory.length} Items
            </div>
          </div>
          <div className="icon-primary stat-icon">
            <Box size={24} />
          </div>
        </div>

        <div className="stat-card glass-panel" style={{ padding: "20px" }}>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Active Inventory Alerts
            </span>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginTop: "8px",
                color: "var(--text-main)",
              }}
            >
              {
                displayInventory.filter((i) => i.totalStock < lowStockThreshold)
                  .length
              }{" "}
              Low Stock
            </div>
          </div>
          <div
            className="stat-icon"
            style={{
              background: "var(--bg-card-hover)",
              color: "var(--text-muted)",
            }}
          >
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "24px" }}>
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            marginBottom: "20px",
          }}
        >
          Stock vs Batches Overview
        </h3>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Material Name</th>
              {user?.role === "admin" && storeFilter === "All" && (
                <th>Store</th>
              )}
              <th>Unit</th>
              <th>Total Stock</th>
              <th>Active Batches Details (FEFO)</th>
              <th>Cost/Unit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {displayInventory.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: "700" }}>{item.name}</td>
                {user?.role === "admin" && storeFilter === "All" && (
                  <td>
                    {stores.find((s) => s.id === item.storeId)?.name || "N/A"}
                  </td>
                )}
                <td>{item.unit}</td>
                <td style={{ fontWeight: "700", fontSize: "1.1rem" }}>
                  {Math.round(item.totalStock)}
                </td>
                <td style={{ fontSize: "0.85rem" }}>
                  {item.batches.map((b, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        background: "var(--bg-card)",
                        padding: "4px 8px",
                        marginBottom: "4px",
                        borderRadius: "4px",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      <span>{b.batchNo}</span>
                      <span style={{ color: "var(--text-muted)" }}>
                        Expiry: {b.expiry}
                      </span>
                      <span style={{ fontWeight: "600" }}>
                        {Math.round(b.qty)} {item.unit}
                      </span>
                    </div>
                  ))}
                </td>
                <td>
                  {businessInfo.currency}
                  {item.pricePerUnit.toFixed(2)}
                </td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background:
                        item.totalStock < lowStockThreshold
                          ? "var(--primary-glow)"
                          : "var(--bg-card-hover)",
                      color:
                        item.totalStock < lowStockThreshold
                          ? "var(--primary)"
                          : "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {item.totalStock < lowStockThreshold
                      ? "Needs Reorder"
                      : "Healthy"}
                  </span>
                </td>
              </tr>
            ))}
            {displayInventory.length === 0 && (
              <tr>
                <td
                  colSpan={
                    user?.role === "admin" && storeFilter === "All" ? "7" : "6"
                  }
                  style={{ textAlign: "center", padding: "32px" }}
                >
                  No materials matching search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
