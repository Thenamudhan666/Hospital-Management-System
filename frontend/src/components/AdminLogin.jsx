import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin-auth.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    admin: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const admin = data.admin;
        localStorage.setItem(
          "admin",
          JSON.stringify({
            name: admin.name,
            id: admin.id,
          }),
        );
        navigate("/admin-home");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-auth-container animate-fade-in">
      <div className="admin-auth-left">
        <div className="admin-brand-header animate-slide-in-right">
          <span className="admin-brand-icon">⚙️</span>
          <span className="admin-brand-name">Admin Dashboard</span>
        </div>

        <div className="admin-brand-content animate-slide-up delay-200">
          <h2>Welcome to Admin Portal</h2>
          <p>
            Manage hospital operations, user accounts, and system settings
            through our secure admin panel.
          </p>

          <div className="admin-features">
            <div className="admin-feature">
              <span className="admin-feature-icon">🔐</span>
              <div>
                <h4>Secure Access</h4>
                <p>Enterprise-grade security</p>
              </div>
            </div>
            <div className="admin-feature">
              <span className="admin-feature-icon">📊</span>
              <div>
                <h4>Full Control</h4>
                <p>Complete system management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-auth-right">
        <div className="admin-form-wrapper animate-slide-up delay-300">
          <h1>Admin Login</h1>
          <p className="admin-subtitle">
            Please sign in to access the admin dashboard.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="admin">Admin Username</label>
              <div className="admin-input-wrapper">
                <input
                  type="text"
                  id="admin"
                  name="admin"
                  value={formData.admin}
                  onChange={handleChange}
                  placeholder="Enter your admin username"
                  required
                />
                <span className="admin-input-icon">👤</span>
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="password">
                Password
                <a href="#" className="admin-forgot-link">
                  Forgot password?
                </a>
              </label>
              <div className="admin-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <span
                  className="admin-input-icon admin-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setShowPassword(!showPassword);
                    }
                  }}
                >
                  {showPassword ? "👁️" : "🔒"}
                </span>
              </div>
            </div>

            <div className="admin-checkbox-group">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Remember this device for 30 days</label>
            </div>

            <button type="submit" className="admin-btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="admin-help-section">
            <p className="admin-contact-link">
              Need help?
              <a href="#">Contact Support</a>
            </p>
          </div>

          <div className="admin-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
