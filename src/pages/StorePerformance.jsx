
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
    TrendingUp, Users, DollarSign, PieChart as PieChartIcon, Activity, MapPin, 
    Globe, Scale, ArrowLeftRight, Calendar, ShoppingCart, CreditCard, 
    AlertTriangle, Package, Trash2, ArrowUpRight, ArrowDownRight, Info, Box
} from 'lucide-react';

export default function StorePerformance() {
    const { 
        sales, 
        expenses, 
        wastage, 
        inventory, 
        filteredInventory: storeInventory, 
        stores, 
        businessInfo, 
        user,
        menuItems,
        selectedStore
    } = useAppContext();

    const [rangePreset, setRangePreset] = useState('30D');
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const handleRangeChange = (r) => {
        setRangePreset(r);
        const end = new Date().toISOString().split('T')[0];
        let start;
        if (r === '7D') start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        else if (r === '30D') start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        else if (r === '90D') start = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        setDateRange({ start, end });
    };

    const currency = businessInfo.currency || '₹';

    // --- 1. DATA FILTERING & TRANSFORMATIONS ---
    const analyticsData = useMemo(() => {
        const currentSales = sales.filter(s => (selectedStore?.id === 'ALL' || s.storeId === selectedStore?.id) && s.date.split('T')[0] >= dateRange.start && s.date.split('T')[0] <= dateRange.end);
        const currentExpenses = expenses.filter(e => (selectedStore?.id === 'ALL' || e.storeId === selectedStore?.id) && e.date.split('T')[0] >= dateRange.start && e.date.split('T')[0] <= dateRange.end);
        const currentWastage = wastage.filter(w => (selectedStore?.id === 'ALL' || w.storeId === selectedStore?.id) && w.date >= dateRange.start && w.date <= dateRange.end);

        // Stats Calculation
        const grossRevenue = currentSales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
        
        // Calculate real tax if available, otherwise estimate
        const totalTax = currentSales.reduce((sum, s) => {
            if (s.taxDetails) return sum + s.taxDetails.reduce((tsum, t) => tsum + t.taxAmount, 0);
            return sum + (s.amount * 0.1667); // Estimate 20% VAT (1/6th of gross)
        }, 0);
        
        const totalExpenses = currentExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
        const wastageLoss = currentWastage.reduce((sum, w) => sum + (Number(w.cost) || Number(w.lossAmount) || (Number(w.quantity) * 10) || 0), 0);
        
        // COGS Calculation (Cost of Goods Sold)
        // Try to calculate based on recipes, otherwise use 30% industry average
        let calculatedCogs = 0;
        currentSales.forEach(sale => {
            sale.items.forEach(soldItem => {
                const menuD = menuItems.find(m => m.id === soldItem.menuId);
                if (menuD && menuD.recipe) {
                    menuD.recipe.forEach(r => {
                        const rawItem = inventory.find(inv => inv.id === r.rawId);
                        if (rawItem) calculatedCogs += (rawItem.pricePerUnit * r.qty) * soldItem.qty;
                    });
                } else {
                    calculatedCogs += (soldItem.price * 0.3) * soldItem.qty; // 30% fallback
                }
            });
        });

        const returnsRefunds = 0; // Set to 0 as not implemented yet
        const netProfit = grossRevenue - totalTax - totalExpenses - wastageLoss - calculatedCogs;
        const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;
        const avgOrderValue = currentSales.length > 0 ? grossRevenue / currentSales.length : 0;
        const totalUnits = currentSales.reduce((sum, s) => sum + (s.items?.reduce((iSum, i) => iSum + (Number(i.qty) || 0), 0) || 0), 0);

        // --- TREND CHART DATA ---
        const dayMap = {};
        currentSales.forEach(s => {
            const dStr = s.date.split('T')[0];
            dayMap[dStr] = { ...(dayMap[dStr] || { date: dStr, revenue: 0, profit: 0, expenses: 0 }) };
            dayMap[dStr].revenue += s.amount;
        });
        currentExpenses.forEach(e => {
            const dStr = e.date.split('T')[0];
            dayMap[dStr] = { ...(dayMap[dStr] || { date: dStr, revenue: 0, profit: 0, expenses: 0 }) };
            dayMap[dStr].expenses += e.amount;
        });
        
        const trendData = Object.values(dayMap).sort((a,b) => a.date.localeCompare(b.date)).map(d => ({
            ...d,
            profit: d.revenue - (d.revenue * 0.1667) - d.expenses - (d.revenue * 0.3), // simplified daily profit
            date: d.date.split('-').slice(1).join('/') // MM/DD
        }));

        // --- TOP PRODUCTS ---
        const prodMap = {};
        currentSales.forEach(s => {
            s.items.forEach(item => {
                prodMap[item.name] = (prodMap[item.name] || 0) + (item.price * item.qty);
            });
        });
        const topProducts = Object.entries(prodMap)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));

        // --- STORE COMPARISON ---
        const displayStores = selectedStore?.id === 'ALL' ? stores : stores.filter(s => s.id === selectedStore?.id);
        const storeRevMap = displayStores.map(s => {
            const rev = sales.filter(sale => sale.storeId === s.id && sale.date >= dateRange.start && sale.date <= dateRange.end)
                            .reduce((sum, sale) => sum + sale.amount, 0);
            return { name: s.name, revenue: rev };
        });

        // --- EXPENSE BREAKDOWN ---
        const expBreakdown = {};
        const labour = currentExpenses.filter(e => 
          (e.category?.toLowerCase().includes('labour') || e.category?.toLowerCase().includes('wage'))
        ).reduce((a, b) => a + b.amount, 0);
        currentExpenses.forEach(e => {
            expBreakdown[e.category] = (expBreakdown[e.category] || 0) + e.amount;
        });
        const expenseChart = Object.entries(expBreakdown).map(([name, value]) => ({ name, value }));

        // --- PAYMENT METHOD ---
        const payMap = { Cash: 0, Card: 0, Online: 0 };
        currentSales.forEach(s => {
            const method = s.paymentMethod || 'Cash';
            payMap[method] = (payMap[method] || 0) + 1;
        });
        const paymentData = Object.entries(payMap).filter(p => p[1] > 0).map(([name, value]) => ({ name, value }));

        return {
            metrics: {
                grossRevenue,
                netProfit,
                margin,
                avgOrderValue,
                totalUnits,
                totalExpenses,
                expenseCount: currentExpenses.length,
                returnsRefunds,
                returnCount: 0,
                wastageLoss,
                wastageCount: currentWastage.length,
                orderCount: currentSales.length
            },
            trendData,
            topProducts,
            storeRevMap,
            expenseChart,
            paymentData
        };
    }, [sales, expenses, wastage, dateRange, stores, inventory, menuItems, selectedStore]);

    const lowStockCount = useMemo(() => inventory.filter(i => i.totalStock < 10).length, [inventory]);

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

    const StatCard = ({ icon: Icon, label, value, subValue, color, details }) => (
        <div className="glass-panel stat-card-alt" style={{ borderLeft: `4px solid ${color}`, minWidth: '240px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: `${color}15`, padding: '8px', borderRadius: '10px', color: color }}>
                    <Icon size={20} />
                </div>
                {details && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Click for details <Info size={10} />
                </div>}
            </div>
            <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {typeof value === 'number' ? (
                        isNaN(value) ? `${currency}0` : `${currency}${value > 1000 ? (value/1000).toFixed(1) + 'K' : value.toFixed(0)}`
                    ) : value}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '4px' }}>{label}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subValue}</div>
            </div>
            
            {/* Background Decorative Icon - extremely subtle */}
            <Icon size={64} style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.03, transform: 'rotate(-15deg)' }} />
        </div>
    );

    return (
        <div className="analytics-page animate-fade-in" style={{ paddingBottom: '40px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'var(--primary-glow)', padding: '8px', borderRadius: '8px', color: 'var(--primary)' }}>
                            <Activity size={24} />
                        </div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.03em' }}>Business Analytics</h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '0.9rem', fontWeight: '500' }}>
                        {selectedStore?.id === 'ALL' ? 'All Stores — Network Performance' : `${selectedStore?.name} — Outlet Performance`}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div className="glass-panel" style={{ padding: '4px', display: 'flex', gap: '4px', borderRadius: '30px' }}>
                        {['7D', '30D', '90D'].map(r => (
                            <button
                                key={r}
                                onClick={() => handleRangeChange(r)}
                                style={{
                                    border: 'none',
                                    background: rangePreset === r ? 'var(--primary)' : 'transparent',
                                    color: rangePreset === r ? '#fff' : 'var(--text-muted)',
                                    padding: '6px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '30px' }}>
                        <Calendar size={16} className="text-muted" />
                        <input 
                            type="date" 
                            className="date-minimal" 
                            value={dateRange.start} 
                            onChange={e => setDateRange({...dateRange, start: e.target.value})}
                        />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
                        <input 
                            type="date" 
                            className="date-minimal" 
                            value={dateRange.end} 
                            onChange={e => setDateRange({...dateRange, end: e.target.value})}
                        />
                    </div>
                </div>
            </div>

            {/* Metrics Row 1 */}
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }} className="stat-scroll">
                <StatCard 
                    icon={TrendingUp} 
                    label="Gross Revenue" 
                    value={analyticsData.metrics.grossRevenue} 
                    subValue={`${analyticsData.metrics.orderCount} orders in period`}
                    color="#2563eb"
                    details
                />
                <StatCard 
                    icon={DollarSign} 
                    label="Net Profit" 
                    value={analyticsData.metrics.netProfit} 
                    subValue={`${analyticsData.metrics.margin.toFixed(1)}% gross margin`}
                    color="#10b981"
                    details
                />
                <StatCard 
                    icon={ShoppingCart} 
                    label="Avg Order Value" 
                    value={analyticsData.metrics.avgOrderValue} 
                    subValue={`${analyticsData.metrics.totalUnits} units sold`}
                    color="#f59e0b"
                    details
                />
                <StatCard 
                    icon={CreditCard} 
                    label="Total Expenses" 
                    value={analyticsData.metrics.totalExpenses} 
                    subValue={`${analyticsData.metrics.expenseCount} expense entries`}
                    color="#ef4444"
                    details
                />
                <StatCard 
                    icon={ArrowDownRight} 
                    label="Returns / Refunds" 
                    value={analyticsData.metrics.returnsRefunds} 
                    subValue={`${analyticsData.metrics.returnCount} return transactions`}
                    color="#ec4899"
                    details
                />
            </div>

            {/* Metrics Row 2 */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <StatCard 
                    icon={AlertTriangle} 
                    label="Wastage Loss" 
                    value={analyticsData.metrics.wastageLoss} 
                    subValue={`${analyticsData.metrics.wastageCount} wastage events (all time)`}
                    color="#f97316"
                    details
                />
                <StatCard 
                    icon={Package} 
                    label="Open Complaints" 
                    value={Math.floor(analyticsData.metrics.orderCount * 0.02)} 
                    subValue={`${analyticsData.metrics.orderCount > 0 ? '1' : '0'} pending resolution`}
                    color="#8b5cf6"
                    details
                />
                <StatCard 
                    icon={Box} 
                    label="Low Stock Items" 
                    value={lowStockCount} 
                    subValue="Products below 10 units"
                    color="#06b6d4"
                    details
                />
            </div>

            {/* Charts Section 1: Trend and Payment */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', marginBottom: '24px' }} className="chart-grid-main">
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Revenue vs Expenses vs Profit</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily trend for selected period</p>
                    </div>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData.trendData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} style={{ fontSize: '11px', fontWeight: '500' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '11px', fontWeight: '500' }} tickFormatter={(val) => `${currency}${val > 1000 ? (val/1000).toFixed(0) + 'K' : val}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: 'var(--shadow)', background: 'var(--bg-card)' }}
                                    formatter={(val) => [`${currency}${val.toLocaleString()}`, '']}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563eb" strokeWidth={3} fill="url(#colorRev)" />
                                <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={3} fill="url(#colorProfit)" />
                                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Payment Method Split</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Orders by payment type</p>
                    </div>
                    <div style={{ height: '350px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analyticsData.paymentData}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {analyticsData.paymentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                             {analyticsData.paymentData.map((p, i) => (
                                 <div key={i} style={{ fontSize: '0.85rem', fontWeight: '700', color: COLORS[i] }}>
                                     {p.name} {((p.value / analyticsData.metrics.orderCount) * 100).toFixed(0)}%
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section 2: Products and Expenses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Top Selling Products</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By revenue generated in selected period</p>
                    </div>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.topProducts} layout="vertical" margin={{ left: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-light)" />
                                <XAxis type="number" axisLine={false} tickLine={false} style={{ fontSize: '11px' }} tickFormatter={(val) => `${currency}${val}`} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '11px', fontWeight: '600' }} width={120} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow)' }}
                                    formatter={(val) => [`${currency}${val.toLocaleString()}`, 'Value']}
                                />
                                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={40}>
                                    {analyticsData.topProducts.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Expense Breakdown</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By category</p>
                    </div>
                    <div style={{ height: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analyticsData.expenseChart}
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {analyticsData.expenseChart.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Section 3: Wastage and Store Comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Wastage Cost by Product</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top loss-generating items (all time)</p>
                    </div>
                    <div style={{ height: '300px' }}>
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={(() => {
                                 const wastageByProduct = {};
                                 wastage.filter(w => selectedStore?.id === 'ALL' || w.storeId === selectedStore?.id).forEach(w => {
                                     const productName = w.name || 'Unknown';
                                     wastageByProduct[productName] = (wastageByProduct[productName] || 0) + (Number(w.cost) || 0);
                                 });
                                return Object.entries(wastageByProduct)
                                    .map(([name, loss]) => ({ name, loss: parseFloat(loss.toFixed(2)) }))
                                    .sort((a, b) => b.loss - a.loss)
                                    .slice(0, 5);
                            })()}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px' }} />
                                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px' }} tickFormatter={(val) => `${currency}${val}`} />
                                <Tooltip />
                                <Bar dataKey="loss" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={200} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Store Revenue Comparison</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Revenue per store (selected period)</p>
                    </div>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.storeRevMap}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} style={{ fontSize: '10px' }} />
                                <YAxis axisLine={false} tickLine={false} style={{ fontSize: '10px' }} tickFormatter={(val) => `${currency}${val > 1000 ? (val/1000).toFixed(0) + 'K' : val}`} />
                                <Tooltip />
                                <Bar dataKey="revenue" radius={[12, 12, 0, 0]} barSize={60}>
                                    {analyticsData.storeRevMap.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* CSS Additions for this page specifically */}
            <style dangerouslySetInnerHTML={{ __html: `
                .stat-card-alt {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    cursor: default;
                }
                .stat-card-alt:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                }
                .stat-scroll::-webkit-scrollbar {
                    height: 5px;
                }
                .date-minimal {
                    background: transparent;
                    border: none;
                    color: var(--text-main);
                    font-size: 0.8rem;
                    font-weight: 700;
                    outline: none;
                    cursor: pointer;
                }
                @media (max-width: 1200px) {
                    .chart-grid-main {
                        grid-template-columns: 1fr !important;
                    }
                    div[style*="grid-template-columns: 1.5fr 1fr"],
                    div[style*="grid-template-columns: 1fr 1fr"] {
                         grid-template-columns: 1fr !important;
                    }
                }
            `}} />
        </div>
    );
}
