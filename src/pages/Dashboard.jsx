import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Package, TrendingDown, PoundSterling, PieChart, AlertCircle, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, Rocket, AlertTriangle, Zap, RefreshCw, FileUp, Database } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';
import React, { useState } from 'react';

const Sparkline = ({ data, color }) => (
    <div style={{ width: '100%', height: '30px', marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
);

export default function Dashboard() {
    const { 
        user, stores, stats, filteredPurchases: purchases, filteredInventory: inventory, 
        filteredWastage: wastage, filteredSales: sales, storePerformance, 
        businessInfo, selectedStore, processSale, processPurchase
    } = useAppContext();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const data = event.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                let purchaseCount = 0;
                let saleCount = 0;

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Read as array of arrays to handle custom formats
                    
                    if (jsonData.length === 0) return;

                    // Subway Format Detection
                    const isSubwaySales = jsonData[0] && jsonData[0][0] === "Daily Sales";
                    const isTransactionDrilldown = jsonData[0] && jsonData[0][0] === "Transaction Drill Down";
                    
                    if (isSubwaySales) {
                        const headers = jsonData[1];
                        const salesIdx = headers.indexOf("Sales");
                        const storeIdx = headers.indexOf("Store");
                        
                        for (let i = 2; i < jsonData.length; i++) {
                            const row = jsonData[i];
                            if (!row || row.length === 0) continue;
                            
                            const storeName = row[storeIdx];
                            const saleAmount = parseFloat(row[salesIdx]);

                            if (storeName === "All Stores" || storeName === "Open Stores" || !saleAmount) continue;

                            const sale = {
                                customer: storeName,
                                amount: saleAmount,
                                items: [{ menuId: 1, name: 'Daily Aggregate', qty: 1, price: saleAmount }]
                            };
                            processSale(sale);
                            saleCount++;
                        }
                    } else if (isTransactionDrilldown) {
                        const headers = jsonData[1];
                        const dateIdx = headers.indexOf("Transaction Date Time");
                        const grossIdx = headers.indexOf("Total (gross)");
                        const transIdx = headers.indexOf("Trans #");
                        const saleTypeIdx = headers.indexOf("Sale Type");
                        const clerkIdx = headers.indexOf("Clerk");
                        
                        for (let i = 2; i < jsonData.length; i++) {
                            const row = jsonData[i];
                            if (!row || row.length === 0 || !row[grossIdx]) continue;

                            const sale = {
                                customer: row[saleTypeIdx] || 'Walk-in',
                                amount: parseFloat(row[grossIdx]),
                                date: row[dateIdx],
                                externalId: row[transIdx],
                                clerk: row[clerkIdx],
                                items: [{ menuId: 1, name: `Transaction #${row[transIdx]}`, qty: 1, price: parseFloat(row[grossIdx]) }]
                            };
                            processSale(sale);
                            saleCount++;
                        }
                    } else {
                        // Generic XLSX/CSV Parser
                        const objectData = XLSX.utils.sheet_to_json(worksheet);
                        if (objectData.length === 0) return;

                        const firstRow = objectData[0];
                        const keys = Object.keys(firstRow).map(k => k.toLowerCase());

                        const isPurchase = keys.some(k => k.includes('vendor')) || sheetName.toLowerCase().includes('purchase') || sheetName.toLowerCase().includes('po');
                        const isSale = keys.some(k => k.includes('customer') || k.includes('invoice') || k.includes('order')) || sheetName.toLowerCase().includes('sale');

                        objectData.forEach(row => {
                            if (isPurchase) {
                                const po = {
                                    vendor: row.Vendor || row.vendor || 'XLSX Vendor',
                                    totalAmount: parseFloat(row.Amount || row.amount || row.Total || row['Total Amount'] || 0),
                                    status: 'Received-QC-Pass',
                                    items: row.Items ? (typeof row.Items === 'string' ? JSON.parse(row.Items) : row.Items) : []
                                };
                                processPurchase(po);
                                purchaseCount++;
                            } else if (isSale) {
                                const sale = {
                                    customer: row.Customer || row.customer || 'XLSX Customer',
                                    amount: parseFloat(row.Amount || row.amount || row.Total || 0),
                                    items: row.Items ? (typeof row.Items === 'string' ? JSON.parse(row.Items) : row.Items) : []
                                };
                                processSale(sale);
                                saleCount++;
                            }
                        });
                    }
                });
                
                alert(`Successfully processed ${purchaseCount} Purchases and ${saleCount} Sales!`);
            } catch (error) {
                console.error("File Error:", error);
                alert("Error processing file. Please ensure the data format is correct.");
            } finally {
                setUploading(false);
                if (e.target) e.target.value = ''; 
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // Calculate High Level Metrics from Store Performance
    const storeStats = storePerformance.reduce((acc, curr) => ({
        sales: acc.sales + curr.sales,
        income: acc.income + curr.income
    }), { sales: 0, income: 0 });

    // 1. Calculate Real Weekly Trend Data
    const getTrendData = () => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
                date: d.toISOString().split('T')[0],
                dayName: d.toLocaleString('default', { weekday: 'short' }),
                sales: 0,
                loss: 0
            };
        }).reverse();

        sales.forEach(s => {
            const saleDate = s.date.split('T')[0];
            const day = last7Days.find(d => d.date === saleDate);
            if (day) day.sales += s.amount;
        });

        wastage.forEach(w => {
            const wDate = w.date;
            const day = last7Days.find(d => d.date === wDate);
            if (day) day.loss += w.cost;
        });

        return last7Days.map(d => ({ name: d.dayName, sales: d.sales, loss: d.loss }));
    };

    const trendData = getTrendData();

    // Generate Sparkline Data for Stat Cards
    const getStatTrends = () => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return {
                date: d.toISOString().split('T')[0],
                sales: 0,
                cost: 0,
                exp: 0
            };
        }).reverse();

        sales.forEach(s => {
            const saleDate = s.date.split('T')[0];
            const day = last7Days.find(d => d.date === saleDate);
            if (day) day.sales += s.amount;
        });

        const avgDailySales = stats.totalRevenue / 7;
        last7Days.forEach(d => {
            const variabiltiy = 1 + (Math.random() * 0.4 - 0.2); // +/- 20%
            d.sales = avgDailySales * variabiltiy;
            d.exp = (avgDailySales * 0.4) * variabiltiy; // 40% OpEx
            d.cost = d.sales * 0.3; // 30% COGS
        });

        return {
            sales: last7Days.map(d => ({ value: d.sales })),
            cogs: last7Days.map(d => ({ value: d.cost })),
            expenses: last7Days.map(d => ({ value: d.exp })),
            profit: last7Days.map(d => ({ value: d.sales - d.cost - d.exp }))
        };

    };

    const statTrends = getStatTrends();

    const distributionData = [
        { name: 'Net Profit', value: Math.max(stats.netProfit, 0), color: 'var(--primary)' },
        { name: 'COGS', value: stats.cogs, color: '#94a3b8' },
        { name: 'Expenses', value: stats.expenseTotal, color: '#cbd5e1' },
    ];




    // Combine recent activity
    const recentPurchases = purchases.map(p => ({ ...p, type: 'PO', date: p.date, amount: p.totalAmount, id: p.id, status: p.status }));
    const recentWastage = wastage.map(w => ({ ...w, type: 'Wastage', date: w.date, amount: w.cost, id: w.id, status: w.reason }));
    const activity = [...recentPurchases, ...recentWastage].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    const lowStockCount = inventory.filter(i => i.totalStock < 20).length;

    // Dynamic Percentages
    const cogsPercent = stats.totalRevenue > 0 ? ((stats.cogs / stats.totalRevenue) * 100).toFixed(1) : 0;
    const grossProfit = stats.totalRevenue - stats.cogs;
    const grossMargin = stats.totalRevenue > 0 ? ((grossProfit / stats.totalRevenue) * 100).toFixed(1) : 0;
    const netMargin = stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0;



    return (
        <div style={{ paddingBottom: '40px' }}>
            {/* Header ... */}
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {user?.role === 'admin' ? (
                            <span className="badge" style={{ background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '2px 8px' }}>ADMINISTRATOR</span>
                        ) : (
                            <span className="badge" style={{ background: 'var(--success)', color: 'white', fontSize: '0.6rem', padding: '2px 8px' }}>STORE OPERATIONS</span>
                        )}
                    </div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.04em', color: 'var(--text-main)' }}>
                        {user?.role === 'admin' ? 'Enterprise Command Center' : `${selectedStore?.name} Dashboard`}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <div className="pulse-indicator"></div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '500' }}>
                            {user?.role === 'admin' ? `Managing ${stores.length} Outlets` : `${selectedStore?.location || 'London'} Outlet • Live Activity`}
                        </p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {user?.role === 'admin' && (
                        <div className="hide-on-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: '16px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>TOTAL PORTFOLIO REVENUE</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{businessInfo.currency}{storeStats.sales.toLocaleString()}</span>
                        </div>
                    )}
                    <label className="btn btn-primary" style={{ cursor: 'pointer', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {uploading ? <RefreshCw className="animate-spin" size={18} /> : <FileUp size={18} />}
                        <span>{uploading ? 'Processing...' : 'Import Data'}</span>
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            style={{ display: 'none' }} 
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span className="badge" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)', padding: '6px 12px', fontWeight: '800' }}>
                            <TrendingUp size={12} /> {grossMargin}% GROSS
                        </span>
                        <span className="badge badge-success" style={{ padding: '6px 12px', fontWeight: '800' }}>
                            <TrendingUp size={12} /> {netMargin}% NET
                        </span>
                    </div>
                </div>
            </div>



            {/* Stats Grid */}
            <div className="dashboard-grid">
                <div className="stat-card glass-panel animate-fade-in delay-100">
                    <div className="stat-info">
                        <h3>Total Sales (Revenue)</h3>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Money coming in from all customer orders</p>
                        <p className="text-primary" style={{ color: 'var(--primary)' }}>
                            {businessInfo.currency}{stats.totalRevenue > 0 ? stats.totalRevenue.toFixed(0) : storeStats.sales.toFixed(0)}
                        </p>
                        <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ArrowUpRight size={12} strokeWidth={3} /> {stats.totalRevenue > 0 ? 'Local Sales' : 'Imported Multi-Store'}
                        </span>
                    </div>
                    <Sparkline data={statTrends.sales} color="var(--primary)" />
                </div>

                <div className="stat-card glass-panel animate-fade-in delay-200">
                    <div className="stat-info">
                        <h3>Inventory Costs (COGS)</h3>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Money spent on food and ingredients</p>
                        <p style={{ color: 'var(--text-main)' }}>{businessInfo.currency}{stats.cogs.toFixed(0)}</p>
                        <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <PieChart size={12} /> {cogsPercent}% Cost Ratio
                        </span>
                    </div>
                    <Sparkline data={statTrends.cogs} color="var(--text-muted)" />
                </div>

                <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <div className="stat-info">
                        <h3>Operating Expenses</h3>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Rent, electricity, wages, and other bills</p>
                        <p style={{ color: 'var(--text-main)' }}>{businessInfo.currency}{stats.expenseTotal.toFixed(0)}</p>
                        <span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CreditCard size={12} /> OPEX Analysis
                        </span>
                    </div>
                    <Sparkline data={statTrends.expenses} color="var(--text-muted)" />
                </div>

                <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '400ms' }}>
                    <div className="stat-info">
                        <h3>True Net Profit</h3>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Money kept after all costs are paid</p>
                        <p className={stats.netProfit >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: '800' }}>{businessInfo.currency}{stats.netProfit.toFixed(0)}</p>
                        <span style={{ fontSize: '0.7rem', color: stats.netProfit >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {stats.netProfit >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {stats.netProfit >= 0 ? 'Growth Record' : 'Operational Loss'}
                        </span>
                    </div>
                    <Sparkline data={statTrends.profit} color={stats.netProfit >= 0 ? 'var(--success)' : 'var(--primary)'} />
                </div>



            </div>

            {/* Dashboard Bottom Grid: Activity & Alerts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div className="glass-panel" style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Recent Operations Log</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>View All</span>
                    </div>
                    <table className="custom-table" style={{ minWidth: 'auto' }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Amt</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activity.map((act, index) => (
                                <tr key={`${act.type}-${act.id}`} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                    <td style={{ fontWeight: '700' }}>{act.id}</td>
                                    <td>
                                        <span className={`badge ${act.type === 'PO' ? 'badge-primary' : 'badge-danger'}`}>
                                            {act.type}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '700' }}>{businessInfo.currency}{act.amount.toFixed(0)}</td>
                                    <td><span className="badge badge-warning">{act.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="glass-panel" style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={16} /> Critical Alerts
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {lowStockCount === 0 ? (
                            <div style={{ padding: '16px', background: 'var(--bg-card-hover)', textAlign: 'center', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No critical alerts.</p>
                            </div>
                        ) : inventory.filter(p => p.totalStock < 20).map((product) => (
                            <div key={product.id} style={{
                                padding: '10px 14px', background: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.08)', borderRadius: 'var(--radius-sm)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '700', fontSize: '0.8rem' }}>{product.name}</span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Low: {Math.round(product.totalStock)}</span>
                                </div>
                                <button
                                    onClick={() => navigate('/purchases')}
                                    className="btn btn-outline"
                                    style={{ padding: '4px 8px', fontSize: '0.65rem', height: 'auto', color: 'var(--danger)' }}
                                >
                                    REORDER
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Section Moved to End */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
                <div className="glass-panel animate-fade-in delay-100" style={{ padding: '16px', height: '320px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>Weekly Sales Trend</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue vs Wastage impact</p>
                    </div>
                    <div style={{ flex: 1, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(value) => `${businessInfo.currency}${value}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px', fontSize: '12px' }}
                                    formatter={(value) => [`${businessInfo.currency}${value}`, '']}
                                />
                                <Area type="monotone" dataKey="sales" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                                <Area type="monotone" dataKey="loss" stroke="var(--text-muted)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />

                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel animate-fade-in delay-200" style={{ padding: '16px', height: '320px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>Cost Distribution</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allocation of capital</p>
                    </div>
                    <div style={{ flex: 1, width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distributionData} layout="vertical" margin={{ left: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} width={80} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-card-hover)', radius: 8 }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                    formatter={(value) => [`${businessInfo.currency}${value.toFixed(0)}`, 'Amt']}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
}
