import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Search, CheckCircle, XCircle, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

class PurchasesErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Purchases page error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--danger, red)' }}>Something went wrong loading Purchases</h2>
                    <p style={{ color: 'var(--text-muted, #666)', marginTop: '12px' }}>{this.state.error?.message}</p>
                    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => this.setState({ hasError: false, error: null })}>Try Again</button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function Purchases() {
    return (
        <PurchasesErrorBoundary>
            <PurchasesContent />
        </PurchasesErrorBoundary>
    );
}

function PurchasesContent() {
    const { user, purchases: allPurchases, filteredPurchases: contextFilteredPurchases, vendors, filteredInventory: inventory, processPurchase, businessInfo, stores, selectedStore } = useAppContext();
    const purchases = user?.role === 'admin' ? allPurchases : contextFilteredPurchases;
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setModalOpen] = useState(false);
    const [storeFilter, setStoreFilter] = useState(selectedStore?.id === 'ALL' ? 'All' : selectedStore?.id);

    // Sync with global selectedStore
    useEffect(() => {
        if (selectedStore?.id === 'ALL') {
            setStoreFilter('All');
        } else {
            setStoreFilter(selectedStore?.id);
        }
    }, [selectedStore, stores]);

    // GRN Form State
    const [vendorId, setVendorId] = useState('');
    const [qcStatus, setQcStatus] = useState('Received-QC-Pass');
    const [rawId, setRawId] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitCost, setUnitCost] = useState('');
    const [batchNo, setBatchNo] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cart, setCart] = useState([]);

    // Filter materials based on selected vendor category
    const selectedVendor = vendors.find(v => v.id === vendorId);
    const filteredMaterials = (selectedVendor && selectedVendor.category)
        ? inventory.filter(i => i.category === selectedVendor.category)
        : inventory;

    // Auto-fill Unit Cost when material is selected
    useEffect(() => {
        if (rawId) {
            const item = inventory.find(i => i.id === parseInt(rawId));
            if (item) setUnitCost(item.pricePerUnit);
        } else {
            setUnitCost('');
        }
    }, [rawId, inventory]);

    // File Upload State
    const fileInputRef = useRef(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'array' });
                const wsname = wb.SheetNames[0];
                const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

                if (data.length === 0) {
                    alert("The file appears to be empty.");
                    return;
                }

                let successCount = 0;
                let failCount = 0;

                data.forEach(row => {
                    // Robust field mapping
                    const rowKeys = Object.keys(row);
                    const getValue = (possibleNames) => {
                        const key = rowKeys.find(k => possibleNames.includes(k.toLowerCase().replace(/[^a-z]/g, '')));
                        return key ? row[key] : null;
                    };

                    const vId = getValue(['vendorid', 'vid', 'vendor']);
                    const vName = getValue(['vendorname', 'vendor', 'supplier']);
                    const iId = getValue(['itemid', 'materialid', 'rawid', 'id']);
                    const iName = getValue(['itemname', 'materialname', 'name', 'material']);
                    const qty = getValue(['qty', 'quantity', 'amount']);
                    const cost = getValue(['unitcost', 'cost', 'price', 'rate']);
                    const bNo = getValue(['batchno', 'batch', 'batchid']);
                    const exp = getValue(['expirydate', 'expiry', 'expdate']);

                    const vendor = vendors.find(v => 
                        (vId && v.id === String(vId)) || 
                        (vName && v.name.toLowerCase() === String(vName).toLowerCase())
                    );

                    const item = inventory.find(i => 
                        (iId && i.id === parseInt(iId)) || 
                        (iName && i.name.toLowerCase() === String(iName).toLowerCase())
                    );

                    if (item && vendor) {
                        const finalQty = parseFloat(qty) || 1;
                        const finalCost = parseFloat(cost) || item.pricePerUnit;
                        const generatedBatchNo = bNo || `B-IMP-${Math.floor(Math.random() * 1000)}`;
                        const generatedExpiry = exp || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

                        processPurchase({
                            vendorId: vendor.id,
                            status: 'Received-QC-Pass',
                            totalAmount: finalQty * finalCost,
                            items: [{
                                rawId: item.id, name: item.name, qty: finalQty, unitCost: finalCost,
                                batchNo: generatedBatchNo,
                                expiryDate: generatedExpiry
                            }]
                        });
                        successCount++;
                    } else {
                        failCount++;
                    }
                });

                alert(`Procurement Bulk Import Complete.\nSuccess: ${successCount}\nFailed: ${failCount} (Due to invalid vendor/material)`);
            } catch (err) {
                console.error(err);
                alert("Error reading file. Make sure it's a valid CSV or Excel file.");
            } finally {
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const filteredPurchases = useMemo(() => {
        return purchases.filter(p => {
            const vendor = vendors.find(v => v.id === p.vendorId);
            const matchesSearch = 
                (p.id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (vendor?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase());
            const matchesStore = storeFilter === 'All' || p.storeId === storeFilter;
            return matchesSearch && matchesStore;
        });
    }, [purchases, searchTerm, vendors, storeFilter]);

    const getPoTotal = () => cart.reduce((acc, item) => acc + (item.unitCost * item.qty), 0);

    const addToGrn = () => {
        if (!rawId || !quantity || !unitCost || !batchNo || !expiryDate) return;
        const item = inventory.find(i => i.id === parseInt(rawId));
        setCart([...cart, {
            rawId: parseInt(rawId), name: item.name,
            qty: parseFloat(quantity), unitCost: parseFloat(unitCost),
            batchNo, expiryDate
        }]);
        setRawId(''); setQuantity(''); setUnitCost(''); setBatchNo(''); setExpiryDate('');
    };

    const removeGrnItem = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const submitGRN = (e) => {
        e.preventDefault();
        if (cart.length === 0 || !vendorId) return;

        processPurchase({
            vendorId,
            status: qcStatus,
            totalAmount: getPoTotal(),
            items: cart
        });

        setModalOpen(false);
        setVendorId('');
        setQcStatus('Received-QC-Pass');
        setCart([]);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {user?.role === 'admin' ? (
                            <span className="badge" style={{ background: 'var(--primary)', color: 'white', fontSize: '0.6rem', padding: '2px 8px' }}>SUPPLY CHAIN & VENDORS</span>
                        ) : (
                            <span className="badge" style={{ background: 'var(--success)', color: 'white', fontSize: '0.6rem', padding: '2px 8px' }}>GOODS RECEIPT</span>
                        )}
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {user?.role === 'admin' ? 'Procurement & Vendor relations' : 'Procurement & GRN Module'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                        {user?.role === 'admin' ? 'Strategic sourcing and accounts payable management' : 'Goods Receipt Note, Vendor Management and Batch Allocations'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="search-bar" style={{ width: '280px' }}>
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by PO# or Vendor..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {user?.role === 'admin' && (
                        <select 
                            className="input-control" 
                            style={{ width: '150px', padding: '4px 8px', fontSize: '0.8rem' }}
                            value={storeFilter}
                            onChange={(e) => setStoreFilter(e.target.value)}
                        >
                            <option value="All">All Stores</option>
                            {stores.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    )}
                    <input
                        type="file"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload size={18} />
                        <span>Upload XLSX/CSV</span>
                    </button>
                    <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                        <Plus size={18} />
                        <span>New GRN / PO Entry</span>
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>PO Number</th>
                            <th>Date</th>
                            <th>Vendor</th>
                            <th>Vendor VAT ID</th>
                            <th>Batches Inward</th>
                            <th>Total Invoice</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPurchases.map((purchase) => {
                            const vendor = vendors.find(v => v.id === purchase.vendorId);
                            return (
                                <tr key={purchase.id}>
                                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>{purchase.id}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{new Date(purchase.date).toLocaleDateString()}</td>
                                    <td style={{ fontWeight: '700' }}>{vendor ? vendor.name : 'Unknown Vendor'}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{vendor?.vatId || 'N/A'}</td>
                                    <td style={{ fontSize: '0.85rem' }}>
                                        {(purchase.items || []).map((it, i) => (
                                            <div key={i}>{it.qty}x {it.name} (Batch: {it.batchNo})</div>
                                        ))}
                                    </td>
                                    <td style={{ fontWeight: '700' }}>{businessInfo.currency}{(purchase.totalAmount || 0).toFixed(2)}</td>
                                </tr>
                            );
                        })}
                        {filteredPurchases.length === 0 && (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>No procurements historically matching criteria.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className="modal-header">
                            <h2>Goods Receipt Note (GRN)</h2>
                            <button className="close-btn" onClick={() => setModalOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Plus size={24} style={{ transform: 'rotate(45deg)' }} />
                            </button>
                        </div>

                        <form onSubmit={submitGRN}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="input-group">
                                    <label>Select Vendor</label>
                                    <select className="input-control" value={vendorId} onChange={e => setVendorId(e.target.value)} required>
                                        <option value="" disabled>-- Vendor --</option>
                                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name} (VAT: {v.vatId})</option>)}
                                    </select>
                                    {vendorId && (
                                        <p style={{ fontSize: '0.75rem', marginTop: '4px', color: 'var(--primary)' }}>
                                            Selected VAT ID: {vendors.find(v => v.id === vendorId)?.vatId}
                                        </p>
                                    )}
                                </div>
                                <div className="input-group">
                                    <label>QC / Temperature Check Status</label>
                                    <select className="input-control" value={qcStatus} onChange={e => setQcStatus(e.target.value)} required>
                                        <option value="Received-QC-Pass">Received - QC Passed (Add Stock)</option>
                                        <option value="Received-QC-Fail">Received - QC Failed (Reject Stock)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px', padding: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', background: 'var(--bg-card-hover)' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '16px' }}>Add Material to Invoice</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '8px' }}>
                                    <select className="input-control" value={rawId} onChange={e => setRawId(e.target.value)}>
                                        <option value="">-- Material --</option>
                                        {filteredMaterials.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                                    </select>
                                    <input type="number" step="1" className="input-control" placeholder="Quantity" value={quantity} onChange={e => setQuantity(e.target.value)} style={{ padding: '6px 12px' }} />
                                    <input type="number" step="0.01" className="input-control" placeholder={`Unit Cost (${businessInfo.currency})`} value={unitCost} onChange={e => setUnitCost(e.target.value)} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginTop: '8px' }}>
                                    <input type="text" className="input-control" placeholder="Batch No (e.g. B-098)" value={batchNo} onChange={e => setBatchNo(e.target.value)} />
                                    <input type="date" className="input-control" placeholder="Expiry Date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
                                    <button type="button" className="btn btn-primary" onClick={addToGrn}>Add Item</button>
                                </div>
                            </div>

                            {cart.length > 0 && (
                                <div style={{ marginTop: '24px' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px' }}>Invoice Lines</h3>
                                    {cart.map((c, index) => (
                                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid var(--border-light)', fontSize: '0.85rem' }}>
                                            <span>{c.qty}x {c.name} (Batch: {c.batchNo}, Exp: {c.expiryDate})</span>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                <span style={{ fontWeight: '700' }}>{businessInfo.currency}{(c.qty * c.unitCost).toFixed(2)}</span>
                                                <button type="button" onClick={() => removeGrnItem(index)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                    <Plus size={16} style={{ transform: 'rotate(45deg)' }} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ textAlign: 'right', marginTop: '16px', fontWeight: '700', fontSize: '1.2rem', color: 'var(--primary)' }}>
                                        Total Invoice: {businessInfo.currency}{getPoTotal().toFixed(2)}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-success" disabled={cart.length === 0 || !vendorId}>
                                    <CheckCircle size={18} /> Complete GRN Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
