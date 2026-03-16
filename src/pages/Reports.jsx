import React, { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import * as XLSX from 'xlsx';
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Reports() {
  const {
    sales,
    expenses,
    wastage,
    inventory: allInventory,
    menuItems,
    businessInfo,
    selectedStore,
    stores
  } = useAppContext();

  const [startDate, setStartDate] = React.useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = React.useState(() => new Date().toISOString().split('T')[0]);

  // Filter local data further by the selected date range
  const filteredData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const isInRange = (d) => {
        const date = new Date(d);
        return date >= start && date <= end;
    };

    return {
        sales: sales.filter(s => (selectedStore?.id === 'ALL' || s.storeId === selectedStore?.id) && isInRange(s.date)),
        expenses: expenses.filter(e => (selectedStore?.id === 'ALL' || e.storeId === selectedStore?.id) && isInRange(e.date)),
        wastage: wastage.filter(w => (selectedStore?.id === 'ALL' || w.storeId === selectedStore?.id) && isInRange(w.date))
    };
  }, [sales, expenses, wastage, startDate, endDate]);

  const { sales: inRangeSales, expenses: inRangeExpenses, wastage: inRangeWastage } = filteredData;

  // 1. Calculate Monthly Profit & Loss (Used for Charts/Table)
  const reportData = useMemo(() => {
    const months = {};

    const getMonthKey = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
    };

    inRangeSales.forEach((sale) => {
      const m = getMonthKey(sale.date);
      if (!months[m]) months[m] = { month: m, revenue: 0, cogs: 0, expenses: 0, wastage: 0, tax: 0 };
      months[m].revenue += sale.amount;
      
      const vat = sale.amount * 0.20; // 20% Standard
      months[m].tax += vat;

      sale.items.forEach((it) => {
        const menuItem = menuItems.find((mi) => mi.id === it.menuId);
        if (menuItem) {
          menuItem.recipe.forEach((r) => {
            const raw = allInventory.find((ri) => ri.id === r.rawId);
            if (raw) months[m].cogs += raw.pricePerUnit * r.qty * it.qty;
          });
        }
      });
    });

    inRangeExpenses.forEach((exp) => {
      const m = getMonthKey(exp.date);
      if (!months[m]) months[m] = { month: m, revenue: 0, cogs: 0, expenses: 0, wastage: 0, tax: 0 };
      months[m].expenses += exp.amount;
    });

    inRangeWastage.forEach((w) => {
      const m = getMonthKey(w.date);
      if (!months[m]) months[m] = { month: m, revenue: 0, cogs: 0, expenses: 0, wastage: 0, tax: 0 };
      months[m].wastage += w.cost;
    });

    return Object.values(months)
      .map((m) => ({
        ...m,
        grossProfit: m.revenue - m.cogs,
        netProfit: m.revenue - m.cogs - m.expenses - m.wastage,
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  }, [inRangeSales, inRangeExpenses, allInventory, inRangeWastage, menuItems]);

  const totalStats = useMemo(() => {
    return reportData.reduce(
      (acc, curr) => ({
        rev: acc.rev + curr.revenue,
        profit: acc.profit + curr.netProfit,
        tax: acc.tax + curr.tax,
      }),
      { rev: 0, profit: 0, tax: 0 },
    );
  }, [reportData]);

  const universalExport = () => {
    // Advanced Subway Format Header Mapping (from Book1.xlsx)
    const mainHeaders = [
      "ID", "STORE", "GROSS SALES", "VAT", "VAT %", "Adjusted VAT", "NET SALES", 
      "Delivery %", "Total 3PD Sale", "Customer Count", 
      "JustEat Sale", "JUST Charge", "20% Vat", "Receive JE", "Bank JE", "Variance JE",
      "UberEat Sale", "UBEREAT Charge", "20% Vat", "Receive UE", "Bank UE", "Advertise UE", "Disc % UE",
      "Deliveroo sale", "DELIVEROO Charge", "20% Vat", "Receive DR", "Bank DR", "Variance DR",
      "delivery TOTAL", "Deliv %", "LABOUR HRS", "LABOUR COST", "Labour %", 
      "BID FOOD", "Food %", "TOTAL COST %", "In-Food Cost", "In-Labour Cost"
    ];

    const allRows = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    let current = new Date(start);
    current.setDate(current.getDate() - (current.getDay() === 0 ? 6 : current.getDay() - 1));
    
    let weekNum = 1;
    while (current <= end) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);

      allRows.push([`WEEK-${weekNum} (${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()})`]);
      allRows.push(mainHeaders);

      let wG = 0, wN = 0, w3 = 0, wL = 0, wF = 0, wC = 0;

      const displayStores = selectedStore?.id === 'ALL' ? stores : stores.filter(s => s.id === selectedStore?.id);
      
      displayStores.forEach((store, idx) => {
        const sSales = sales.filter(s => s.storeId === store.id && new Date(s.date) >= weekStart && new Date(s.date) <= weekEnd);
        const sExp = expenses.filter(e => e.storeId === store.id && new Date(e.date) >= weekStart && new Date(e.date) <= weekEnd);

        const gross = sSales.reduce((a, b) => a + b.amount, 0);
        const je = sSales.filter(s => s.type === 'Just-Eat').reduce((a,b) => a + b.amount, 0);
        const ue = sSales.filter(s => s.type === 'Uber-Eats').reduce((a,b) => a + b.amount, 0);
        const dr = sSales.filter(s => s.type === 'Deliveroo').reduce((a,b) => a + b.amount, 0);
        const tpd = je + ue + dr;
        
        const labour = sExp.filter(e => e.category?.toLowerCase().includes('labour') || e.category?.toLowerCase().includes('wage')).reduce((a,b) => a + b.amount, 0);
        
        let foodCost = 0;
        sSales.forEach(s => {
          s.items.forEach(it => {
            const m = menuItems.find(mi => mi.id === it.menuId);
            if (m) {
              m.recipe.forEach(r => {
                const raw = allInventory.find(ri => ri.id === r.rawId && ri.storeId === store.id);
                if (raw) foodCost += (raw.pricePerUnit * r.qty * it.qty);
              });
            }
          });
        });

        allRows.push([
          idx + 1, store.name, gross.toFixed(2), (gross * 0.2).toFixed(2), "20%", "0.00", (gross / 1.2).toFixed(2),
          gross > 0 ? ((tpd/gross)*100).toFixed(1)+"%" : "0%", tpd.toFixed(2), sSales.length,
          je.toFixed(2), "0.00", "0.00", "0.00", "0.00", "0.00",
          ue.toFixed(2), "0.00", "0.00", "0.00", "0.00", "0.00", "0.00",
          dr.toFixed(2), "0.00", "0.00", "0.00", "0.00", "0.00",
          tpd.toFixed(2), "100%", "0", labour.toFixed(2),
          gross > 0 ? ((labour/gross)*100).toFixed(1)+"%" : "0%",
          foodCost.toFixed(2),
          gross > 0 ? ((foodCost/gross)*100).toFixed(1)+"%" : "0%",
          gross > 0 ? (((labour + foodCost)/gross)*100).toFixed(1)+"%" : "0%",
          foodCost.toFixed(2),
          labour.toFixed(2)
        ]);

        wG += gross; wN += (gross / 1.2); w3 += tpd; wL += labour; wF += foodCost; wC += sSales.length;
      });

      // WEEK TOTAL
      allRows.push([
        "", "TOTAL", wG.toFixed(2), (wG * 0.2).toFixed(2), "", "", wN.toFixed(2),
        "", w3.toFixed(2), wC,
        "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
        w3.toFixed(2), "", "", wL.toFixed(2), "", wF.toFixed(2), "", "", wF.toFixed(2), wL.toFixed(2)
      ]);

      allRows.push([]); // Spacer
      current.setDate(current.getDate() + 7);
      weekNum++;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(allRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Yearly Export");
    XLSX.writeFile(workbook, `Subway_Enterprise_Sheet_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', background: 'var(--bg-card)', padding: '16px 24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: '32px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>FILTER RANGE:</span>
         </div>
         <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="date" className="input-control" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '6px 12px', fontSize: '0.8rem' }} />
            <span style={{ color: 'var(--text-muted)' }}>To</span>
            <input type="date" className="input-control" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '6px 12px', fontSize: '0.8rem' }} />
         </div>
         
         <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" onClick={() => {
                const now = new Date();
                const currentYear = now.getFullYear();
                setStartDate(`${currentYear}-01-01`);
                setEndDate(now.toISOString().split('T')[0]);
            }}>This Year</button>
            <button className="btn btn-primary" onClick={universalExport}>
                <Download size={18} /> Export Performance (XLSX)
            </button>
         </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: "32px" }}>
        <div
          className="stat-card glass-panel"
          style={{ borderLeft: "4px solid var(--primary)" }}
        >
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Total Revenue (Period)
            </span>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginTop: "8px",
              }}
            >
              {businessInfo.currency}{totalStats.rev.toFixed(2)}
            </div>
          </div>
        </div>
        <div
          className="stat-card glass-panel"
          style={{ borderLeft: "4px solid var(--success)" }}
        >
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Total Net Profit
            </span>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginTop: "8px",
                color: "var(--success)",
              }}
            >
              {businessInfo.currency}{totalStats.profit.toFixed(2)}
            </div>
          </div>
        </div>
        <div
          className="stat-card glass-panel"
          style={{ borderLeft: "4px solid #f39c12" }}
        >
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              VAT Collected
            </span>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                marginTop: "8px",
                color: "#f39c12",
              }}
            >
              {businessInfo.currency}{totalStats.tax.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        <div
          className="glass-panel"
          style={{ padding: "24px", height: "400px" }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              marginBottom: "24px",
            }}
          >
            Monthly Profit Performance
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={reportData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(0,0,0,0.05)"
              />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
                formatter={(value) => [`${businessInfo.currency}${value.toFixed(2)}`, ""]}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="netProfit"
                name="Net Profit"
                fill="var(--success)"
                radius={[4, 4, 0, 0]}
              >
                {reportData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.netProfit < 0 ? "var(--danger)" : "var(--success)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div
          className="glass-panel"
          style={{ padding: "24px", height: "400px" }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              fontWeight: "600",
              marginBottom: "24px",
            }}
          >
            Revenue by Category
          </h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={[
                { name: "Subs", value: totalStats.rev * 0.85 },
                { name: "Sides", value: totalStats.rev * 0.1 },
                { name: "Drinks", value: totalStats.rev * 0.05 },
              ]}
              layout="vertical"
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(v) => `${businessInfo.currency}${v.toFixed(2)}`} />
              <Bar
                dataKey="value"
                fill="var(--primary)"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        className="glass-panel"
        style={{ padding: "24px", overflowX: "auto", width: "100%" }}
      >
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            marginBottom: "20px",
          }}
        >
          Historical P&L Summary
        </h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue</th>
              <th>COGS</th>
              <th>Expenses</th>
              <th>Wastage</th>
              <th>VAT</th>
              <th style={{ textAlign: "right" }}>Gross Margin</th>
              <th style={{ textAlign: "right" }}>Net Profit</th>
              <th style={{ textAlign: "right" }}>Net Margin</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((d, i) => {
              const grossMarginVal = d.revenue > 0 ? (((d.revenue - d.cogs) / d.revenue) * 100).toFixed(1) : 0;
              const netMarginVal = d.revenue > 0 ? ((d.netProfit / d.revenue) * 100).toFixed(1) : 0;
              
              return (
                <tr key={i}>
                  <td style={{ fontWeight: "700" }}>{d.month}</td>
                  <td>{businessInfo.currency}{d.revenue.toFixed(2)}</td>
                  <td>{businessInfo.currency}{d.cogs.toFixed(2)}</td>
                  <td>{businessInfo.currency}{d.expenses.toFixed(2)}</td>
                  <td style={{ color: "var(--danger)" }}>
                    {businessInfo.currency}{d.wastage.toFixed(2)}
                  </td>
                  <td style={{ color: "#f39c12" }}>{businessInfo.currency}{d.tax.toFixed(2)}</td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      className="badge"
                      style={{
                        background: "rgba(37, 99, 235, 0.1)",
                        color: "var(--primary)",
                        padding: "2px 8px",
                      }}
                    >
                      {grossMarginVal}%
                    </span>
                  </td>
                  <td
                    style={{
                      fontWeight: "700",
                      textAlign: "right",
                      color:
                        d.netProfit >= 0 ? "var(--success)" : "var(--danger)",
                    }}
                  >
                    {businessInfo.currency}{d.netProfit.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        color: d.netProfit >= 0 ? "var(--success)" : "var(--danger)",
                      }}
                    >
                      {netMarginVal}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
