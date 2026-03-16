import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Trash2, AlertCircle, Plus, Search, Filter } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Wastage() {
    const { user, wastage: allWastage, filteredWastage: contextFilteredWastage, filteredInventory: inventory, logWastage, deleteWastage, deleteMultipleWastage, businessInfo, selectedStore, stores } = useAppContext();
    const wastage = user?.role === 'admin' ? allWastage : contextFilteredWastage;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRaw, setSelectedRaw] = useState('');
    const [wasteQty, setWasteQty] = useState('');
    const [reason, setReason] = useState('');
    const [wasteDate, setWasteDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [storeFilter, setStoreFilter] = useState(selectedStore?.id === 'ALL' ? 'All' : selectedStore?.id);

    // Sync with global selectedStore
    React.useEffect(() => {
        if (selectedStore?.id === 'ALL') {
            setStoreFilter('All');
        } else {
            setStoreFilter(selectedStore?.id);
        }
    }, [selectedStore, stores]);
    const [selectedIds, setSelectedIds] = useState([]);

    const filteredWastage = React.useMemo(() => {
        return wastage.filter(log => {
            const item = inventory.find(i => i.id === log.rawId);
            const matchesSearch = 
                (log.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (item?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesStore = storeFilter === 'All' || log.storeId === storeFilter;
            return matchesSearch && matchesStore;
        });
    }, [wastage, searchTerm, inventory, storeFilter]);

    // Deletion Modal State
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const openDeleteModal = (id) => {
        setDeleteId(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deleteId === 'bulk') {
            deleteMultipleWastage(selectedIds);
            setSelectedIds([]);
        } else if (deleteId) {
            deleteWastage(deleteId);
            setSelectedIds(prev => prev.filter(id => id !== deleteId));
        }
        setDeleteModalOpen(false);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredWastage.map(log => log.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleWastage = (e) => {
        e.preventDefault();
        if (!selectedRaw || !wasteQty || !reason) return;

        const success = logWastage({
            rawId: parseInt(selectedRaw),
            qty: parseFloat(wasteQty),
            reason,
            date: wasteDate || undefined
        });

        if (success) {
            setModalOpen(false);
            setSelectedRaw('');
            setWasteQty('');
            setReason('');
            setWasteDate(new Date().toISOString().split('T')[0]);
        } else {
            alert("Cannot log wastage greater than total stock!");
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {user?.role === 'admin' ? (
                            <span className="badge" style={{ background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '2px 8px' }}>FINANCIAL LEAKAGE</span>
                        ) : (
                            <span className="badge" style={{ background: 'var(--danger)', color: 'white', fontSize: '0.6rem', padding: '2px 8px' }}>STOCK SHRINKAGE</span>
                        )}
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {user?.role === 'admin' ? 'Network Shrinkage & Loss' : 'Wastage & Damages'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        {user?.role === 'admin' ? 'Monitoring inventory valuation loss across all outlets' : 'Log damages and expired inventory for accurate stock tracking'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {selectedIds.length > 0 && (
                        <button 
                            className="btn btn-danger" 
                            onClick={() => {
                                setDeleteId('bulk');
                                setDeleteModalOpen(true);
                            }}
                            style={{ background: 'var(--danger)', color: 'white' }}
                        >
                            <Trash2 size={18} />
                            <span>Delete Selected ({selectedIds.length})</span>
                        </button>
                    )}
                    <div className="search-bar" style={{ width: '280px' }}>
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search wastage logs..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-danger" onClick={() => setModalOpen(true)}>
                        <Plus size={18} />
                        <span>Log Wastage</span>
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px' }}>Recent Wastage Logs</h3>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>
                                <input 
                                    type="checkbox" 
                                    className="custom-checkbox"
                                    checked={filteredWastage.length > 0 && selectedIds.length === filteredWastage.length}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th>Log ID</th>
                            <th>Date</th>
                            <th>Material Wasted</th>
                            <th>Quantity</th>
                            <th>Cost Implication</th>
                            <th>Reason</th>
                            <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredWastage.map((log) => {
                            const item = inventory.find(i => i.id === log.rawId);
                            return (
                                <tr key={log.id} style={{ background: selectedIds.includes(log.id) ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            className="custom-checkbox"
                                            checked={selectedIds.includes(log.id)}
                                            onChange={() => handleSelectRow(log.id)}
                                        />
                                    </td>
                                    <td style={{ fontWeight: '500', color: 'var(--danger)' }}>{log.id}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{log.date}</td>
                                    <td style={{ fontWeight: '700' }}>{item ? item.name : 'Unknown Material'}</td>
                                    <td>{log.qty} {item ? item.unit : ''}</td>
                                    <td style={{ fontWeight: '600', color: 'var(--danger)' }}>{businessInfo.currency}{log.cost.toFixed(2)}</td>
                                    <td><span className="badge badge-warning">{log.reason}</span></td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button
                                            onClick={() => openDeleteModal(log.id)}
                                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                            className="action-hover-danger"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredWastage.length === 0 && (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '32px' }}>No wastage logs found. Great efficiency!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Log Damaged / Expired Item</h2>
                            <button className="close-btn" onClick={() => setModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>

                        <form onSubmit={handleWastage}>
                            <div className="input-group">
                                <label>Select Raw Material</label>
                                <select className="input-control" value={selectedRaw} onChange={e => setSelectedRaw(e.target.value)} required>
                                    <option value="" disabled>-- Choose Item --</option>
                                    {inventory.map(i => (
                                        <option key={i.id} value={i.id}>{i.name} (Stock: {i.totalStock} {i.unit})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label>Quantity Wasted</label>
                                <input type="number" step="0.01" min="0.01" className="input-control" value={wasteQty} onChange={e => setWasteQty(e.target.value)} required />
                            </div>

                            <div className="input-group">
                                <label>Date of Wastage</label>
                                <input type="date" className="input-control" value={wasteDate} onChange={e => setWasteDate(e.target.value)} required />
                            </div>

                            <div className="input-group">
                                <label>Reason for Wastage</label>
                                <select className="input-control" value={reason} onChange={e => setReason(e.target.value)} required>
                                    <option value="" disabled>-- Select Reason --</option>
                                    <option value="Expired">Expired (FEFO Missed)</option>
                                    <option value="Damaged in handling">Damaged in handling</option>
                                    <option value="QC Failed Post Receive">QC Failed Post Receive</option>
                                    <option value="Theft / Unknown Loss">Theft / Unknown Loss</option>
                                </select>
                            </div>

                            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-danger">
                                    <AlertCircle size={18} /> Confirm Deduct
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={deleteId === 'bulk' ? `Delete ${selectedIds.length} Records?` : "Remove Wastage Record?"}
                message={deleteId === 'bulk' 
                    ? `Are you sure you want to delete these ${selectedIds.length} records? Stock levels will be restored for all selected items.`
                    : "Are you sure you want to delete this record? The stock levels for this item will be restored to your inventory."}
                confirmText={deleteId === 'bulk' ? "Yes, Delete All" : "Yes, Delete"}
            />
        </div>
    );
}
