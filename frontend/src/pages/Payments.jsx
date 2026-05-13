import React, { useEffect, useState } from "react";
import { paymentService } from "../services/api";
import "../styles/payments.css";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAllPayments();
      let filtered = response.data;

      if (filter !== "all") {
        filtered = filtered.filter((p) => p.status === filter);
      }

      setPayments(filtered);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="payments-page">
      <h1>Payments</h1>

      <div className="filter-section">
        <label>Filter by Status:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="payments-table">
        <table>
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Phone Number</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td>{payment.paymentId}</td>
                <td>₱{payment.amount}</td>
                <td className={`status ${payment.status}`}>{payment.status}</td>
                <td>{payment.phoneNumber || "-"}</td>
                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
