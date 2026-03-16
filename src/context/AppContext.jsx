import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
    // --- 0. AUTHENTICATION ---
    const [user, setUser] = useState(() => {
        const localUser = localStorage.getItem('vassu_user');
        const sessionUser = sessionStorage.getItem('vassu_user');
        const savedUser = localUser || sessionUser;
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [theme, setTheme] = useState(() => localStorage.getItem('vassu_theme') || 'light');

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('vassu_theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const [users, setUsers] = useState(() => {
        const savedUsers = localStorage.getItem('vassu_users');
        if (savedUsers) return JSON.parse(savedUsers);
        
        // Default Admin and Store Credentials
        return [
            { email: 'admin@vassu.com', password: 'admin123', name: 'Admin User', role: 'admin' },
            { email: 'bakerst@store.com', password: 'BakerSt@123', name: 'Baker St', role: 'store', storeId: 'S1' },
            { email: 'swisscottage@store.com', password: 'SwissCottage@123', name: 'Swiss Cottage', role: 'store', storeId: 'S2' },
            { email: 'camden@store.com', password: 'Camden@123', name: 'Camden', role: 'store', storeId: 'S3' },
            { email: 'haringey@store.com', password: 'Haringey@123', name: 'Haringey', role: 'store', storeId: 'S4' },
            { email: 'excel@store.com', password: 'Excel@123', name: 'Excel', role: 'store', storeId: 'S5' },
            { email: 'tottenham@store.com', password: 'Tottenham@123', name: 'Tottenham', role: 'store', storeId: 'S6' },
            { email: 'gallions@store.com', password: 'Gallions@123', name: 'Gallions', role: 'store', storeId: 'S7' },
            { email: 'victoria@store.com', password: 'Victoria@123', name: 'Victoria', role: 'store', storeId: 'S8' },
            { email: 'central17@store.com', password: 'Central17@123', name: '17 & Central', role: 'store', storeId: 'S9' },
            { email: 'hoestreet@store.com', password: 'Hoestreet@123', name: 'Hoestreet', role: 'store', storeId: 'S10' }
        ];
    });

    const login = (email, password, rememberMe = false) => {
        const foundUser = users.find(u => u.email === email && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            const userStr = JSON.stringify(foundUser);
            
            if (rememberMe) {
                localStorage.setItem('vassu_user', userStr);
            } else {
                sessionStorage.setItem('vassu_user', userStr);
            }
            
            // If store user, automatically switch to their store
            if (foundUser.role === 'store' && foundUser.storeId) {
                const store = stores.find(s => s.id === foundUser.storeId) || defaultStores.find(s => s.id === foundUser.storeId);
                if (store) {
                    setSelectedStore(store);
                    localStorage.setItem('vassu_selectedStore', JSON.stringify(store));
                }
            }
            return { success: true };
        }
        return { success: false, msg: 'Invalid email or password' };
    };

    const signup = (userData) => {
        if (users.find(u => u.email === userData.email)) {
            return { success: false, msg: 'User already exists' };
        }
        const newUsers = [...users, userData];
        setUsers(newUsers);
        localStorage.setItem('vassu_users', JSON.stringify(newUsers));
        setUser(userData);
        localStorage.setItem('vassu_user', JSON.stringify(userData));
        return { success: true };
    };

    const addUser = (userData) => {
        if (users.find(u => u.email === userData.email)) {
            return { success: false, msg: 'User already exists' };
        }
        const newUsers = [...users, userData];
        setUsers(newUsers);
        localStorage.setItem('vassu_users', JSON.stringify(newUsers));
        return { success: true };
    };

    const deleteUser = (email) => {
        if (email === user?.email) return { success: false, msg: 'Cannot delete logged in user' };
        const newUsers = users.filter(u => u.email !== email);
        setUsers(newUsers);
        localStorage.setItem('vassu_users', JSON.stringify(newUsers));
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('vassu_user');
        sessionStorage.removeItem('vassu_user');
    };

    // --- 1. DEFAULT DATA CONSTANTS ---
    const defaultInventory = [
        { id: 1, name: '9" Italian Bread', unit: 'Loaf', totalStock: 2450, pricePerUnit: 0.45, storeId: 'S1', category: 'Bakery', batches: [{ batchNo: 'B1', expiry: '2026-03-25', qty: 2450 }] },
        { id: 2, name: 'Sliced Pepperoni', unit: 'Kg', totalStock: 820, pricePerUnit: 8.50, storeId: 'S1', category: 'Meat', batches: [{ batchNo: 'B2', expiry: '2026-04-15', qty: 820 }] },
        { id: 3, name: 'Shredded Lettuce', unit: 'Kg', totalStock: 445, pricePerUnit: 2.20, storeId: 'S1', category: 'Produce', batches: [{ batchNo: 'B3', expiry: '2026-03-18', qty: 445 }] },
        { id: 4, name: 'Chicken Teriyaki Strips', unit: 'Kg', totalStock: 550, pricePerUnit: 12.50, storeId: 'S1', category: 'Meat', batches: [{ batchNo: 'B4', expiry: '2026-04-10', qty: 550 }] },
        { id: 5, name: 'Steak Strips', unit: 'Kg', totalStock: 440, pricePerUnit: 15.00, storeId: 'S1', category: 'Meat', batches: [{ batchNo: 'B5', expiry: '2026-04-12', qty: 440 }] },
        { id: 6, name: 'Meatballs', unit: 'Kg', totalStock: 330, pricePerUnit: 9.50, storeId: 'S1', category: 'Meat', batches: [{ batchNo: 'B6', expiry: '2026-04-05', qty: 330 }] },
        { id: 7, name: 'Marinara Sauce', unit: 'Litre', totalStock: 220, pricePerUnit: 4.20, storeId: 'S1', category: 'General', batches: [{ batchNo: 'B7', expiry: '2026-05-01', qty: 220 }] },
        { id: 8, name: 'Chipotle Southwest Sauce', unit: 'Litre', totalStock: 150, pricePerUnit: 5.80, storeId: 'S1', category: 'General', batches: [{ batchNo: 'B8', expiry: '2026-06-15', qty: 150 }] },
        { id: 9, name: 'Sliced Tomatoes', unit: 'Kg', totalStock: 250, pricePerUnit: 3.10, storeId: 'S1', category: 'Produce', batches: [{ batchNo: 'B9', expiry: '2026-03-22', qty: 250 }] },
        { id: 10, name: 'Sliced Cucumbers', unit: 'Kg', totalStock: 200, pricePerUnit: 2.80, storeId: 'S1', category: 'Produce', batches: [{ batchNo: 'B10', expiry: '2026-03-23', qty: 200 }] },
        { id: 11, name: 'Red Onions', unit: 'Kg', totalStock: 150, pricePerUnit: 2.50, storeId: 'S1', category: 'Produce', batches: [{ batchNo: 'B11', expiry: '2026-03-25', qty: 150 }] },
        { id: 12, name: 'Multi-seed Bread', unit: 'Loaf', totalStock: 2200, pricePerUnit: 0.55, storeId: 'S1', category: 'Bakery', batches: [{ batchNo: 'B12', expiry: '2026-03-28', qty: 2200 }] },
        { id: 13, name: 'American Cheese Slices', unit: 'Pack', totalStock: 660, pricePerUnit: 7.20, storeId: 'S1', category: 'Produce', batches: [{ batchNo: 'B13', expiry: '2026-04-30', qty: 660 }] }
    ];
    const defaultMenuItems = [
        { id: 1, name: 'Italian BMT (6")', category: 'Subs', price: 5.49, vatRate: 20, hsnCode: '2106', recipe: [{ rawId: 1, qty: 0.5 }, { rawId: 2, qty: 0.1 }] },
        { id: 2, name: 'Chicken Teriyaki (6")', category: 'Subs', price: 6.29, vatRate: 20, hsnCode: '2106', recipe: [{ rawId: 1, qty: 0.5 }] },
        { id: 3, name: 'Veggie Delite (6")', category: 'Subs', price: 4.89, vatRate: 20, hsnCode: '2106', recipe: [{ rawId: 1, qty: 0.5 }, { rawId: 3, qty: 0.05 }] },
        { id: 4, name: 'Steak & Cheese (6")', category: 'Subs', price: 7.49, vatRate: 20, hsnCode: '2106', recipe: [{ rawId: 5, qty: 0.2 }, { rawId: 6, qty: 0.1 }] },
        { id: 5, name: 'Double Choc Cookie', category: 'Sides', price: 1.29, vatRate: 20, hsnCode: '1905', recipe: [{ rawId: 15, qty: 1 }] },
        { id: 6, name: 'Raspberry Cheesecake Cookie', category: 'Sides', price: 1.29, vatRate: 20, hsnCode: '1905', recipe: [{ rawId: 15, qty: 1 }] },
        { id: 7, name: 'Pepsi Max (500ml)', category: 'Drinks', price: 1.99, vatRate: 20, hsnCode: '2202', recipe: [{ rawId: 16, qty: 1 }] },
        { id: 8, name: 'Tropicana Orange', category: 'Drinks', price: 2.49, vatRate: 20, hsnCode: '2202', recipe: [{ rawId: 16, qty: 1 }] }
    ];
    const defaultVendors = [
        { id: 'V1', name: 'Fresh Farms Produce', contact: 'John Smith', phone: '020 7123 4567', email: 'orders@freshlogistics.co.uk', category: 'Produce', vatId: '07AAAAA0000A1Z5' },
        { id: 'V2', name: 'Bakery Central', contact: 'Sarah Lane', phone: '020 8456 7890', email: 'account@bidfood.co.uk', category: 'Bakery', vatId: '07CCCCC0000C1Z5' },
        { id: 'V3', name: 'Premium Meats Co.', contact: 'Mike Ross', phone: '020 9876 5432', email: 'sales@premiummeats.co.uk', category: 'Meat', vatId: '07BBBBB0000B1Z5' },
        { id: 'V4', name: 'Subway Packaging UK', contact: 'Claire D.', phone: '020 3344 5566', email: 'packaging@subway.co.uk', category: 'Packaging', vatId: '07DDDDD0000D1Z5' },
        { id: 'V5', name: 'BevDirect', contact: 'Tom Wilson', phone: '020 1122 3344', email: 'tom@bevdirect.com', category: 'Beverages', vatId: '07EEEEE0000E1Z5' }
    ];
    const defaultPurchases = [
        { id: 'PO-654321', date: '2026-03-10T10:00:00Z', vendorId: 'V1', totalAmount: 450, status: 'Received-QC-Pass', storeId: 'S1', items: [{ rawId: 1, name: '9" Italian Bread', qty: 1000, batchNo: 'B100', expiryDate: '2026-04-01', unitCost: 0.45 }] },
        { id: 'PO-654322', date: '2026-03-11T11:00:00Z', vendorId: 'V2', totalAmount: 320, status: 'Received-QC-Pass', storeId: 'S2', items: [{ rawId: 12, name: 'Multi-seed Bread', qty: 500, batchNo: 'B101', expiryDate: '2026-04-05', unitCost: 0.55 }] },
        { id: 'PO-654323', date: '2026-03-12T09:30:00Z', vendorId: 'V3', totalAmount: 850, status: 'Received-QC-Pass', storeId: 'S1', items: [{ rawId: 2, name: 'Sliced Pepperoni', qty: 100, batchNo: 'B102', expiryDate: '2026-05-15', unitCost: 8.50 }] },
        { id: 'PO-654324', date: '2026-03-12T14:00:00Z', vendorId: 'V1', totalAmount: 600, status: 'Received-QC-Pass', storeId: 'S3', items: [{ rawId: 3, name: 'Shredded Lettuce', qty: 270, batchNo: 'B103', expiryDate: '2026-03-25', unitCost: 2.20 }] },
        { id: 'PO-654325', date: '2026-03-13T10:00:00Z', vendorId: 'V1', totalAmount: 500, status: 'Received-QC-Pass', storeId: 'S4', items: [{ rawId: 9, name: 'Sliced Tomatoes', qty: 160, batchNo: 'B104', expiryDate: '2026-03-22', unitCost: 3.10 }] },
        { id: 'PO-654326', date: '2026-03-13T11:30:00Z', vendorId: 'V2', totalAmount: 400, status: 'Received-QC-Pass', storeId: 'S5', items: [{ rawId: 12, name: 'Multi-seed Bread', qty: 720, batchNo: 'B105', expiryDate: '2026-04-10', unitCost: 0.55 }] },
        { id: 'PO-654327', date: '2026-03-14T09:00:00Z', vendorId: 'V3', totalAmount: 1200, status: 'Received-QC-Pass', storeId: 'S6', items: [{ rawId: 4, name: 'Chicken Teriyaki Strips', qty: 100, batchNo: 'B106', expiryDate: '2026-04-20', unitCost: 12.50 }] },
        { id: 'PO-654328', date: '2026-03-14T10:00:00Z', vendorId: 'V1', totalAmount: 300, status: 'Received-QC-Pass', storeId: 'S7', items: [{ rawId: 10, name: 'Sliced Cucumbers', qty: 110, batchNo: 'B107', expiryDate: '2026-03-23', unitCost: 2.80 }] },
        { id: 'PO-654329', date: '2026-03-14T12:00:00Z', vendorId: 'V2', totalAmount: 550, status: 'Received-QC-Pass', storeId: 'S8', items: [{ rawId: 1, name: '9" Italian Bread', qty: 1200, batchNo: 'B108', expiryDate: '2026-04-15', unitCost: 0.45 }] },
        { id: 'PO-654330', date: '2026-03-14T13:00:00Z', vendorId: 'V3', totalAmount: 900, status: 'Received-QC-Pass', storeId: 'S9', items: [{ rawId: 5, name: 'Steak Strips', qty: 60, batchNo: 'B109', expiryDate: '2026-04-25', unitCost: 15.00 }] },
        { id: 'PO-654331', date: '2026-03-14T15:00:00Z', vendorId: 'V1', totalAmount: 400, status: 'Received-QC-Pass', storeId: 'S10', items: [{ rawId: 11, name: 'Red Onions', qty: 160, batchNo: 'B110', expiryDate: '2026-03-30', unitCost: 2.50 }] }
    ];
    const defaultSales = [
        { id: 'ORD-123456', date: '2026-03-12T14:30:00Z', customer: 'Vassu Pro', amount: 4540.20, items: [{ menuId: 1, name: 'Italian BMT', qty: 800, price: 5.49 }], storeId: 'S1', paymentMethod: 'Cash' },
        { id: 'ORD-123457', date: '2026-03-12T15:15:00Z', customer: 'James Miller', amount: 8800.60, items: [{ menuId: 2, name: 'Chicken Teriyaki', qty: 1400, price: 6.29 }], storeId: 'S1', paymentMethod: 'Card' },
        { id: 'ORD-123458', date: '2026-03-13T12:00:00Z', customer: 'Emily Watson', amount: 11250.00, items: [{ menuId: 1, name: 'Italian BMT', qty: 1200, price: 5.49 }, { menuId: 3, name: 'Veggie Delite', qty: 800, price: 4.89 }], storeId: 'S2', paymentMethod: 'Online' },
        { id: 'ORD-123459', date: '2026-03-14T10:30:00Z', customer: 'Deliveroo Guest', amount: 12580.00, items: [{ menuId: 2, name: 'Chicken Teriyaki', qty: 2000, price: 6.29 }], storeId: 'S1', paymentMethod: 'Card' },
        { id: 'ORD-123460', date: '2026-03-14T11:45:00Z', customer: 'Robert Chen', amount: 6550.00, items: [{ menuId: 3, name: 'Veggie Delite', qty: 1300, price: 4.89 }], storeId: 'S3', paymentMethod: 'Cash' },
        { id: 'ORD-123461', date: '2026-03-14T13:20:00Z', customer: 'Sophia Lane', amount: 9420.00, items: [{ menuId: 1, name: 'Italian BMT', qty: 1000, price: 5.49 }, { menuId: 2, name: 'Chicken Teriyaki', qty: 600, price: 6.29 }], storeId: 'S1', paymentMethod: 'Card' },
        { id: 'ORD-123462', date: '2026-03-14T14:00:00Z', customer: 'UberEats Guest', amount: 5200.00, items: [{ menuId: 1, name: 'Italian BMT', qty: 940, price: 5.49 }], storeId: 'S4', paymentMethod: 'Card' },
        { id: 'ORD-123463', date: '2026-03-14T14:30:00Z', customer: 'Vassu Pro', amount: 7300.00, items: [{ menuId: 2, name: 'Chicken Teriyaki', qty: 1160, price: 6.29 }], storeId: 'S5', paymentMethod: 'Cash' },
        { id: 'ORD-123464', date: '2026-03-14T15:00:00Z', customer: 'Daniel Craig', amount: 10400.00, items: [{ menuId: 1, name: 'Italian BMT', qty: 1890, price: 5.49 }], storeId: 'S6', paymentMethod: 'Card' },
        { id: 'ORD-123465', date: '2026-03-14T15:30:00Z', customer: 'Sarah Connor', amount: 6800.00, items: [{ menuId: 2, name: 'Chicken Teriyaki', qty: 1080, price: 6.29 }], storeId: 'S7', paymentMethod: 'Card' },
        { id: 'ORD-123466', date: '2026-03-14T16:00:00Z', customer: 'John Wick', amount: 8900.00, items: [{ menuId: 1, name: 'Italian BMT', qty: 1620, price: 5.49 }], storeId: 'S8', paymentMethod: 'Cash' },
        { id: 'ORD-123467', date: '2026-03-14T16:30:00Z', customer: 'James Miller', amount: 11500.00, items: [{ menuId: 3, name: 'Veggie Delite', qty: 2350, price: 4.89 }], storeId: 'S9', paymentMethod: 'Card' },
        { id: 'ORD-123468', date: '2026-03-14T17:00:00Z', customer: 'Tommy Shelby', amount: 4900.00, items: [{ menuId: 2, name: 'Chicken Teriyaki', qty: 780, price: 6.29 }], storeId: 'S10', paymentMethod: 'Cash' }
    ];
    const defaultWastage = [
        { id: 'WST-001', name: '9" Italian Bread', qty: 2, cost: 0.90, reason: 'Broken/Damaged', date: '2026-03-13', storeId: 'S1', rawId: 1 },
        { id: 'WST-002', name: 'Shredded Lettuce', qty: 1, cost: 2.20, reason: 'Expired', date: '2026-03-14', storeId: 'S1', rawId: 3 },
        { id: 'WST-003', name: 'Sliced Pepperoni', qty: 1.5, cost: 12.75, reason: 'Contaminated', date: '2026-03-14', storeId: 'S2', rawId: 2 },
        { id: 'WST-004', name: 'Veggie Patty', qty: 4, cost: 8.40, reason: 'Dropped', date: '2026-03-14', storeId: 'S3', rawId: 14 }
    ];
    const defaultExpenses = [
        { id: 'EXP-101', title: 'Weekly Electricity', category: 'Utilities', amount: 150, date: '2026-03-10T09:00:00Z', storeId: 'S1' },
        { id: 'EXP-102', title: 'Water Bill', category: 'Utilities', amount: 45, date: '2026-03-11T09:00:00Z', storeId: 'S1' },
        { id: 'EXP-103', title: 'Store Rent', category: 'Operating', amount: 500, date: '2026-03-12T09:00:00Z', storeId: 'S1' },
        { id: 'EXP-104', title: 'Weekly Electricity', category: 'Utilities', amount: 140, date: '2026-03-10T09:00:00Z', storeId: 'S2' },
        { id: 'EXP-105', title: 'Store Rent', category: 'Operating', amount: 480, date: '2026-03-12T09:00:00Z', storeId: 'S2' },
        { id: 'EXP-106', title: 'Weekly Electricity', category: 'Utilities', amount: 160, date: '2026-03-10T09:00:00Z', storeId: 'S3' },
        { id: 'EXP-107', title: 'Store Rent', category: 'Operating', amount: 550, date: '2026-03-12T09:00:00Z', storeId: 'S3' },
        { id: 'EXP-108', title: 'Rent & Utilities', category: 'Operating', amount: 700, date: '2026-03-14T09:00:00Z', storeId: 'S4' },
        { id: 'EXP-109', title: 'Rent & Utilities', category: 'Operating', amount: 650, date: '2026-03-14T09:00:00Z', storeId: 'S5' },
        { id: 'EXP-110', title: 'Rent & Utilities', category: 'Operating', amount: 800, date: '2026-03-14T09:00:00Z', storeId: 'S6' },
        { id: 'EXP-111', title: 'Rent & Utilities', category: 'Operating', amount: 600, date: '2026-03-14T09:00:00Z', storeId: 'S7' },
        { id: 'EXP-112', title: 'Rent & Utilities', category: 'Operating', amount: 750, date: '2026-03-14T09:00:00Z', storeId: 'S8' },
        { id: 'EXP-113', title: 'Rent & Utilities', category: 'Operating', amount: 850, date: '2026-03-14T09:00:00Z', storeId: 'S9' },
        { id: 'EXP-114', title: 'Rent & Utilities', category: 'Operating', amount: 550, date: '2026-03-14T09:00:00Z', storeId: 'S10' }
    ];
    const defaultStorePerformance = [
        { id: 1, week: '29/12 To 04/01', sales: 6500, net: 5800, labour: 800, vat: 700, royalties: 360, foodCost: 1200, comm: 200, income: 2540 },
        { id: 2, week: '05/01 To 11/01', sales: 7200, net: 6400, labour: 900, vat: 800, royalties: 416, foodCost: 1400, comm: 250, income: 3434 },
        { id: 3, week: '12/01 To 18/01', sales: 8100, net: 7100, labour: 950, vat: 900, royalties: 480, foodCost: 1600, comm: 300, income: 3770 }
    ];
    const defaultStores = [
        { id: 'S1', name: 'BAKER ST', location: 'London', color: '#2563eb', currency: '£' },
        { id: 'S2', name: 'Swiss Cottage', location: 'London', color: '#7c3aed', currency: '£' },
        { id: 'S3', name: 'Camden', location: 'London', color: '#db2777', currency: '£' },
        { id: 'S4', name: 'Haringey', location: 'London', color: '#ea580c', currency: '£' },
        { id: 'S5', name: 'Excel', location: 'London', color: '#16a34a', currency: '£' },
        { id: 'S6', name: 'Tottenham', location: 'London', color: '#ca8a04', currency: '£' },
        { id: 'S7', name: 'Gallions', location: 'London', color: '#0891b2', currency: '£' },
        { id: 'S8', name: 'Victoria', location: 'London', color: '#4f46e5', currency: '£' },
        { id: 'S9', name: '17 & Central', location: 'London', color: '#be123c', currency: '£' },
        { id: 'S10', name: 'Hoestreet', location: 'London', color: '#15803d', currency: '£' }
    ];



    // --- 2. PERSISTENT STATE INITIALIZATION ---
    const DATA_VERSION = 'vassu_v_store_stable_v12';
    
    // Force clear old data if version mismatch - happens before component initialization
    const savedVersion = localStorage.getItem('vassu_data_version');
    if (savedVersion !== DATA_VERSION) {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('vassu_')) localStorage.removeItem(key);
        });
        localStorage.setItem('vassu_data_version', DATA_VERSION);
    }



    const getSaved = (key, defaultVal) => {
        const saved = localStorage.getItem(`vassu_${key}`);
        if (!saved || saved === 'undefined' || saved === 'null') return defaultVal;
        try {
            const parsed = JSON.parse(saved);
            return (parsed !== null && parsed !== undefined) ? parsed : defaultVal;
        } catch (e) {
            return defaultVal;
        }
    };


    const [inventory, setInventory] = useState(() => getSaved('inventory', defaultInventory));
    const [menuItems, setMenuItems] = useState(() => getSaved('menuItems', defaultMenuItems));
    const [vendors, setVendors] = useState(() => getSaved('vendors', defaultVendors));
    const [purchases, setPurchases] = useState(() => getSaved('purchases', defaultPurchases));
    const [sales, setSales] = useState(() => getSaved('sales', defaultSales));
    const [wastage, setWastage] = useState(() => getSaved('wastage', defaultWastage));
    const [expenses, setExpenses] = useState(() => getSaved('expenses', defaultExpenses));
    const [businessInfo, setBusinessInfo] = useState(() => getSaved('businessInfo', {
        name: 'My Business',
        outlet: 'Main Branch',
        taxId: 'Pending',
        currency: '£',
        email: ''
    }));
    const [storePerformance, setStorePerformance] = useState(() => {
        const saved = getSaved('storePerformance', defaultStorePerformance);
        return Array.isArray(saved) ? saved : defaultStorePerformance;
    });
    const [stores, setStores] = useState(() => {
        const saved = getSaved('stores', defaultStores);
        return Array.isArray(saved) && saved.length > 0 && typeof saved[0] === 'object' ? saved : defaultStores;
    });
    const [selectedStore, setSelectedStore] = useState(() => {
        const saved = getSaved('selectedStore', defaultStores[0]);
        // Ensure it's a valid object with an ID
        return (saved && saved.id) ? saved : defaultStores[0];
    });



    // Auto-save mechanisms
    useEffect(() => { localStorage.setItem('vassu_inventory', JSON.stringify(inventory)); }, [inventory]);
    useEffect(() => { localStorage.setItem('vassu_menuItems', JSON.stringify(menuItems)); }, [menuItems]);
    useEffect(() => { localStorage.setItem('vassu_purchases', JSON.stringify(purchases)); }, [purchases]);
    useEffect(() => { localStorage.setItem('vassu_sales', JSON.stringify(sales)); }, [sales]);
    useEffect(() => { localStorage.setItem('vassu_wastage', JSON.stringify(wastage)); }, [wastage]);
    useEffect(() => { localStorage.setItem('vassu_expenses', JSON.stringify(expenses)); }, [expenses]);
    useEffect(() => { localStorage.setItem('vassu_businessInfo', JSON.stringify(businessInfo)); }, [businessInfo]);
    useEffect(() => { localStorage.setItem('vassu_vendors', JSON.stringify(vendors)); }, [vendors]);
    useEffect(() => { localStorage.setItem('vassu_storePerformance', JSON.stringify(storePerformance)); }, [storePerformance]);
    useEffect(() => { localStorage.setItem('vassu_stores', JSON.stringify(stores)); }, [stores]);
    useEffect(() => { localStorage.setItem('vassu_selectedStore', JSON.stringify(selectedStore)); }, [selectedStore]);

    // --- CROSS-TAB SYNC ---
    // When admin updates data in one tab, store user tabs (same browser) auto-refresh
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (!e.key || !e.key.startsWith('vassu_') || !e.newValue) return;
            try {
                const newVal = JSON.parse(e.newValue);
                const syncMap = {
                    'vassu_inventory': setInventory,
                    'vassu_menuItems': setMenuItems,
                    'vassu_purchases': setPurchases,
                    'vassu_sales': setSales,
                    'vassu_wastage': setWastage,
                    'vassu_expenses': setExpenses,
                    'vassu_vendors': setVendors,
                    'vassu_businessInfo': setBusinessInfo,
                    'vassu_storePerformance': setStorePerformance,
                    'vassu_stores': setStores,
                };
                if (syncMap[e.key]) {
                    syncMap[e.key](newVal);
                }
            } catch (err) {
                // Ignore parse errors
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // --- 5. SYSTEM NOTIFICATIONS ---
    const [notifications, setNotifications] = useState([]);
    const [dismissedNotifications, setDismissedNotifications] = useState(() => {
        const saved = localStorage.getItem('vassu_dismissed_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('vassu_dismissed_notifications', JSON.stringify(dismissedNotifications));
    }, [dismissedNotifications]);

    // --- 6. DASHBOARD STATS ---
    const [stats, setStats] = useState({ totalRevenue: 0, cogs: 0, poTotal: 0, wastageCost: 0, expenseTotal: 0, netProfit: 0 });

    const filteredSales = useMemo(() => {
        if (!Array.isArray(sales)) return [];
        if (selectedStore?.id === 'ALL') return sales;
        return sales.filter(s => s.storeId === selectedStore?.id);
    }, [sales, selectedStore]);

    const filteredPurchases = useMemo(() => {
        if (!Array.isArray(purchases)) return [];
        if (selectedStore?.id === 'ALL') return purchases;
        return purchases.filter(p => p.storeId === selectedStore?.id);
    }, [purchases, selectedStore]);

    const filteredInventory = useMemo(() => {
        if (!Array.isArray(inventory)) return [];
        if (selectedStore?.id === 'ALL') return inventory;
        return inventory.filter(i => i.storeId === selectedStore?.id);
    }, [inventory, selectedStore]);

    const filteredWastage = useMemo(() => {
        if (!Array.isArray(wastage)) return [];
        if (selectedStore?.id === 'ALL') return wastage;
        return wastage.filter(w => w.storeId === selectedStore?.id);
    }, [wastage, selectedStore]);

    const filteredExpenses = useMemo(() => {
        if (!Array.isArray(expenses)) return [];
        if (selectedStore?.id === 'ALL') return expenses;
        return expenses.filter(e => e.storeId === selectedStore?.id);
    }, [expenses, selectedStore]);

    useEffect(() => {
        // Calculate Stats
        const totalRev = filteredSales.reduce((acc, sale) => acc + sale.amount, 0);
        let totalCogs = 0;
        filteredSales.forEach(sale => {
            sale.items.forEach(soldItem => {
                const menuD = menuItems.find(m => m.id === soldItem.menuId);
                if (menuD) {
                    menuD.recipe.forEach(r => {
                        const rawItem = filteredInventory.find(inv => inv.id === r.rawId);
                        if (rawItem) totalCogs += (rawItem.pricePerUnit * r.qty) * soldItem.qty;
                    });
                }
            });
        });

        const poCost = filteredPurchases.filter(p => p.status === 'Received-QC-Pass').reduce((acc, po) => acc + po.totalAmount, 0);
        const wCost = filteredWastage.reduce((acc, w) => acc + w.cost, 0);
        const exTotal = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);


        setStats({
            totalRevenue: totalRev,
            cogs: totalCogs,
            poTotal: poCost,
            wastageCost: wCost,
            expenseTotal: exTotal,
            netProfit: totalRev - totalCogs - wCost - exTotal
        });

        // Check for Low Stock & Expiry Notifications
        const generatedNotifications = [];

        // 1. Low Stock Alerts
        inventory.filter(item => item.totalStock < 20).forEach(item => {
            generatedNotifications.push({
                id: `LOW-${item.id}`,
                title: 'Low Stock Alert',
                message: `${item.name} is running low (${item.totalStock} ${item.unit} left)`,
                type: 'warning',
                date: new Date().toISOString()
            });
        });

        // 2. Expiry Alerts (Within 48 hours)
        const now = new Date();
        const twoDaysLater = new Date(now.getTime() + (48 * 60 * 60 * 1000));

        inventory.forEach(item => {
            item.batches.forEach(batch => {
                const expiryDate = new Date(batch.expiry);
                if (expiryDate <= twoDaysLater && batch.qty > 0) {
                    generatedNotifications.push({
                        id: `EXP-${item.id}-${batch.batchNo}`,
                        title: 'Critical Expiry Warning',
                        message: `${item.name} (Batch ${batch.batchNo}) expires on ${batch.expiry}!`,
                        type: 'danger',
                        date: new Date().toISOString()
                    });
                }
            });
        });

        // Filter out dismissed notifications
        const activeNotifications = generatedNotifications.filter(n => !dismissedNotifications.includes(n.id));
        setNotifications(activeNotifications);
    }, [filteredSales, filteredPurchases, filteredWastage, filteredInventory, menuItems, filteredExpenses, dismissedNotifications, selectedStore]);


    // Notification Actions
    const dismissNotification = (id) => {
        setDismissedNotifications(prev => [...new Set([...prev, id])]);
    };

    const clearAllNotifications = () => {
        const allIds = notifications.map(n => n.id);
        setDismissedNotifications(prev => [...new Set([...prev, ...allIds])]);
    };

    // --- ACTIONS ---

    // A. Process Sale (POS Deducts BOM from Inventory using FEFO)
    const processSale = (newOrder) => {
        let stockValid = true;
        let requiredRaw = {};

        // 1. Calculate required raw materials
        newOrder.items.forEach(orderItem => {
            const menuItem = menuItems.find(m => m.id === orderItem.menuId);
            if (!menuItem) return;
            menuItem.recipe.forEach(recipeItem => {
                if (!requiredRaw[recipeItem.rawId]) requiredRaw[recipeItem.rawId] = 0;
                requiredRaw[recipeItem.rawId] += (recipeItem.qty * orderItem.qty);
            });
        });


        // 2. Validate Inventory
        const updatedInventory = JSON.parse(JSON.stringify(inventory)); // Deep copy
        Object.keys(requiredRaw).forEach(rawId => {
            const item = updatedInventory.find(i => i.id === parseInt(rawId));
            if (!item || item.totalStock < requiredRaw[rawId]) stockValid = false;
            else {
                item.totalStock -= requiredRaw[rawId];
                // Deduct from batches (FEFO logic simplified by assuming sorted batches)
                let remainingToDeduct = requiredRaw[rawId];
                item.batches.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
                for (let b of item.batches) {
                    if (remainingToDeduct <= 0) break;
                    if (b.qty >= remainingToDeduct) {
                        b.qty -= remainingToDeduct;
                        remainingToDeduct = 0;
                    } else {
                        remainingToDeduct -= b.qty;
                        b.qty = 0;
                    }
                }
                item.batches = item.batches.filter(b => b.qty > 0);
            }
        });

        if (selectedStore?.id === 'ALL') return { success: false, msg: 'Please select a specific store for POS operations.' };

        setInventory(updatedInventory);

        // Calculate Tax Details if not present
        const calculatedOrder = {
            ...newOrder,
            taxDetails: newOrder.taxDetails || newOrder.items.map(it => {
                const menuItem = menuItems.find(m => m.id === it.menuId);
                const vat = menuItem?.vatRate || 0;
                const basePrice = it.price / (1 + vat / 100);
                return {
                    name: it.name,
                    qty: it.qty,
                    vatRate: vat,
                    taxAmount: it.price - basePrice,
                    hsn: menuItem?.hsnCode || 'N/A'
                };
            }),
            id: `ORD-${Date.now().toString().slice(-6)}`,
            date: new Date().toISOString(),
            storeId: selectedStore.id
        };

        setSales([calculatedOrder, ...sales]);

        return { success: true, order: calculatedOrder };
    };

    // B. Process Purchase
    const processPurchase = (po) => {
        if (selectedStore?.id === 'ALL') {
            alert('Cannot process purchase while "All Stores" is selected. Please pick a specific store.');
            return;
        }
        if (po.status === 'Received-QC-Pass') {
            const updatedInventory = [...inventory];
            po.items.forEach(poItem => {
                let item = updatedInventory.find(i => i.id === poItem.rawId && i.storeId === selectedStore.id);
                if (item) {
                    item.totalStock += poItem.qty;
                    item.batches.push({ batchNo: poItem.batchNo, expiry: poItem.expiryDate, qty: poItem.qty });
                }
            });
            setInventory(updatedInventory);
        }
        setPurchases([{ ...po, id: `PO-${Date.now().toString().slice(-6)}`, date: new Date().toISOString(), storeId: selectedStore.id }, ...purchases]);
    };


    const logWastage = (wasteRecord) => {
        const item = inventory.find(i => i.id === wasteRecord.rawId);
        if (item && item.totalStock >= wasteRecord.qty) {
            setInventory(inventory.map(inv => {
                if (inv.id === item.id) return { ...inv, totalStock: inv.totalStock - wasteRecord.qty };
                return inv;
            }));
            let dateToUse;
            if (wasteRecord.date) {
                // If a complete date string ISO is provided, split it to get just the date part if necessary
                // Usually input type="date" returns YYYY-MM-DD
                dateToUse = wasteRecord.date.includes('T') ? wasteRecord.date.split('T')[0] : wasteRecord.date;
            } else {
                dateToUse = new Date().toISOString().split('T')[0];
            }
            setWastage([{
                ...wasteRecord,
                id: `WST-${Date.now().toString().slice(-6)}`,
                cost: item.pricePerUnit * wasteRecord.qty,
                date: dateToUse,
                storeId: selectedStore.id
            }, ...wastage]);
            return true;
        }
        return false;
    };


    const deleteWastage = (id) => {
        const wasteToRemove = wastage.find(w => w.id === id);
        if (wasteToRemove) {
            // Restore inventory
            setInventory(inventory.map(inv => {
                if (inv.id === wasteToRemove.rawId) return { ...inv, totalStock: inv.totalStock + wasteToRemove.qty };
                return inv;
            }));
            setWastage(wastage.filter(w => w.id !== id));
        }
    };

    const deleteMultipleWastage = (ids) => {
        const wastesToRemove = wastage.filter(w => ids.includes(w.id));
        if (wastesToRemove.length > 0) {
            // Restore inventory for all items
            setInventory(prevInventory => prevInventory.map(inv => {
                const logsForItem = wastesToRemove.filter(w => w.rawId === inv.id);
                if (logsForItem.length > 0) {
                    const totalToRestore = logsForItem.reduce((sum, w) => sum + w.qty, 0);
                    return { ...inv, totalStock: inv.totalStock + totalToRestore };
                }
                return inv;
            }));
            setWastage(prevWastage => prevWastage.filter(w => !ids.includes(w.id)));
        }
    };

    // D. Add Expense
    const addExpense = (expense) => {
        setExpenses([{ ...expense, id: `EXP-${Date.now().toString().slice(-6)}`, date: expense.date || new Date().toISOString(), storeId: selectedStore.id }, ...expenses]);
    };


    const deleteExpense = (id) => {
        setExpenses(expenses.filter(e => e.id !== id));
    };

    const updateExpense = (updatedExpense) => {
        setExpenses(expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    };

    // E. Vendor Management
    const addVendor = (vendor) => {
        setVendors([{ ...vendor, id: `V-${Date.now().toString().slice(-4)}` }, ...vendors]);
    };

    const updateVendor = (updatedVendor) => {
        setVendors(vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v));
    };

    const deleteVendor = (id) => {
        setVendors(vendors.filter(v => v.id !== id));
    };

    // F. Update Business Info with Currency Conversion
    const updateBusiness = (info) => {
        const oldCurrency = businessInfo.currency;
        const newCurrency = info.currency;

        if (oldCurrency !== newCurrency) {
            const rates = {
                '£': 1.0,      // GBP
                '$': 1.27,     // USD
                '€': 1.18,     // EUR
                '₹': 106.0,    // INR
                'AED': 4.66    // AED
            };

            const oldRate = rates[oldCurrency] || 1;
            const newRate = rates[newCurrency] || 1;
            const factor = newRate / oldRate;

            // 1. Convert Inventory Prices
            setInventory(prev => prev.map(item => ({
                ...item,
                pricePerUnit: item.pricePerUnit * factor
            })));

            // 2. Convert Menu Item Prices
            setMenuItems(prev => prev.map(item => ({
                ...item,
                price: item.price * factor
            })));

            // 3. Convert Sales
            setSales(prev => prev.map(sale => ({
                ...sale,
                amount: sale.amount * factor,
                items: sale.items.map(it => ({ ...it, price: it.price * factor })),
                taxDetails: sale.taxDetails?.map(t => ({ ...t, taxAmount: t.taxAmount * factor }))
            })));

            // 4. Convert Purchases
            setPurchases(prev => prev.map(po => ({
                ...po,
                totalAmount: po.totalAmount * factor,
                items: po.items.map(it => ({ ...it, unitCost: it.unitCost * factor }))
            })));

            // 5. Convert Expenses
            setExpenses(prev => prev.map(exp => ({
                ...exp,
                amount: exp.amount * factor
            })));

            // 6. Convert Wastage
            setWastage(prev => prev.map(w => ({
                ...w,
                cost: w.cost * factor
            })));

            // 7. Convert Store Performance Metrics
            setStorePerformance(prev => prev.map(perf => ({
                ...perf,
                sales: perf.sales * factor,
                net: perf.net * factor,
                labour: perf.labour * factor,
                vat: perf.vat * factor,
                royalties: perf.royalties * factor,
                foodCost: perf.foodCost * factor,
                comm: perf.comm * factor,
                income: perf.income * factor
            })));
        }

        setBusinessInfo(info);
        return { success: true };
    };

    // G. Update User Profile
    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem('vassu_user', JSON.stringify(newUser));

        const updatedUsers = users.map(u => u.email === user.email ? { ...u, ...updatedData } : u);
        setUsers(updatedUsers);
        localStorage.setItem('vassu_users', JSON.stringify(updatedUsers));
        return { success: true };
    };

    // H. Reset System Data
    const resetData = () => {
        const keys = ['vassu_inventory', 'vassu_menuItems', 'vassu_purchases', 'vassu_sales', 'vassu_wastage', 'vassu_expenses', 'vassu_businessInfo', 'vassu_vendors', 'vassu_users'];
        keys.forEach(k => localStorage.removeItem(k));
        window.location.reload();
    };

    const resetLogs = () => {
        const keys = ['vassu_purchases', 'vassu_sales', 'vassu_wastage', 'vassu_expenses'];
        keys.forEach(k => localStorage.removeItem(k));
        window.location.reload();
    };

    return (
        <AppContext.Provider value={{
            user, users, login, signup, logout, resetData, resetLogs, updateUser, addUser, deleteUser,
            theme, toggleTheme,
            inventory, menuItems, vendors,
            sales, purchases, wastage, expenses,
            filteredSales, filteredPurchases, filteredInventory, filteredWastage, filteredExpenses,
            stats, notifications, businessInfo,
            storePerformance, stores, selectedStore, setSelectedStore,

            processSale, processPurchase, logWastage, deleteWastage, deleteMultipleWastage, addExpense, deleteExpense, updateExpense, updateBusiness,
            addVendor, updateVendor, deleteVendor, dismissNotification, clearAllNotifications,
            setStorePerformance, setStores
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}
