import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerPortal from "./pages/CustomerPortal";
import AccessPortal from "./pages/AccessPortal";
import Dashboard from "./pages/Dashboard";
import Payments from "./pages/Payments";
import Vouchers from "./pages/Vouchers";
import Activity from "./pages/Activity";
import Devices from "./pages/Devices";
import Packages from "./pages/Packages";
import Navbar from "./components/Navbar";
import "./App.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<CustomerPortal />} />
          <Route path="/access" element={<AccessPortal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Dashboard />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Payments />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vouchers"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Vouchers />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Activity />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/devices"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Devices />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/packages"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Packages />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
