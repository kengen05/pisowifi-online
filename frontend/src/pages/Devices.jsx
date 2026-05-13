import React, { useEffect, useState } from "react";
import { deviceService } from "../services/api";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import "../styles/devices.css";

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [selectedDeviceName, setSelectedDeviceName] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    deviceName: "",
    macAddress: "",
    ipAddress: "",
  });

  // Fetch devices on mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Update remaining time every second (seamlessly)
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prevDevices) =>
        prevDevices.map((device) => {
          // Update remaining time locally without re-fetching
          if (device.sessionStatus === "running" && device.remainingTime > 0) {
            const newRemainingTime = device.remainingTime - 1;
            return {
              ...device,
              remainingTime: newRemainingTime,
              // Mark as paused when time reaches 0
              sessionStatus: newRemainingTime <= 0 ? "pause" : "running",
            };
          }
          return device;
        }),
      );
    }, 1000); // Update every 1 second

    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await deviceService.getAllDevices();
      setDevices(response.data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDevice = async (e) => {
    e.preventDefault();
    try {
      await deviceService.register(formData);
      setFormData({ deviceName: "", macAddress: "", ipAddress: "" });
      setShowForm(false);
      fetchDevices();
    } catch (error) {
      console.error("Error registering device:", error);
    }
  };

  const handleDeleteDevice = (deviceId, deviceName) => {
    setSelectedDeviceId(deviceId);
    setSelectedDeviceName(deviceName);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deviceService.deleteDeviceAdmin(selectedDeviceId);
      setDeleteDialogOpen(false);
      setSelectedDeviceId(null);
      setSelectedDeviceName(null);
      fetchDevices();
    } catch (error) {
      console.error("Error deleting device:", error);
      alert("Failed to delete device");
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedDeviceId(null);
    setSelectedDeviceName(null);
  };

  // Format remaining time (seconds to HH:MM:SS)
  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return "-";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="devices-page">
      <h1>Devices</h1>

      <button onClick={() => setShowForm(!showForm)} className="btn-primary">
        {showForm ? "Cancel" : "Register Device"}
      </button>

      {showForm && (
        <form onSubmit={handleRegisterDevice} className="device-form">
          <div className="form-group">
            <label>Device Name</label>
            <input
              type="text"
              value={formData.deviceName}
              onChange={(e) =>
                setFormData({ ...formData, deviceName: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>MAC Address</label>
            <input
              type="text"
              value={formData.macAddress}
              onChange={(e) =>
                setFormData({ ...formData, macAddress: e.target.value })
              }
              placeholder="00:1A:2B:3C:4D:5E"
              required
            />
          </div>

          <div className="form-group">
            <label>IP Address</label>
            <input
              type="text"
              value={formData.ipAddress}
              onChange={(e) =>
                setFormData({ ...formData, ipAddress: e.target.value })
              }
              placeholder="192.168.1.1"
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Register Device
          </button>
        </form>
      )}

      <div className="devices-table">
        <table>
          <thead>
            <tr>
              <th>Device Name</th>
              <th>MAC Address</th>
              <th>IP Address</th>
              <th>Session Status</th>
              <th>Remaining Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {devices.length > 0 ? (
              devices.map((device) => {
                const isOnline = device.isOnline ? "Online" : "Offline";
                const sessionStatus =
                  device.sessionStatus === "running" ? "▶ Running" : "⏸ Paused";
                const remainingTimeText = formatTime(device.remainingTime);

                return (
                  <tr key={device._id || device.deviceId}>
                    <td>{device.deviceName || "-"}</td>
                    <td>{device.macAddress || "-"}</td>
                    <td>{device.ipAddress || "-"}</td>
                    <td
                      className={`session-status-cell ${device.sessionStatus === "running" ? "running" : "paused"}`}
                    >
                      {sessionStatus}
                    </td>
                    <td className="remaining-time-cell">{remainingTimeText}</td>
                    <td className="action-cell">
                      <button
                        onClick={() =>
                          handleDeleteDevice(device.deviceId || device._id, device.deviceName)
                        }
                        className="btn-delete"
                        title="Delete device"
                      >
                        ✕ Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No devices registered yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Device"
        message="Are you sure you want to delete"
        itemName={selectedDeviceName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
