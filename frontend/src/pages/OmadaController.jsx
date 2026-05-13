import React, { useState, useEffect } from "react";
import api from "../services/api";
import "../styles/omada.css";

export default function OmadaController() {
  const [config, setConfig] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("config");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [clientInfo, setClientInfo] = useState({ mac: "", username: "" });
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientMessage, setClientMessage] = useState({ type: "", text: "" });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editConfig, setEditConfig] = useState({ host: "", port: "", username: "", password: "", siteId: "" });

  useEffect(() => {
    if (activeTab === "config") fetchConfig();
  }, [activeTab]);

  const fetchConfig = async () => {
    try {
      const res = await api.get("/omada/config");
      setConfig(res.data);
      setEditConfig({
        host: res.data.host || "",
        port: res.data.port || "",
        username: res.data.username || "",
        password: "",
        siteId: res.data.siteId || "default"
      });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to fetch Omada config" });
    }
  };

  const handleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSaveConfig = async () => {
    if (!editConfig.host || !editConfig.port || !editConfig.username) {
      setMessage({ type: "error", text: "Host, Port, and Username are required" });
      return;
    }
    try {
      const payload = {
        host: editConfig.host,
        port: parseInt(editConfig.port),
        username: editConfig.username,
        password: editConfig.password || undefined,
        siteId: editConfig.siteId
      };
      const res = await api.post("/omada/update-config", payload);
      setMessage({ type: "success", text: "Configuration saved successfully" });
      setIsEditMode(false);
      await fetchConfig();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to save configuration" });
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await api.post("/omada/test-connection");
      setTestResult(res.data);
    } catch (err) {
      setTestResult({ success: false, message: err.response?.data?.message || "Test failed" });
    } finally {
      setTestLoading(false);
    }
  };

  const handleFetchDevices = async () => {
    setDevicesLoading(true);
    setDevices([]);
    try {
      const res = await api.get("/omada/devices");
      setDevices(res.data.devices || []);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to fetch devices" });
    } finally {
      setDevicesLoading(false);
    }
  };

  const handleFetchClients = async () => {
    setClientsLoading(true);
    setClients([]);
    try {
      const res = await api.get("/omada/clients");
      setClients(res.data.clients || []);
    } catch (err) {
      setClientMessage({ type: "error", text: err.response?.data?.message || "Failed to fetch clients" });
    } finally {
      setClientsLoading(false);
    }
  };

  const handleKickClient = async (mac) => {
    try {
      await api.post("/omada/kick-client", { mac });
      setClientMessage({ type: "success", text: `Client ${mac} kicked successfully` });
      await handleFetchClients();
    } catch (err) {
      setClientMessage({ type: "error", text: err.response?.data?.message || "Failed to kick client" });
    }
  };

  const handleBlockClient = async (mac, disable) => {
    try {
      await api.post("/omada/block-client", { mac, disable });
      setClientMessage({ type: "success", text: `Client ${mac} ${disable ? "disabled" : "enabled"} successfully` });
      await handleFetchClients();
    } catch (err) {
      setClientMessage({ type: "error", text: err.response?.data?.message || "Operation failed" });
    }
  };

  const handleDisconnectUser = async () => {
    if (!clientInfo.mac || !clientInfo.username) {
      setClientMessage({ type: "error", text: "Please enter MAC address and username" });
      return;
    }
    try {
      await api.post("/omada/disconnect-user", clientInfo);
      setClientMessage({ type: "success", text: "All sessions for user disconnected" });
      setClientInfo({ mac: "", username: "" });
    } catch (err) {
      setClientMessage({ type: "error", text: err.response?.data?.message || "Failed to disconnect user" });
    }
  };

  return (
    <div className="omada-controller">
      <h1>Omada Controller Integration</h1>
      {message.text && <div className={`message message-${message.type}`}>{message.text}</div>}

      <div className="omada-tabs">
        <button className={activeTab === "config" ? "tab-active" : ""} onClick={() => setActiveTab("config")}>Configuration</button>
        <button className={activeTab === "devices" ? "tab-active" : ""} onClick={() => setActiveTab("devices")}>Devices</button>
        <button className={activeTab === "clients" ? "tab-active" : ""} onClick={() => setActiveTab("clients")}>Client Management</button>
      </div>

      {activeTab === "config" && (
        <div className="omada-section">
          <h2>Omada Controller Configuration</h2>
          {isEditMode ? (
            <div className="omada-config-form">
              <div className="form-group">
                <label>Host</label>
                <input
                  type="text"
                  value={editConfig.host}
                  onChange={(e) => setEditConfig({ ...editConfig, host: e.target.value })}
                  placeholder="192.168.71.12"
                />
              </div>
              <div className="form-group">
                <label>Port</label>
                <input
                  type="number"
                  value={editConfig.port}
                  onChange={(e) => setEditConfig({ ...editConfig, port: e.target.value })}
                  placeholder="8043"
                />
              </div>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={editConfig.username}
                  onChange={(e) => setEditConfig({ ...editConfig, username: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={editConfig.password}
                  onChange={(e) => setEditConfig({ ...editConfig, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                />
              </div>
              <div className="form-group">
                <label>Site ID</label>
                <input
                  type="text"
                  value={editConfig.siteId}
                  onChange={(e) => setEditConfig({ ...editConfig, siteId: e.target.value })}
                  placeholder="default"
                />
              </div>
              <div className="form-actions">
                <button className="btn-primary" onClick={handleSaveConfig}>Save Configuration</button>
                <button className="btn-secondary" onClick={handleEditMode}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              {config ? (
                <div className="omada-config-grid">
                  <div className="omada-config-item"><label>Host</label><span>{config.host || "Not configured"}</span></div>
                  <div className="omada-config-item"><label>Port</label><span>{config.port || "Not configured"}</span></div>
                  <div className="omada-config-item"><label>Username</label><span>{config.username || "Not configured"}</span></div>
                  <div className="omada-config-item"><label>Site ID</label><span>{config.siteId || "default"}</span></div>
                  <div className="omada-config-item"><label>Status</label><span className={config.isConnected ? "status-connected" : "status-disconnected"}>{config.isConnected ? "Connected" : "Disconnected"}</span></div>
                </div>
              ) : <p>Loading configuration...</p>}
              <div className="config-actions">
                <button className="btn-primary" onClick={handleTestConnection} disabled={testLoading}>{testLoading ? "Testing..." : "Test Connection"}</button>
                <button className="btn-secondary" onClick={handleEditMode}>Edit Configuration</button>
              </div>
            </>
          )}
          {testResult && (
            <div className={`test-result ${testResult.success ? "success" : "error"}`}>
              <strong>{testResult.success ? "Connection Successful!" : "Connection Failed"}</strong>
              <p>{testResult.message}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "devices" && (
        <div className="omada-section">
          <h2>Omada Devices</h2>
          <button className="btn-primary" onClick={handleFetchDevices} disabled={devicesLoading}>{devicesLoading ? "Loading..." : "Fetch Devices"}</button>
          {devices.length > 0 ? (
            <table className="omada-table">
              <thead><tr><th>Name</th><th>IP Address</th><th>MAC Address</th><th>Type</th><th>Status</th><th>Clients</th></tr></thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.mac}>
                    <td>{device.name || "Unnamed"}</td>
                    <td>{device.ip}</td>
                    <td>{device.mac}</td>
                    <td>{device.type || "Unknown"}</td>
                    <td>{device.status === "online" ? "Online" : "Offline"}</td>
                    <td>{device.clientCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : devicesLoading ? <p>Loading...</p> : <p>No devices found. Click "Fetch Devices" to scan.</p>}
        </div>
      )}

      {activeTab === "clients" && (
        <div className="omada-section">
          <h2>Client Management</h2>
          {clientMessage.text && <div className={`message message-${clientMessage.type}`}>{clientMessage.text}</div>}
          <button className="btn-primary" onClick={handleFetchClients} disabled={clientsLoading}>{clientsLoading ? "Loading..." : "Fetch Clients"}</button>
          {clients.length > 0 ? (
            <table className="omada-table">
              <thead><tr><th>IP Address</th><th>MAC Address</th><th>Hostname</th><th>Username</th><th>Actions</th></tr></thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.mac}>
                    <td>{client.ip}</td>
                    <td>{client.mac}</td>
                    <td>{client.hostname || "N/A"}</td>
                    <td>{client.username || "N/A"}</td>
                    <td>
                      <button className="btn-danger" onClick={() => handleKickClient(client.mac)}>Kick</button>
                      <button className="btn-warning" onClick={() => handleBlockClient(client.mac, false)}>Disable</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : clientsLoading ? <p>Loading...</p> : <p>No clients found. Click "Fetch Clients" to scan.</p>}

          <div className="omada-disconnect-section">
            <h3>Disconnect User</h3>
            <div className="omada-form-row">
              <input
                type="text"
                placeholder="MAC Address"
                value={clientInfo.mac}
                onChange={(e) => setClientInfo({ ...clientInfo, mac: e.target.value })}
              />
              <input
                type="text"
                placeholder="Username"
                value={clientInfo.username}
                onChange={(e) => setClientInfo({ ...clientInfo, username: e.target.value })}
              />
              <button className="btn-danger" onClick={handleDisconnectUser}>Disconnect All Sessions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
