import React, { useEffect, useState } from "react";
import { voucherService } from "../services/api";
import "../styles/vouchers.css";

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    voucherCode: "",
    price: 0,
    duration: 30,
    dataLimit: 0,
    quantity: 1,
    voucherType: "time-based",
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await voucherService.getAll();
      setVouchers(response.data);
    } catch (error) {
      console.error("Error fetching vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVoucher = async (e) => {
    e.preventDefault();
    try {
      await voucherService.create(formData);
      setFormData({
        voucherCode: "",
        price: 0,
        duration: 30,
        dataLimit: 0,
        quantity: 1,
        voucherType: "time-based",
      });
      setShowForm(false);
      fetchVouchers();
    } catch (error) {
      console.error("Error creating voucher:", error);
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    if (window.confirm("Are you sure?")) {
      try {
        await voucherService.delete(voucherId);
        fetchVouchers();
      } catch (error) {
        console.error("Error deleting voucher:", error);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="vouchers-page">
      <h1>Vouchers</h1>

      <button onClick={() => setShowForm(!showForm)} className="btn-primary">
        {showForm ? "Cancel" : "Create New Voucher"}
      </button>

      {showForm && (
        <form onSubmit={handleCreateVoucher} className="voucher-form">
          <div className="form-group">
            <label>Voucher Code</label>
            <input
              type="text"
              value={formData.voucherCode}
              onChange={(e) =>
                setFormData({ ...formData, voucherCode: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Price (₱)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <select
              value={formData.voucherType}
              onChange={(e) =>
                setFormData({ ...formData, voucherType: e.target.value })
              }
            >
              <option value="time-based">Time Based</option>
              <option value="data-based">Data Based</option>
            </select>
          </div>

          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="form-group">
            <label>Data Limit (MB)</label>
            <input
              type="number"
              value={formData.dataLimit}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dataLimit: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseInt(e.target.value) })
              }
              required
            />
          </div>

          <button type="submit" className="btn-primary">
            Create Voucher
          </button>
        </form>
      )}

      <div className="vouchers-grid">
        {vouchers.map((voucher) => (
          <div key={voucher._id} className="voucher-card">
            <h3>{voucher.voucherCode}</h3>
            <p>Price: ₱{voucher.price}</p>
            <p>Duration: {voucher.duration} min</p>
            <p>Type: {voucher.voucherType}</p>
            <p>
              Used: {voucher.usedQuantity}/{voucher.quantity}
            </p>
            <button
              onClick={() => handleDeleteVoucher(voucher.voucherId)}
              className="btn-delete"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
