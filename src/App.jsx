import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import Inventory from "./pages/Inventory";
import Wastage from "./pages/Wastage";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Customers from "./pages/Customers";
import Vendors from "./pages/Vendors";
import Settings from "./pages/Settings";
import StorePerformance from "./pages/StorePerformance";
import Stores from "./pages/Stores";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { AppProvider, useAppContext } from "./context/AppContext";

function AppRoutes() {
  const { user } = useAppContext();

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route
        path="/signup"
        element={!user ? <Signup /> : <Navigate to="/" />}
      />

      <Route path="/" element={user ? <Layout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="sales" element={<Sales />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="wastage" element={<Wastage />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="customers" element={<Customers />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="settings" element={<Settings />} />
        <Route
          path="analytics"
          element={
            user?.role === "admin" ? <StorePerformance /> : <Navigate to="/" />
          }
        />
        <Route
          path="stores"
          element={user?.role === "admin" ? <Stores /> : <Navigate to="/" />}
        />
        <Route
          path="*"
          element={
            <div style={{ padding: "40px", textAlign: "center" }}>
              <h2>Page Coming Soon</h2>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}

export default App;
