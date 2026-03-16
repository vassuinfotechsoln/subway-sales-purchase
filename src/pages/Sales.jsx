import { useState, useRef, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import {
  Plus,
  Search,
  CheckCircle,
  Upload,
  Filter,
  Printer,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function Sales() {
  const {
    user,
    menuItems,
    sales: allSales,
    filteredSales: contextFilteredSales,
    processSale,
    businessInfo,
    stores,
  } = useAppContext();
  const sales = user?.role === 'admin' ? allSales : contextFilteredSales;
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [storeFilter, setStoreFilter] = useState("All");

  // POS State
  const [customer, setCustomer] = useState("");
  const [orderType, setOrderType] = useState("Dine-In");
  const [cart, setCart] = useState([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [lastOrder, setLastOrder] = useState(null);

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => 
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) || 
      item.category.toLowerCase().includes(menuSearch.toLowerCase())
    );
  }, [menuItems, menuSearch]);

  // File Upload State
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "array" });
        const wsname = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

        let successCount = 0;
        let failCount = 0;

        data.forEach((row) => {
          const rowKeys = Object.keys(row);
          const getValue = (possibleNames) => {
            const key = rowKeys.find(k => possibleNames.includes(k.toLowerCase().replace(/[^a-z]/g, '')));
            return key ? row[key] : null;
          };

          const iId = getValue(['itemid', 'id', 'id']);
          const iName = getValue(['itemname', 'name', 'product', 'item']);
          const qty = getValue(['qty', 'quantity', 'amount']);
          const cust = getValue(['customer', 'client', 'user']);
          const type = getValue(['type', 'ordertype']);

          const item = menuItems.find(
            (m) =>
              (iId && m.id === parseInt(iId)) ||
              (iName && m.name.toLowerCase() === String(iName).toLowerCase()),
          );
          
          if (item) {
            const finalQty = parseInt(qty) || 1;
            const cartItem = {
              menuId: item.id,
              name: item.name,
              price: item.price,
              qty: finalQty,
            };
            const res = processSale({
              customer: cust || "Bulk User",
              type: type || "Dine-In",
              amount: cartItem.price * cartItem.qty,
              status: "Completed",
              items: [cartItem],
            });
            if (res.success) successCount++;
            else failCount++;
          } else {
            failCount++;
          }
        });

        alert(
          `Sales Bulk Import Complete.\nSuccess: ${successCount}\nFailed: ${failCount} (Due to missing stock or invalid items)`,
        );
      } catch (err) {
        console.error(err);
        alert("Error reading file.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        (s.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (s.customer?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (s.type?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesStore = storeFilter === "All" || s.storeId === storeFilter;
      return matchesSearch && matchesStore;
    });
  }, [sales, searchTerm, storeFilter]);

  const getMenuTotal = () =>
    cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const addToCart = (menuId) => {
    const item = menuItems.find((m) => m.id === parseInt(menuId));
    if (!item) return;
    const existing = cart.find((c) => c.menuId === item.id);
    if (existing) {
      setCart(
        cart.map((c) => (c.menuId === item.id ? { ...c, qty: c.qty + 1 } : c)),
      );
    } else {
      setCart([
        ...cart,
        { menuId: item.id, name: item.name, price: item.price, qty: 1 },
      ]);
    }
  };

  const removeFromCart = (menuId) => {
    setCart(cart.filter((c) => c.menuId !== menuId));
  };

  const submitOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0 || !customer) return;

    const orderData = {
      customer,
      type: orderType,
      amount: getMenuTotal(),
      status: "Completed",
      items: cart,
    };

    const res = processSale(orderData);

    if (res.success) {
      setLastOrder(res.order); // Use the order with taxDetails from context
      setCustomer("");
      setCart([]);
      setOrderType("Dine-In");
    } else {
      alert(res.msg);
    }
  };

  const closePOS = () => {
    setModalOpen(false);
    setLastOrder(null);
  };

  return (
    <div className="animate-fade-in">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
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
                FINANCIAL OVERSIGHT
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
                STORE TERMINAL
              </span>
            )}
          </div>
          <h1
            style={{
              fontSize: "1.4rem",
              fontWeight: "700",
              color: "var(--text-main)",
            }}
          >
            {user?.role === "admin"
              ? "Revenue & Sales Pipeline"
              : "POS & Menu Terminal"}
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "0.8rem",
              marginTop: "2px",
            }}
          >
            {user?.role === "admin"
              ? "Analyzing cashflow and tax compliance across the outlet"
              : "Process customer orders and deduct BOM materials dynamically"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            className="btn btn-outline"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={18} />
            <span>Upload XLSX/CSV</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={18} />
            <span>New POS Order</span>
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            gap: "16px",
          }}
        >
          <h3 style={{ fontSize: "0.9rem", fontWeight: "600" }}>
            Recent Orders
          </h3>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {user?.role === "admin" && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
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
                  <option value="All">All Stores</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="search-bar" style={{ width: "280px" }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search orders..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <table className="custom-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date/Time</th>
              {user?.role === "admin" && <th>Store</th>}
              <th>Customer</th>
              <th>Type</th>
              <th>Order Summary</th>
              <th>Net Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.id}>
                <td style={{ fontWeight: "700", color: "var(--primary)" }}>
                  {sale.id}
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  {new Date(sale.date).toLocaleString()}
                </td>
                {user?.role === "admin" && (
                  <td style={{ fontWeight: "600" }}>
                    {stores.find((s) => s.id === sale.storeId)?.name || "N/A"}
                  </td>
                )}
                <td style={{ fontWeight: "700" }}>{sale.customer}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background:
                        sale.type === "Zomato/Swiggy"
                          ? "var(--bg-card-hover)"
                          : "var(--primary-glow)",
                      color:
                        sale.type === "Zomato/Swiggy"
                          ? "var(--text-muted)"
                          : "var(--primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {sale.type}
                  </span>
                </td>

                <td style={{ fontSize: "0.85rem" }}>
                  {sale.items.map((it, i) => (
                    <div key={i}>
                      {it.qty}x {it.name}
                    </div>
                  ))}
                </td>
                <td style={{ fontWeight: "700" }}>
                  {businessInfo.currency}
                  {sale.amount.toFixed(2)}
                </td>
              </tr>
            ))}
            {filteredSales.length === 0 && (
              <tr>
                <td
                  colSpan={user?.role === "admin" ? "7" : "6"}
                  style={{ textAlign: "center", padding: "32px" }}
                >
                  No orders matching search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closePOS}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: lastOrder ? "400px" : "850px", padding: "24px" }}
          >
            <div className="modal-header" style={{ marginBottom: "24px" }}>
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  color: "var(--text-main)",
                  letterSpacing: "-0.04em",
                }}
              >
                {lastOrder ? "Order Completed" : "New POS Order"}
              </h2>
              <button
                className="close-btn"
                onClick={closePOS}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus size={20} style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>

            {lastOrder ? (
              <div className="animate-fade-in">
                <div
                  id="bill-receipt"
                  style={{
                    background: "white",
                    padding: "32px",
                    borderRadius: "12px",
                    color: "#1a1a1a",
                    textAlign: "left",
                    fontFamily: "'Outfit', 'Inter', sans-serif",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                    border: "1px solid #f0f0f0",
                    marginBottom: "24px"
                  }}
                >
                  {/* Decorative Header Bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)' }}></div>
                  
                  {/* Brand Header */}
                  <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: "900", margin: "0", letterSpacing: "-0.04em", color: "#000" }}>
                      {businessInfo.name.toUpperCase()}
                    </h2>
                    <div style={{ fontSize: "0.75rem", color: "#666", fontWeight: "500", marginTop: "4px", display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                      <span>{stores.find((s) => s.id === lastOrder.storeId)?.name || businessInfo.outlet}</span>
                      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ccc' }}></span>
                      <span>VAT: {businessInfo.taxId}</span>
                    </div>
                  </div>

                  {/* Transaction Info Grid */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "1fr 1fr", 
                    gap: "12px", 
                    padding: "16px 0", 
                    borderTop: "1px solid #f0f0f0", 
                    borderBottom: "1px solid #f0f0f0", 
                    marginBottom: "20px" 
                  }}>
                    <div>
                      <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#999", fontWeight: "800", letterSpacing: '0.05em' }}>Invoice No</div>
                      <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#333" }}>#{lastOrder.id.slice(-8).toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#999", fontWeight: "800", letterSpacing: '0.05em' }}>Date & Time</div>
                      <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#333" }}>{new Date(lastOrder.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#999", fontWeight: "800", letterSpacing: '0.05em' }}>Customer</div>
                      <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#333" }}>{lastOrder.customer}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "#999", fontWeight: "800", letterSpacing: '0.05em' }}>Order Type</div>
                      <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "var(--primary)" }}>{lastOrder.type}</div>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: "800", textTransform: "uppercase", color: "#999", marginBottom: "8px", letterSpacing: '0.05em' }}>Order Details</div>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <tbody>
                        {lastOrder.items.map((it, i) => (
                          <tr key={i} style={{ borderBottom: "1px solid #f9f9f9" }}>
                            <td style={{ padding: "10px 0" }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#000" }}>{it.name}</div>
                              <div style={{ fontSize: "0.7rem", color: "#888" }}>{businessInfo.currency}{it.price.toFixed(2)} per unit</div>
                            </td>
                            <td style={{ textAlign: "right", padding: "10px 0" }}>
                              <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#000" }}>
                                {it.qty} <span style={{ color: '#ccc', fontWeight: '400', fontSize: '0.7rem' }}>x</span> {businessInfo.currency}{(it.qty * it.price).toFixed(2)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer */}
                  <div style={{ 
                    background: "#f8fafc", 
                    padding: "16px", 
                    borderRadius: "8px", 
                    marginTop: "12px" 
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b", marginBottom: "4px" }}>
                      <span>Subtotal</span>
                      <span>{businessInfo.currency}{(lastOrder.amount - (lastOrder.taxDetails?.reduce((s,t) => s + t.taxAmount, 0) || 0)).toFixed(2)}</span>
                    </div>
                    {lastOrder.taxDetails?.map((tax, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748b", marginBottom: "4px" }}>
                        <span>VAT ({tax.vatRate}%)</span>
                        <span>{businessInfo.currency}{tax.taxAmount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      marginTop: "12px", 
                      paddingTop: "12px", 
                      borderTop: "1px solid #e2e8f0" 
                    }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: "800", textTransform: 'uppercase', color: '#1e293b' }}>Total Paid</div>
                      <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#000" }}>
                        {businessInfo.currency}{lastOrder.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Footer Note */}
                  <div style={{ textAlign: "center", marginTop: "24px" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: "700", color: "#000" }}>Thank you for your visit!</div>
                    <div style={{ fontSize: "0.65rem", color: "#999", marginTop: "4px" }}>Visit again at {businessInfo.name}</div>
                    
                    {/* Visual Stamp Placeholder */}
                    <div style={{ 
                      display: 'inline-block', 
                      marginTop: '16px', 
                      padding: '4px 12px', 
                      border: '2px solid #22c55e', 
                      borderRadius: '4px', 
                      color: '#22c55e', 
                      fontSize: '0.6rem', 
                      fontWeight: '900', 
                      textTransform: 'uppercase',
                      transform: 'rotate(-5deg)',
                      opacity: 0.8
                    }}>
                      Digitally Verified
                    </div>
                  </div>
                </div>

                {/* Print Controls */}
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const printContent = document.getElementById("bill-receipt").innerHTML;
                      const win = window.open("", "", "height=700,width=500");
                      win.document.write(`
                        <html>
                          <head>
                            <title>Invoice - ${lastOrder.id}</title>
                            <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;900&display=swap" rel="stylesheet">
                            <style>
                              body { font-family: 'Outfit', sans-serif; padding: 0; margin: 0; background: #fff; }
                              #bill-receipt { padding: 40px !important; box-shadow: none !important; border: none !important; }
                              @media print {
                                body { width: 100%; }
                                .no-print { display: none; }
                              }
                            </style>
                          </head>
                          <body>
                            <div id="bill-receipt">
                              ${printContent}
                            </div>
                            <script>
                              window.onload = () => { window.print(); window.close(); };
                            </script>
                          </body>
                        </html>
                      `);
                      win.document.close();
                    }}
                  >
                    <Printer size={16} /> Print Receipt
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => setLastOrder(null)}
                  >
                    New Order
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", gap: "32px", minHeight: "400px" }}
                className="pos-split-view"
              >
                {/* POS Menu Grid */}
                <div
                  style={{
                    flex: 1,
                    borderRight: "1px solid var(--border)",
                    paddingRight: "20px",
                  }}
                  className="pos-menu-section"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: "0.9rem", fontWeight: "600" }}>Menu Items</h3>
                    <div className="search-bar" style={{ width: '180px', height: '32px', padding: '0 8px' }}>
                      <Search size={14} className="search-icon" style={{ marginRight: '6px' }} />
                      <input 
                        type="text" 
                        placeholder="Search menu..." 
                        className="search-input"
                        style={{ fontSize: '0.75rem' }}
                        value={menuSearch}
                        onChange={(e) => setMenuSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                    }}
                  >
                     {filteredMenuItems.map((menu) => (
                      <div
                        key={menu.id}
                        onClick={() => addToCart(menu.id)}
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border)",
                          padding: "12px",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.borderColor = "var(--primary)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.borderColor = "var(--border)")
                        }
                      >
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            marginBottom: "4px",
                          }}
                        >
                          {menu.name}
                        </div>
                        <div
                          style={{
                            color: "var(--primary)",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                          }}
                        >
                          {businessInfo.currency}
                          {menu.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POS Checkout Terminal */}
                <div
                  style={{
                    width: "320px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  className="pos-checkout-section"
                >
                  <div
                    style={{
                      borderBottom: "1px solid var(--border)",
                      paddingBottom: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                      Checkout cart
                    </h3>
                  </div>

                  <form
                    onSubmit={submitOrder}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                    }}
                  >
                    <div className="input-group">
                      <label>Customer Name</label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="Walk-in / App User"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label>Order Type</label>
                      <select
                        className="input-control"
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                      >
                        <option value="Dine-In">Dine-In</option>
                        <option value="Takeaway">Takeaway</option>
                        <option value="Zomato/Swiggy">Zomato / Swiggy</option>
                      </select>
                    </div>

                    {/* Cart Items */}
                    <div
                      style={{ margin: "16px 0", flex: 1, overflowY: "auto" }}
                    >
                      {cart.map((c) => (
                        <div
                          key={c.menuId}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "8px",
                            fontSize: "0.85rem",
                          }}
                        >
                          <span>
                            {c.qty}x {c.name}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span style={{ fontWeight: "700" }}>
                              {businessInfo.currency}
                              {(c.qty * c.price).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(c.menuId)}
                              style={{
                                color: "var(--danger)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <Plus
                                size={16}
                                style={{ transform: "rotate(45deg)" }}
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        borderTop: "2px solid var(--border-light)",
                        paddingTop: "16px",
                        marginTop: "auto",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "16px",
                          fontWeight: "700",
                          fontSize: "1.2rem",
                          color: "var(--primary)",
                        }}
                      >
                        <span>Total</span>
                        <span>
                          {businessInfo.currency}
                          {getMenuTotal().toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: "100%" }}
                        disabled={cart.length === 0}
                      >
                        <CheckCircle size={18} /> COMPLETE & PRINT
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
