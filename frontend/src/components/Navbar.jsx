import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/index";
import "../styles/navbar.css";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>Piso WiFi Admin</h1>
      </div>
      <ul className="navbar-menu">
        <li>
          <a href="/dashboard">Dashboard</a>
        </li>
        <li>
          <a href="/payments">Payments</a>
        </li>
        <li>
          <a href="/vouchers">Vouchers</a>
        </li>
        <li>
          <a href="/devices">Devices</a>
        </li>
        <li>
          <a href="/packages">Packages</a>
        </li>
        <li>
          <a href="/activity">Activity</a>
        </li>
        <li>
          <a href="/omada">Omada</a>
        </li>
      </ul>
      <div className="navbar-user">
        <span>{user?.name}</span>
        <button onClick={handleLogout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}
