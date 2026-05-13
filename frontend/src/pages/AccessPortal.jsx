import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getBackendUrl } from "../config/api";
import "../styles/access.css";

export default function AccessPortal() {
  const [searchParams] = useSearchParams();
  const [accessStatus, setAccessStatus] = useState(null);
  const [macAddress, setMacAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const backendUrl = getBackendUrl();

  useEffect(() => {
    // Get MAC address from URL parameter or generate one
    const mac = searchParams.get("mac") || generateMacAddress();
    setMacAddress(mac);
    checkAccess(mac);
  }, []);

  const generateMacAddress = () => {
    // In real scenario, this comes from device/router
    return (
      "AA:BB:CC:DD:" +
      Math.random().toString(16).slice(2, 4).toUpperCase() +
      ":" +
      Math.random().toString(16).slice(2, 4).toUpperCase()
    );
  };

  const checkAccess = async (mac) => {
    try {
      const response = await fetch(
        `${backendUrl}/api/access/status/${mac}`,
      );
      const data = await response.json();
      setAccessStatus(data);

      if (data.timeRemaining > 0) {
        setTimeRemaining(data.timeRemaining);
      }
    } catch (error) {
      console.error("Error checking access:", error);
      setAccessStatus({
        status: "ERROR",
        description: "Unable to verify access status",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="access-portal-container">
        <div className="access-card">
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }

  if (accessStatus?.status === "GRANTED") {
    return (
      <div className="access-portal-container granted">
        <div className="access-card success-card">
          <div className="status-icon">✓</div>
          <h1>Access Granted</h1>
          <p className="description">{accessStatus.description}</p>

          <div className="session-info">
            <div className="info-item">
              <span className="label">Time Remaining:</span>
              <span className="value">{formatTime(timeRemaining)}</span>
            </div>
            <div className="info-item">
              <span className="label">Device MAC:</span>
              <span className="value mac">{macAddress}</span>
            </div>
            <div className="info-item">
              <span className="label">Package:</span>
              <span className="value">
                ₱{accessStatus.session?.amount} -{" "}
                {accessStatus.session?.duration}min
              </span>
            </div>
          </div>

          <p className="redirect-text">
            Redirecting to internet in 3 seconds...
          </p>
        </div>
      </div>
    );
  }

  if (accessStatus?.status === "RESTRICTED") {
    return (
      <div className="access-portal-container restricted">
        <div className="access-card restricted-card">
          <div className="status-icon warning">🔒</div>
          <h1>Access Restricted</h1>
          <p className="description">{accessStatus.description}</p>

          <div className="restriction-info">
            <p className="info-title">Why is my internet restricted?</p>
            <ul className="info-list">
              <li>Your device does not have an active internet session</li>
              <li>Previous session has expired</li>
              <li>Payment confirmation is required to proceed</li>
            </ul>
          </div>

          <div className="device-info">
            <p>
              <strong>Device MAC Address:</strong>
            </p>
            <p className="mac-address">{macAddress}</p>
            <p className="mac-note">
              This MAC address will be registered once you complete payment
            </p>
          </div>

          <a href="/" className="btn-purchase">
            Purchase Internet Access
          </a>

          <p className="footer-text">
            By purchasing an internet package, your device will automatically be
            registered and will receive internet access until your session
            expires.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="access-portal-container">
      <div className="access-card error-card">
        <div className="status-icon error">⚠️</div>
        <h1>Error</h1>
        <p className="description">
          {accessStatus?.description || "Unable to verify access status"}
        </p>
        <a href="/" className="btn-retry">
          Retry
        </a>
      </div>
    </div>
  );
}
