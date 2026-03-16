import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Bell,
  Settings,
  Search,
  User,
  Box,
  Trash2,
  LogOut,
  Menu,
  X,
  CreditCard,
  PieChart,
  Users,
  Sun,
  Moon,
  Activity,
  MapPin,
  Store,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import ConfirmDialog from "./ConfirmDialog";
import CommandCenter from "./CommandCenter";
import "./Layout.css";

export default function Layout() {
  const {
    user,
    logout,
    notifications,
    businessInfo,
    theme,
    toggleTheme,
    inventory,
    purchases,
    sales,
    expenses,
    menuItems,
    vendors,
    wastage,
    dismissNotification,
    clearAllNotifications,
    stores,
    selectedStore,
    setSelectedStore,
  } = useAppContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Global Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Close search results on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".search-container")) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];
    const lowerQuery = query.toLowerCase();

    // 1. Search Inventory
    inventory?.forEach((item) => {
      if (item.name?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "Inventory",
          id: item.id,
          name: item.name,
          link: "/inventory",
        });
      }
    });

    // 2. Search Purchases (PO ID or Vendor Name via vendorId mapping)
    purchases?.forEach((po) => {
      const vendor = vendors.find((v) => v.id === po.vendorId);
      if (
        po.id?.toLowerCase().includes(lowerQuery) ||
        vendor?.name?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "Purchase",
          id: po.id,
          name: `${po.id} - ${vendor?.name || "Unknown"}`,
          link: `/purchases`,
        });
      }
    });

    // 3. Search Vendors (direct entries)
    vendors?.forEach((v) => {
      if (
        v.name?.toLowerCase().includes(lowerQuery) ||
        v.contact?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "Vendor",
          id: v.id,
          name: v.name,
          link: "/purchases",
        });
      }
    });

    // 4. Search Sales (Invoice ID or Customer Name)
    sales?.forEach((sale) => {
      if (
        sale.id?.toLowerCase().includes(lowerQuery) ||
        sale.customer?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "Sale",
          id: sale.id,
          name: `Invoice ${sale.id} - ${sale.customer}`,
          link: "/sales",
        });
      }
    });

    // 5. Search Menu Items (POS items)
    menuItems?.forEach((item) => {
      if (
        item.name?.toLowerCase().includes(lowerQuery) ||
        item.category?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "Menu Item",
          id: item.id,
          name: item.name,
          link: "/sales",
        });
      }
    });

    // 6. Search Expenses
    expenses?.forEach((exp) => {
      if (
        exp.title?.toLowerCase().includes(lowerQuery) ||
        exp.category?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "Expense",
          id: exp.id,
          name: exp.title,
          link: "/expenses",
        });
      }
    });

    // 7. Search Wastage
    wastage?.forEach((w) => {
      if (
        w.name?.toLowerCase().includes(lowerQuery) ||
        w.id?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "Wastage",
          id: w.id,
          name: w.name,
          link: "/wastage",
        });
      }
    });

    // 8. Search Stores
    stores?.forEach((s) => {
      if (
        s.name?.toLowerCase().includes(lowerQuery) ||
        s.location?.toLowerCase().includes(lowerQuery)
      ) {
        results.push({
          type: "Store",
          id: s.id,
          name: s.name,
          link: "/analytics",
        });
      }
    });

    setSearchResults(results.slice(0, 10)); // Top 10 results
    setShowSearchResults(true);
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    navigate("/login");
  };

  const triggerLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigateToResult = (link) => {
    setShowSearchResults(false);
    setSearchTerm("");
    navigate(link);
  };

  return (
    <div className="app-container">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="brand">
          <img
            src="/vassu-logo.jpg"
            alt="Vassu InfoTech Logo"
            className="brand-logo"
            style={{
              width: "32px",
              height: "32px",
              objectFit: "contain",
              borderRadius: "4px",
            }}
          />
          <h2 style={{ fontSize: "1rem", fontWeight: "800" }}>
            {businessInfo.name || "Vassu"} ERP
          </h2>

          <button className="mobile-close-btn" onClick={closeMobileMenu}>
            <X size={24} />
          </button>
        </div>

        <nav className="nav-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <LayoutDashboard size={20} />
            <span>ERP Dashboard</span>
          </NavLink>
          <NavLink
            to="/sales"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <ShoppingCart size={20} />
            <span>POS & Sales</span>
          </NavLink>
          <NavLink
            to="/purchases"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <Truck size={20} />
            <span>GRN & Procure</span>
          </NavLink>
          <NavLink
            to="/inventory"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <Box size={20} />
            <span>Raw Inventory</span>
          </NavLink>
          <NavLink
            to="/wastage"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <Trash2 size={20} />
            <span>Wastage Log</span>
          </NavLink>
          <NavLink
            to="/expenses"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <CreditCard size={20} />
            <span>Expenses</span>
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <PieChart size={20} />
            <span>Analysis & Reports</span>
          </NavLink>
          {user?.role === "admin" && (
            <>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <Activity size={20} />
                <span>Multi-Store Analytics</span>
              </NavLink>
              <NavLink
                to="/stores"
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
                onClick={closeMobileMenu}
              >
                <Store size={20} />
                <span>Manage Outlets</span>
              </NavLink>
            </>
          )}
          <NavLink
            to="/customers"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <Users size={20} />
            <span>CRM & Customers</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink
            to="/settings"
            className="nav-item"
            onClick={closeMobileMenu}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
          <button
            onClick={triggerLogout}
            className="nav-item"
            style={{
              background: "none",
              border: "none",
              width: "100%",
              textAlign: "left",
              color: "var(--danger)",
              cursor: "pointer",
            }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <header className="topbar">
          <div className="mobile-header-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div
            className="search-container"
            style={{ position: "relative", flex: 1, maxWidth: "280px" }}
          >
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Global Search..."
                className="search-input"
                value={searchTerm}
                onChange={handleSearch}
                onFocus={() =>
                  searchTerm.length >= 1 && setShowSearchResults(true)
                }
                autoComplete="off"
              />
            </div>
            {showSearchResults && (
              <div
                className="search-results-dropdown glass-panel"
                style={{ zIndex: 1100 }}
              >
                <div
                  style={{
                    padding: "8px",
                    fontSize: "0.65rem",
                    fontWeight: "800",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                    borderBottom: "1px solid var(--border)",
                    marginBottom: "4px",
                  }}
                >
                  {searchResults.length > 0
                    ? `Found Items (${searchResults.length})`
                    : "No results found"}
                </div>
                {searchResults.map((res, i) => (
                  <button
                    key={i}
                    className="search-item"
                    onClick={() => navigateToResult(res.link)}
                  >
                    <div style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                      {res.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {res.type}
                    </div>
                  </button>
                ))}
                {searchResults.length === 0 && searchTerm.length > 0 && (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                    }}
                  >
                    No matches for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {user?.role === "admin" && (
              <div
                className="store-switcher glass-panel"
                style={{
                  padding: "4px 8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <MapPin size={16} className="text-secondary" />
                <select
                  className="store-select"
                  value={selectedStore?.id || "ALL"}
                  onChange={(e) => {
                    if (e.target.value === "ALL") {
                      const allStoreObj = { id: "ALL", name: "All Stores" };
                      setSelectedStore(allStoreObj);
                      localStorage.setItem(
                        "vassu_selectedStore",
                        JSON.stringify(allStoreObj),
                      );
                      return;
                    }
                    const store = stores.find((s) => s.id === e.target.value);
                    setSelectedStore(store);
                    localStorage.setItem(
                      "vassu_selectedStore",
                      JSON.stringify(store),
                    );
                  }}
                >
                  <option value="ALL">All Stores</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="header-actions">
            <button
              className="action-btn"
              onClick={toggleTheme}
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              className="action-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span
                  className="badge-dot"
                  style={{
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    color: "white",
                    background: "var(--danger)",
                    borderRadius: "50%",
                    top: "-2px",
                    right: "-2px",
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="glass-panel"
                style={{
                  position: "absolute",
                  top: "55px",
                  right: "32px",
                  width: "300px",
                  zIndex: "100",
                  padding: "12px",
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow)",
                  background: "var(--bg-card)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "8px",
                  }}
                >
                  <h4 style={{ margin: 0 }}>System Notifications</h4>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--primary)",
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div
                      style={{
                        padding: "8px",
                        color: "var(--text-muted)",
                        fontSize: "0.9rem",
                      }}
                    >
                      No new alerts.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "12px 0",
                          borderBottom: "1px solid var(--border)",
                          fontSize: "0.85rem",
                          position: "relative",
                        }}
                      >
                        <button
                          onClick={() => dismissNotification(n.id)}
                          style={{
                            position: "absolute",
                            top: "10px",
                            right: "0",
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                          }}
                        >
                          <X size={14} />
                        </button>
                        <div
                          style={{
                            fontWeight: "700",
                            color:
                              n.type === "danger"
                                ? "var(--danger)"
                                : "var(--warning)",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <div
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background:
                                n.type === "danger"
                                  ? "var(--danger)"
                                  : "var(--warning)",
                            }}
                          ></div>
                          {n.title}
                        </div>
                        <div
                          style={{
                            color: "var(--text-main)",
                            marginTop: "4px",
                          }}
                        >
                          {n.message}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            marginTop: "4px",
                          }}
                        >
                          {new Date(n.date).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                height: "24px",
                width: "1px",
                background: "var(--border)",
                margin: "0 8px",
              }}
            ></div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
              }}
              onClick={() => navigate("/settings")}
              title="View Profile & Settings"
            >
              <div className="hide-on-mobile" style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    color: "var(--text-main)",
                    lineHeight: "1",
                  }}
                >
                  {user?.name}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    marginTop: "2px",
                  }}
                >
                  {user?.role === "admin"
                    ? "Admin Access"
                    : `${selectedStore?.name} Access`}
                </div>
              </div>
              <div
                className="user-profile"
                style={{
                  background: "var(--primary-glow)",
                  color: "var(--primary)",
                }}
              >
                <User size={18} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-wrapper animate-fade-in">
          <Outlet />
        </div>
      </main>

      <ConfirmDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out from Vassu ERP? Any unsaved changes might be lost."
        confirmText="Yes, Logout"
        type="danger"
      />
      <CommandCenter />
    </div>
  );
}
