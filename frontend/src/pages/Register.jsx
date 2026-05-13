import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/index";
import { authService } from "../services/api";
import "../styles/auth.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token, user } = (await authService.register(formData)).data;
      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field, label, type = "text", placeholder = "") => (
    <div className="form-group">
      <label htmlFor={field}>{label}</label>
      <input
        id={field}
        type={type}
        value={formData[field]}
        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
        required={field === "name" || field === "email" || field === "password"}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Piso WiFi Admin</h1>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          {renderInput("name", "Full Name", "text", "Your name")}
          {renderInput("email", "Email", "email", "Enter your email")}
          {renderInput("password", "Password", "password", "Enter your password")}
          {renderInput("phone", "Phone", "tel", "09XXXXXXXXX")}
          {renderInput("shopName", "Shop Name", "text", "Your shop name")}
          {renderInput("address", "Address", "text", "Your shop address")}
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p>
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
}
