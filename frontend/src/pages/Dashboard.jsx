import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAuthStore,
  usePaymentStore,
  useDeviceStore,
  useActivityStore,
} from "../store/index";
import {
  paymentService,
  activityService,
  deviceService,
} from "../services/api";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user } = useAuthStore();
  const { stats } = usePaymentStore();
  const { devices } = useDeviceStore();
  const { activities } = useActivityStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashStats, setDashStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, devicesRes, activitiesRes] = await Promise.all([
        paymentService.getStats(),
        deviceService.getAll(),
        activityService.getLog({ limit: 10 }),
      ]);

      setDashStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Payments</h3>
          <p className="stat-value">{dashStats?.totalPayments || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Completed Payments</h3>
          <p className="stat-value">{dashStats?.completedPayments || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">₱{dashStats?.totalRevenue || 0}</p>
        </div>
      </div>

      <div className="quick-actions">
        <button onClick={() => navigate("/payments")}>View Payments</button>
        <button onClick={() => navigate("/vouchers")}>Manage Vouchers</button>
        <button onClick={() => navigate("/devices")}>Manage Devices</button>
        <button onClick={() => navigate("/activity")}>View Activity</button>
      </div>
    </div>
  );
}
