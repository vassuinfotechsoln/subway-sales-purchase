import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Truck, Plus, Trash2, Edit, Search, Star, Phone, MapPin, Tag } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Vendors() {
    const { user, vendors, addVendor, updateVendor, deleteVendor } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);

    // Deletion Modal State
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    const openDeleteModal = (id) => {
        setDeleteId(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deleteId) deleteVendor(deleteId);
        setDeleteModalOpen(false);
    };

    // Form State
    const [formData, setFormData] = useState({ name: '', rating: 5, vatId: '', contact: '', address: '' });

    const handleOpenModal = (vendor = null) => {
        if (vendor) {
            setEditingVendor(vendor);
            setFormData({ ...vendor });
        } else {
            setEditingVendor(null);
            setFormData({ name: '', rating: 5, vatId: '', contact: '', address: '' });
        }
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingVendor) {
            updateVendor(formData);
        } else {
            addVendor(formData);
        }
        setModalOpen(false);
    };

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.vatId || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {user?.role === 'admin' ? (
                            <span className="badge" style={{ background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '2px 8px' }}>SUPPLY CHAIN</span>
                        ) : (
                            <span className="badge" style={{ background: 'var(--success)', color: 'white', fontSize: '0.6rem', padding: '2px 8px' }}>VENDORS</span>
                        )}
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {user?.role === 'admin' ? 'Procurement & Logistics Partners' : 'Supplier Management'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        {user?.role === 'admin' ? 'Managing global vendor relationships and procurement performance' : 'Maintain procurement relationship and performance tracking'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="search-bar" style={{ width: '250px' }}>
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Find vendor..."
                            className="search-input"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={18} />
                        <span>Add Supplier</span>
                    </button>
                </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {filteredVendors.map((vendor, index) => (
                    <div key={vendor.id} className="glass-panel animate-fade-in" style={{ padding: '24px', animationDelay: `${index * 50}ms`, position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                <Truck size={24} />
                            </div>
                            <div style={{ display: 'flex', gap: '4px', color: '#f1c40f' }}>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={i < Math.floor(vendor.rating) ? '#f1c40f' : 'none'} />
                                ))}
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>{vendor.name}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Tag size={14} /> VAT: {vendor.vatId}
                        </p>

                        <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                <Phone size={14} style={{ color: 'var(--primary)' }} /> {vendor.contact || 'N/A'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                                <MapPin size={14} style={{ color: 'var(--danger)' }} /> {vendor.address || 'N/A'}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
                            <button className="btn btn-outline" style={{ flex: 1, padding: '8px' }} onClick={() => handleOpenModal(vendor)}>
                                <Edit size={14} />
                            </button>
                            <button className="btn btn-outline" style={{ flex: 1, padding: '8px', color: 'var(--danger)' }} onClick={() => openDeleteModal(vendor.id)}>
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>{editingVendor ? 'Edit Supplier' : 'New Procurement Partner'}</h2>
                            <button className="close-btn" onClick={() => setModalOpen(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label>Business Name</label>
                                <input type="text" className="input-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Enter supplier name" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="input-group">
                                    <label>VAT Number</label>
                                    <input type="text" className="input-control" value={formData.vatId} onChange={e => setFormData({ ...formData, vatId: e.target.value })} required placeholder="Tax ID" />
                                </div>
                                <div className="input-group">
                                    <label>Performance Rating (1-5)</label>
                                    <input type="number" step="0.1" min="1" max="5" className="input-control" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })} required />
                                </div>
                            </div>

                            <div className="input-group">
                                <label>Contact Primary Number</label>
                                <input type="text" className="input-control" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} placeholder="+91 XXXX XXX XXX" />
                            </div>

                            <div className="input-group">
                                <label>Warehouse/Office Address</label>
                                <textarea className="input-control" rows="3" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address details"></textarea>
                            </div>

                            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                                    {editingVendor ? 'Save Updates' : 'Add Supplier'}
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
                title="Remove Supplier?"
                message={`Are you sure you want to remove this vendor? This will not delete past purchase history, but you won't be able to select them for new POs.`}
                confirmText="Remove Vendor"
            />
        </div>
    );
}
