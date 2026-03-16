import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, LayoutDashboard, ShoppingCart, Truck, Box, Trash2, CreditCard, PieChart, Users, Settings, Plus, Terminal } from 'lucide-react';

const ACTIONS = [
    { id: 'dash', title: 'Go to Dashboard', icon: <LayoutDashboard size={18} />, link: '/', category: 'Navigation' },
    { id: 'pos', title: 'Open POS / Sales', icon: <ShoppingCart size={18} />, link: '/sales', category: 'Navigation' },
    { id: 'grn', title: 'Manage Purchases (GRN)', icon: <Truck size={18} />, link: '/purchases', category: 'Navigation' },
    { id: 'inv', title: 'Inventory Control', icon: <Box size={18} />, link: '/inventory', category: 'Navigation' },
    { id: 'wast', title: 'Wastage Logging', icon: <Trash2 size={18} />, link: '/wastage', category: 'Navigation' },
    { id: 'exp', title: 'Expense Tracking', icon: <CreditCard size={18} />, link: '/expenses', category: 'Navigation' },
    { id: 'rep', title: 'Reports & Analytics', icon: <PieChart size={18} />, link: '/reports', category: 'Navigation' },
    { id: 'crm', title: 'CRM & Customers', icon: <Users size={18} />, link: '/customers', category: 'Navigation' },
    { id: 'sett', title: 'System Settings', icon: <Settings size={18} />, link: '/settings', category: 'Navigation' },

    { id: 'new-sale', title: 'Create New Sale', icon: <Plus size={18} />, link: '/sales', category: 'Quick Actions' },
    { id: 'new-exp', title: 'Add New Expense', icon: <Plus size={18} />, link: '/expenses', category: 'Quick Actions' },
    { id: 'new-inv', title: 'Update Stock Levels', icon: <Plus size={18} />, link: '/inventory', category: 'Quick Actions' },
];

export default function CommandCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();

    const filteredActions = ACTIONS.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpen = useCallback(() => {
        setIsOpen(true);
        setSearch('');
        setSelectedIndex(0);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') handleClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleClose]);

    useEffect(() => {
        const handleNav = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredActions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredActions[selectedIndex]) {
                    navigate(filteredActions[selectedIndex].link);
                    handleClose();
                }
            }
        };

        window.addEventListener('keydown', handleNav);
        return () => window.removeEventListener('keydown', handleNav);
    }, [isOpen, filteredActions, selectedIndex, navigate, handleClose]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex',
                alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px'
            }}
            onClick={handleClose}
        >
            <div
                className="glass-panel animate-fade-in"
                style={{
                    width: '100%', maxWidth: '600px', background: 'var(--bg-card)',
                    borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)',
                    boxShadow: '0 30px 60px -12px rgba(0,0,0,0.4)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid var(--border)' }}>
                    <Search size={22} color="var(--primary)" />
                    <input
                        autoFocus
                        placeholder="Search actions, pages, or commands..."
                        style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            flex: 1, fontSize: '1.2rem', color: 'var(--text-main)',
                            fontWeight: '500'
                        }}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-card-hover)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: '700' }}>ESC</span>
                    </div>
                </div>

                <div style={{ maxHeight: '450px', overflowY: 'auto', padding: '10px' }}>
                    {filteredActions.length > 0 ? (
                        <>
                            {['Navigation', 'Quick Actions'].map(cat => {
                                const catActions = filteredActions.filter(a => a.category === cat);
                                if (catActions.length === 0) return null;

                                return (
                                    <div key={cat} style={{ marginBottom: '15px' }}>
                                        <div style={{ padding: '10px 15px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                                            {cat}
                                        </div>
                                        {catActions.map((action) => {
                                            const globalIdx = filteredActions.indexOf(action);
                                            const isSelected = globalIdx === selectedIndex;
                                            return (
                                                <div
                                                    key={action.id}
                                                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                                                    onClick={() => { navigate(action.link); handleClose(); }}
                                                    style={{
                                                        padding: '12px 15px', borderRadius: '12px', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '15px',
                                                        background: isSelected ? 'var(--primary-glow)' : 'transparent',
                                                        transition: 'all 0.15s ease',
                                                        border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                                                        transform: isSelected ? 'scale(1.02)' : 'none'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '10px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: isSelected ? 'var(--primary)' : 'var(--bg-card-hover)',
                                                        color: isSelected ? 'white' : 'var(--primary)',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        {action.icon}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '700', fontSize: '0.95rem', color: isSelected ? 'var(--text-main)' : 'var(--text-main)' }}>{action.title}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isSelected ? 'Press Enter to select' : `Jump to ${action.category}`}</div>
                                                    </div>
                                                    {isSelected && <Terminal size={14} color="var(--primary)" />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <div style={{
                                background: 'var(--bg-card-hover)', width: '64px', height: '64px',
                                borderRadius: '20px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 20px', color: 'var(--text-muted)'
                            }}>
                                <Search size={32} />
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>No commands found</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>Try searching something else like "POS" or "New Sale"</p>
                        </div>
                    )}
                </div>

                <div style={{ padding: '12px 20px', background: 'var(--bg-card-hover)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', gap: '2px', padding: '2px 4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                                <Plus size={10} style={{ transform: 'rotate(45deg)' }} />
                                <Plus size={10} style={{ transform: 'rotate(-135deg)' }} />
                            </span> Navigate
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span style={{ padding: '2px 4px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px' }}>ENTER</span> Select
                        </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>
                        <Command size={14} style={{ marginRight: '4px' }} /> COMMAND CENTER
                    </div>
                </div>
            </div>
        </div>
    );
}
