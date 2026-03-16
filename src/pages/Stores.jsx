
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MapPin, Plus, Store, Navigation, ShieldCheck, Activity, Trash2, Globe } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Stores() {
    const { user, stores, setStores, selectedStore, setSelectedStore, businessInfo } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [newStore, setNewStore] = useState({ name: '', location: '', color: '#2563eb', currency: '£' });
    
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleAddStore = (e) => {
        e.preventDefault();
        const id = `S${stores.length + 1}`;
        setStores([...stores, { ...newStore, id }]);
        setModalOpen(false);
        setNewStore({ name: '', location: '', color: '#2563eb', currency: '£' });
    };

    const handleDelete = (id) => {
        setDeleteId(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        setStores(stores.filter(s => s.id !== deleteId));
        setDeleteModalOpen(false);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>Outlet Management</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Control and monitor all {businessInfo.name} physical locations</p>
                </div>
                {user?.role === 'admin' && (
                    <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                        <Plus size={18} /> Add New Outlet
                    </button>
                )}
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {stores.map(store => (
                    <div
                        key={store.id}
                        className={`glass-panel ${selectedStore.id === store.id ? 'active' : ''}`}
                        style={{
                            padding: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: selectedStore.id === store.id ? `2px solid ${store.color}` : '1px solid var(--border)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={() => setSelectedStore(store)}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '4px',
                            height: '100%',
                            background: store.color
                        }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ background: 'var(--bg-card-hover)', p: '12px', borderRadius: '12px', display: 'flex', padding: '10px' }}>
                                <Store size={24} style={{ color: store.color }} />
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {selectedStore.id === store.id && (
                                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active Session</span>
                                )}
                                {user?.role === 'admin' && (
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(store.id); }} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '4px' }}>{store.name}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                            <Navigation size={12} /> {store.location}
                        </p>
                        <p style={{ color: 'var(--primary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px', fontWeight: '600' }}>
                           <Globe size={12} /> Local Currency: {store.currency || businessInfo.currency}
                        </p>

                        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Health Status</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    <Activity size={14} /> 98% Optimized
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-outline"
                            style={{ width: '100%', marginTop: '20px', fontSize: '0.75rem' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStore(store);
                            }}
                        >
                            Select this Outlet
                        </button>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Add New Outlet</h2>
                            <button className="close-btn" onClick={() => setModalOpen(false)}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>
                        <form onSubmit={handleAddStore}>
                            <div className="input-group">
                                <label>Outlet Name</label>
                                <input
                                    type="text"
                                    className="input-control"
                                    placeholder="e.g. Paddington"
                                    value={newStore.name}
                                    onChange={e => setNewStore({ ...newStore, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    className="input-control"
                                    placeholder="e.g. Central London"
                                    value={newStore.location}
                                    onChange={e => setNewStore({ ...newStore, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label>Local Currency</label>
                                <select className="input-control" value={newStore.currency} onChange={e => setNewStore({ ...newStore, currency: e.target.value })}>
                                    <option value="£">£ (GBP)</option>
                                    <option value="$">$ (USD)</option>
                                    <option value="€">€ (EUR)</option>
                                    <option value="₹">₹ (INR)</option>
                                    <option value="AED">AED</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Brand Color</label>
                                <input
                                    type="color"
                                    className="input-control"
                                    style={{ height: '45px', padding: '4px' }}
                                    value={newStore.color}
                                    onChange={e => setNewStore({ ...newStore, color: e.target.value })}
                                />
                            </div>
                            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Register Outlet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog 
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Decommission Outlet?"
                message="Are you sure you want to remove this outlet? This will wipe all associated local data visibility. Action is permanent."
                confirmText="Delete Outlet"
            />
        </div>
    );
}
