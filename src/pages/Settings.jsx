import React, { useState, useRef } from "react";
import {
  Save,
  User,
  Building,
  Shield,
  BellRing,
  Database,
  Download,
  Upload,
  Info,
  Users,
  Plus,
  Trash2,
  Key,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const {
    user,
    users,
    resetData,
    resetLogs,
    updateUser,
    addUser,
    deleteUser,
    businessInfo,
    updateBusiness,
    stores,
  } = useAppContext();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [bizData, setBizData] = useState({ ...businessInfo });
  const importRef = useRef(null);

  // New User State
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "store",
    storeId: "",
  });

  const handleProfileSave = () => {
    updateUser(profileData);
    alert("Profile updated successfully!");
  };

  const handleBusinessSave = () => {
    updateBusiness(bizData);
    alert("Business information updated!");
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const res = addUser(newUserData);
    if (res.success) {
      alert("User account created successfully!");
      setNewUserData({
        name: "",
        email: "",
        password: "",
        role: "store",
        storeId: "",
      });
    } else {
      alert(res.msg);
    }
  };

  const handleExport = () => {
    const data = {
      inventory: JSON.parse(localStorage.getItem("vassu_inventory")),
      menuItems: JSON.parse(localStorage.getItem("vassu_menuItems")),
      purchases: JSON.parse(localStorage.getItem("vassu_purchases")),
      sales: JSON.parse(localStorage.getItem("vassu_sales")),
      wastage: JSON.parse(localStorage.getItem("vassu_wastage")),
      expenses: JSON.parse(localStorage.getItem("vassu_expenses")),
      businessInfo: JSON.parse(localStorage.getItem("vassu_businessInfo")),
      users: JSON.parse(localStorage.getItem("vassu_users")),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Vassu_ERP_Backup_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.inventory)
          localStorage.setItem(
            "vassu_inventory",
            JSON.stringify(data.inventory),
          );
        if (data.menuItems)
          localStorage.setItem(
            "vassu_menuItems",
            JSON.stringify(data.menuItems),
          );
        if (data.purchases)
          localStorage.setItem(
            "vassu_purchases",
            JSON.stringify(data.purchases),
          );
        if (data.sales)
          localStorage.setItem("vassu_sales", JSON.stringify(data.sales));
        if (data.wastage)
          localStorage.setItem("vassu_wastage", JSON.stringify(data.wastage));
        if (data.expenses)
          localStorage.setItem("vassu_expenses", JSON.stringify(data.expenses));
        if (data.businessInfo)
          localStorage.setItem(
            "vassu_businessInfo",
            JSON.stringify(data.businessInfo),
          );
        if (data.users)
          localStorage.setItem("vassu_users", JSON.stringify(data.users));
        alert("Data imported successfully! System will reload.");
        window.location.reload();
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "32px" }}>
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
              SYSTEM AUTH
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
              STORE USER
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
            ? "Global System Configuration"
            : "User Account Settings"}
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            fontSize: "0.9rem",
            marginTop: "4px",
          }}
        >
          {user?.role === "admin"
            ? `Manage entire ${businessInfo.name} ERP ecosystem and master data backups`
            : `Manage your personal profile and local ${user?.storeName || "store"} preferences`}
        </p>
      </div>

      <div
        style={{ display: "flex", gap: "32px" }}
        className="settings-container"
      >
        {/* Vertical Navigation Tabs */}
        <div
          style={{
            width: "250px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
          className="settings-nav"
        >
          <button
            onClick={() => setActiveTab("general")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "var(--radius)",
              border: "none",
              cursor: "pointer",
              background:
                activeTab === "general" ? "var(--primary-glow)" : "transparent",
              color:
                activeTab === "general"
                  ? "var(--primary)"
                  : "var(--text-muted)",
              fontWeight: activeTab === "general" ? "600" : "500",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <User size={18} /> Profile & Account
          </button>
          {user?.role === "admin" && (
            <>
              <button
                onClick={() => setActiveTab("users")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius)",
                  border: "none",
                  cursor: "pointer",
                  background:
                    activeTab === "users"
                      ? "var(--primary-glow)"
                      : "transparent",
                  color:
                    activeTab === "users"
                      ? "var(--primary)"
                      : "var(--text-muted)",
                  fontWeight: activeTab === "users" ? "600" : "500",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <Users size={18} /> User Management
              </button>
              <button
                onClick={() => setActiveTab("business")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius)",
                  border: "none",
                  cursor: "pointer",
                  background:
                    activeTab === "business"
                      ? "var(--primary-glow)"
                      : "transparent",
                  color:
                    activeTab === "business"
                      ? "var(--primary)"
                      : "var(--text-muted)",
                  fontWeight: activeTab === "business" ? "600" : "500",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <Building size={18} /> Business Info
              </button>
              <button
                onClick={() => setActiveTab("data")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius)",
                  border: "none",
                  cursor: "pointer",
                  background:
                    activeTab === "data"
                      ? "var(--primary-glow)"
                      : "transparent",
                  color:
                    activeTab === "data"
                      ? "var(--primary)"
                      : "var(--text-muted)",
                  fontWeight: activeTab === "data" ? "600" : "500",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <Database size={18} /> Data Backup & Reset
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab("about")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "var(--radius)",
              border: "none",
              cursor: "pointer",
              background:
                activeTab === "about" ? "var(--primary-glow)" : "transparent",
              color:
                activeTab === "about" ? "var(--primary)" : "var(--text-muted)",
              fontWeight: activeTab === "about" ? "600" : "500",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <Info size={18} /> About Software
          </button>
        </div>

        {/* Main Settings Panel */}
        <div
          className="glass-panel"
          style={{ flex: 1, padding: "32px", minHeight: "500px" }}
        >
          {activeTab === "general" && (
            <div className="animate-fade-in">
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "24px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "16px",
                }}
              >
                Profile & Account Details
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                }}
              >
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    className="input-control"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    className="input-control"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div
                style={{
                  marginTop: "32px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button className="btn btn-primary" onClick={handleProfileSave}>
                  <Save size={18} /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "users" && user?.role === "admin" && (
            <div className="animate-fade-in">
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "24px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "16px",
                }}
              >
                Login Credential Creation
              </h2>

              <form
                onSubmit={handleAddUser}
                style={{
                  background: "var(--bg-card-hover)",
                  padding: "24px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  marginBottom: "32px",
                }}
              >
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Plus size={18} /> Create New Account
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="input-control"
                      placeholder="John Doe"
                      value={newUserData.name}
                      onChange={(e) =>
                        setNewUserData({ ...newUserData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="input-control"
                      placeholder="user@store.com"
                      value={newUserData.email}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          email: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="input-control"
                      placeholder="••••••••"
                      value={newUserData.password}
                      onChange={(e) =>
                        setNewUserData({
                          ...newUserData,
                          password: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Role</label>
                    <select
                      className="input-control"
                      value={newUserData.role}
                      onChange={(e) =>
                        setNewUserData({ ...newUserData, role: e.target.value })
                      }
                    >
                      <option value="store">Store User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {newUserData.role === "store" && (
                    <div className="input-group">
                      <label>Assigned Store</label>
                      <select
                        className="input-control"
                        value={newUserData.storeId}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            storeId: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="">Select Store</option>
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginTop: "20px" }}
                >
                  Create User Account
                </button>
              </form>

              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  marginBottom: "16px",
                }}
              >
                Existing Accounts
              </h3>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Store</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.email}>
                      <td style={{ fontWeight: "600" }}>{u.name}</td>
                      <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            background:
                              u.role === "admin"
                                ? "var(--primary-glow)"
                                : "var(--bg-card-hover)",
                            color:
                              u.role === "admin"
                                ? "var(--primary)"
                                : "var(--text-muted)",
                          }}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {u.storeId
                          ? stores.find((s) => s.id === u.storeId)?.name ||
                            "N/A"
                          : "-"}
                      </td>
                      <td>
                        <button
                          onClick={() => deleteUser(u.email)}
                          style={{
                            color: "var(--danger)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                          disabled={u.email === user.email}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "business" && (
            <div className="animate-fade-in">
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "24px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "16px",
                }}
              >
                Business Information
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "24px",
                }}
              >
                <div className="input-group">
                  <label>Business Name</label>
                  <input
                    type="text"
                    className="input-control"
                    value={bizData.name}
                    onChange={(e) =>
                      setBizData({ ...bizData, name: e.target.value })
                    }
                  />
                </div>
                <div className="input-group">
                  <label>Primary Outlet Name</label>
                  <input
                    type="text"
                    className="input-control"
                    value={bizData.outlet}
                    onChange={(e) =>
                      setBizData({ ...bizData, outlet: e.target.value })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "24px",
                  }}
                >
                  <div className="input-group">
                    <label>VAT Registration Number</label>
                    <input
                      type="text"
                      className="input-control"
                      value={bizData.taxId}
                      onChange={(e) =>
                        setBizData({ ...bizData, taxId: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label>Currency Symbol</label>
                    <select
                      className="input-control"
                      value={bizData.currency}
                      onChange={(e) =>
                        setBizData({ ...bizData, currency: e.target.value })
                      }
                    >
                      <option value="£">£ (GBP)</option>
                      <option value="$">$ (USD)</option>
                      <option value="€">€ (EUR)</option>
                      <option value="₹">₹ (INR)</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: "32px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={handleBusinessSave}
                >
                  <Save size={18} /> Save Business Info
                </button>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="animate-fade-in">
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "24px",
                  borderBottom: "1px solid var(--border)",
                  paddingBottom: "16px",
                }}
              >
                Data Management
              </h2>

              <div style={{ marginBottom: "32px" }}>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    marginBottom: "16px",
                  }}
                >
                  Backup & Restore
                </h3>
                <div style={{ display: "flex", gap: "16px" }}>
                  <button className="btn btn-outline" onClick={handleExport}>
                    <Download size={18} /> Export Full ERP Backup (.json)
                  </button>
                  <input
                    type="file"
                    hidden
                    ref={importRef}
                    accept=".json"
                    onChange={handleImport}
                  />
                  <button
                    className="btn btn-outline"
                    onClick={() => importRef.current.click()}
                  >
                    <Upload size={18} /> Restore from Backup
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: "24px",
                  border: "1px solid var(--danger)",
                  borderRadius: "var(--radius)",
                  background: "rgba(239, 68, 68, 0.05)",
                }}
              >
                <h3
                  style={{
                    color: "var(--danger)",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  Danger Zone
                </h3>
                <p
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    marginBottom: "16px",
                  }}
                >
                  Resetting operational logs will clear all sales, purchases,
                  wastage, and expense entries while keeping your menu and
                  master inventory intact.
                </p>
                <div style={{ display: "flex", gap: "16px" }}>
                  <button
                    className="btn btn-danger"
                    style={{
                      background: "none",
                      color: "var(--danger)",
                      border: "1px solid var(--danger)",
                    }}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to clear all transactional logs?",
                        )
                      ) {
                        resetLogs();
                      }
                    }}
                  >
                    Reset Transactional Logs
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you absolutely sure you want to wipe ALL ERP data (including users and inventory)?",
                        )
                      ) {
                        resetData();
                      }
                    }}
                  >
                    Factory Reset (Full Wipe)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div
              className="animate-fade-in"
              style={{ textAlign: "center", padding: "40px 0" }}
            >
              <div style={{ marginBottom: "24px" }}>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "800",
                    marginTop: "16px",
                  }}
                >
                  Vassu ERP v1.5.0
                </h2>
                <p style={{ color: "var(--text-muted)" }}>
                  Multi-Store Inventory & POS Solution
                </p>
              </div>
              <div
                style={{
                  maxWidth: "400px",
                  margin: "0 auto",
                  textAlign: "left",
                  background: "var(--bg-card-hover)",
                  padding: "24px",
                  borderRadius: "var(--radius)",
                }}
              >
                <div style={{ fontSize: "0.9rem", marginBottom: "12px" }}>
                  <strong>Developed by:</strong> Vassu InfoTech
                </div>
                <div style={{ fontSize: "0.9rem", marginBottom: "12px" }}>
                  <strong>Update Date:</strong> March 2026
                </div>
                <div style={{ fontSize: "0.9rem", marginBottom: "12px" }}>
                  <strong>Status:</strong> Ready for Production
                </div>
                <div style={{ fontSize: "0.9rem" }}>
                  <strong>Support:</strong> info@vassuinfotech.com
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
