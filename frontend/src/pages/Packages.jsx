import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/index";
import api from "../services/api";
import "../styles/pages.css";

export default function Packages() {
  const { user } = useAuthStore();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [draggedPackage, setDraggedPackage] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
    dataLimit: "Unlimited",
    displayOrder: "",
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get("/packages/admin/all");
      setPackages(response.data);
    } catch (err) {
      console.error("Error fetching packages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!formData.name || !formData.price || !formData.duration) {
        setError("Name, price, and duration are required");
        return;
      }

      if (editingPackage) {
        // Update
        await api.put(`/packages/${editingPackage.packageId}`, formData);
        setSuccess("Package updated successfully");
      } else {
        // Create
        await api.post("/packages/create", formData);
        setSuccess("Package created successfully");
      }

      setFormData({
        name: "",
        price: "",
        duration: "",
        description: "",
        dataLimit: "Unlimited",
        displayOrder: "",
      });
      setEditingPackage(null);
      setShowForm(false);
      fetchPackages();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      description: pkg.description,
      dataLimit: pkg.dataLimit,
      displayOrder: pkg.displayOrder,
    });
    setShowForm(true);
  };

  const handleDelete = async (packageId) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await api.delete(`/packages/${packageId}`);
        setSuccess("Package deleted successfully");
        fetchPackages();
      } catch (err) {
        setError("Failed to delete package");
      }
    }
  };

  const handleToggleStatus = async (pkg) => {
    try {
      await api.patch(`/packages/${pkg.packageId}/toggle`);
      setSuccess(`Package ${pkg.isActive ? "deactivated" : "activated"}`);
      fetchPackages();
    } catch (err) {
      setError("Failed to update package status");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPackage(null);
    setFormData({
      name: "",
      price: "",
      duration: "",
      description: "",
      dataLimit: "Unlimited",
      displayOrder: "",
    });
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, pkg, index) => {
    setDraggedPackage({ pkg, index });
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedPackage(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedPackage) return;

    const { pkg: draggedPkg, index: dragIndex } = draggedPackage;

    if (dragIndex === dropIndex) {
      setDraggedPackage(null);
      return;
    }

    // Reorder packages
    const newPackages = [...packages];
    const draggedItem = newPackages[dragIndex];
    newPackages.splice(dragIndex, 1);
    newPackages.splice(dropIndex, 0, draggedItem);

    // Update display order for all packages based on new position
    const updatedPackages = newPackages.map((pkg, idx) => ({
      ...pkg,
      displayOrder: idx,
    }));

    setPackages(updatedPackages);

    // Save all updated display orders
    try {
      for (let i = 0; i < updatedPackages.length; i++) {
        const pkg = updatedPackages[i];
        await api.put(`/packages/${pkg.packageId}`, {
          displayOrder: i,
        });
      }
      setSuccess("Package order updated successfully");
    } catch (err) {
      setError("Failed to update package order");
      fetchPackages(); // Revert on error
    }

    setDraggedPackage(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="page-container">
      <h1>Internet Packages</h1>
      <p>Manage internet service packages and pricing</p>
      <p style={{ fontSize: "14px", color: "#666", marginBottom: "20px" }}>
        💡 Tip: Drag and drop packages to reorder them
      </p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Create New Package
        </button>
      )}

      {showForm && (
        <div className="form-container">
          <h2>{editingPackage ? "Edit Package" : "Create New Package"}</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Package Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., 1 Hour, Daily Pass"
                required
              />
            </div>

            <div className="form-group">
              <label>Price (₱) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="60"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Data Limit</label>
              <input
                type="text"
                name="dataLimit"
                value={formData.dataLimit}
                onChange={handleInputChange}
                placeholder="e.g., Unlimited, 10GB"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the package"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Display Order</label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                placeholder="1"
                min="0"
              />
            </div>

            <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
              <button type="submit" className="btn-success">
                {editingPackage ? "Update Package" : "Create Package"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-grid">
        {packages.length === 0 ? (
          <p className="no-data">No packages found</p>
        ) : (
          packages.map((pkg, index) => (
            <div
              key={pkg.packageId}
              className={`data-card ${
                dragOverIndex === index ? "drag-over" : ""
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, pkg, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                cursor: "grab",
                transition: "all 0.2s ease",
              }}
            >
              <div className="drag-handle" style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "20px", color: "#999" }}>⋮⋮</span>
              </div>

              <div className="card-header">
                <h3>{pkg.name}</h3>
                <span
                  className={`status-badge ${pkg.isActive ? "active" : "inactive"}`}
                >
                  {pkg.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="card-content">
                <p>
                  <strong>Price:</strong> ₱{pkg.price}
                </p>
                <p>
                  <strong>Duration:</strong> {pkg.duration} minutes (
                  {Math.floor(pkg.duration / 60)}h)
                </p>
                <p>
                  <strong>Data Limit:</strong> {pkg.dataLimit}
                </p>
                {pkg.description && (
                  <p>
                    <strong>Description:</strong> {pkg.description}
                  </p>
                )}
                <p>
                  <strong>Display Order:</strong> {pkg.displayOrder}
                </p>
              </div>

              <div className="card-actions">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="btn-small btn-info"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(pkg)}
                  className={`btn-small ${pkg.isActive ? "btn-warning" : "btn-success"}`}
                >
                  {pkg.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(pkg.packageId)}
                  className="btn-small btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
