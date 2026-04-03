import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/doctor-auth.css";
import doctorImage from "../assets/images/doctor.webp";

function DoctorLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: "",
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
      const response = await fetch("/api/doctor-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const doctor = data.doctor;
        localStorage.setItem(
          "doctor",
          JSON.stringify({
            name: doctor.name,
            phone: doctor.phone,
            email: doctor.email,
            specialisation: doctor.specialisation,
            id: doctor.id,
          }),
        );
        navigate("/doctor-home");
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
    <div className="doctor-auth-container animate-fade-in">
      <div className="doctor-auth-left">
        <div className="doctor-brand-header animate-slide-in-right">
          <span className="doctor-brand-icon">🏥</span>
          <span className="doctor-brand-name">HealthPortal</span>
        </div>

        <div className="doctor-hospital-image animate-slide-up delay-100">
          <img src={doctorImage} alt="Doctor with tablet" />
        </div>

        <div className="doctor-brand-content animate-slide-up delay-200">
          <h2>Welcome to Doctor Portal</h2>
          <p>
            Manage patient schedules, access medical records, and provide
            seamless healthcare delivery through our secure platform.
          </p>

          <div className="doctor-features">
            <div className="doctor-feature">
              <span className="doctor-feature-icon">🔒</span>
              <div>
                <h4>HIPAA Compliant</h4>
                <p>Patient data is fully encrypted</p>
              </div>
            </div>
            <div className="doctor-feature">
              <span className="doctor-feature-icon">⏰</span>
              <div>
                <h4>24/7 Access</h4>
                <p>Manage patients anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="doctor-auth-right">
        <div className="doctor-form-wrapper animate-slide-up delay-300">
          <h1>Welcome Back, Doctor</h1>
          <p className="doctor-subtitle">
            Please sign in to access your doctor dashboard.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="doctor-form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="doctor-input-wrapper">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
                <span className="doctor-input-icon">📱</span>
              </div>
            </div>

            <div className="doctor-form-group">
              <label htmlFor="password">
                Password
                <a href="#" className="doctor-forgot-link">
                  Forgot password?
                </a>
              </label>
              <div className="doctor-input-wrapper">
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
                  className="doctor-input-icon doctor-password-toggle"
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

            <div className="doctor-checkbox-group">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Remember this device for 30 days</label>
            </div>

            <button type="submit" className="doctor-btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="doctor-help-section">
            <p className="doctor-signup-link">
              Don't have an account?
              <a href="/doctor-signup">Sign Up</a>
            </p>
          </div>

          <div className="doctor-footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorLogin;
