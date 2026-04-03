import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/doctor-auth.css";
import doctorImage from "../assets/images/doctor.webp";

function DoctorSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    email: "",
    specialisation: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const specialisations = [
    "Cardiology",
    "Dermatology",
    "Pediatrics",
    "Orthopedics",
    "Neurology",
    "Oncology",
    "Psychiatry",
    "Gastroenterology",
    "Pulmonology",
    "Urology",
    "Gynecology",
    "Ophthalmology",
    "ENT",
    "General Practice",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/doctor-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/doctor-login");
      } else {
        alert(data.error || "Signup failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-auth-container">
      <div className="doctor-auth-left">
        <div className="doctor-brand-header">
          <span className="doctor-brand-icon">🏥</span>
          <span className="doctor-brand-name">HealthPortal</span>
        </div>

        <div className="doctor-hospital-image">
          <img src={doctorImage} alt="Doctor with tablet" />
        </div>

        <div className="doctor-brand-content">
          <h2>Join Our Doctor Network</h2>
          <p>
            Register your credentials and start managing your patients through
            our secure, HIPAA-compliant healthcare platform.
          </p>

          <div className="doctor-features">
            <div className="doctor-feature">
              <span className="doctor-feature-icon">🔐</span>
              <div>
                <h4>Verified Credentials</h4>
                <p>Secure license verification</p>
              </div>
            </div>
            <div className="doctor-feature">
              <span className="doctor-feature-icon">⚡</span>
              <div>
                <h4>Easy Setup</h4>
                <p>Get started in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="doctor-auth-right">
        <div className="doctor-form-wrapper">
          <h1>Doctor Registration</h1>
          <p className="doctor-subtitle">
            Create your account to access the doctor dashboard.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="doctor-form-group">
              <label htmlFor="name">Full Name</label>
              <div className="doctor-input-wrapper">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Dr. John Doe"
                  required
                />
                <span className="doctor-input-icon">👤</span>
              </div>
            </div>

            <div className="doctor-form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <div className="doctor-input-wrapper">
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  required
                />
                <span className="doctor-input-icon">📱</span>
              </div>
            </div>

            <div className="doctor-form-group">
              <label htmlFor="email">Email Address</label>
              <div className="doctor-input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="doctor@example.com"
                  required
                />
                <span className="doctor-input-icon">✉️</span>
              </div>
            </div>

            <div className="doctor-form-group">
              <label htmlFor="specialisation">Specialisation</label>
              <div className="doctor-input-wrapper">
                <select
                  id="specialisation"
                  name="specialisation"
                  value={formData.specialisation}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your specialisation</option>
                  {specialisations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <span className="doctor-input-icon">👨‍⚕️</span>
              </div>
            </div>

            <div className="doctor-form-group">
              <label htmlFor="password">Password</label>
              <div className="doctor-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
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

            <div className="doctor-form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="doctor-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <span
                  className="doctor-input-icon doctor-password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setShowConfirmPassword(!showConfirmPassword);
                    }
                  }}
                >
                  {showConfirmPassword ? "👁️" : "🔒"}
                </span>
              </div>
            </div>

            <div className="doctor-checkbox-group">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
              />
              <label htmlFor="terms">
                I agree to the <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a> regarding patient data handling.
              </label>
            </div>

            <button
              type="submit"
              className="doctor-btn-primary"
              disabled={!agreedToTerms || loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="doctor-login-link">
            <p>
              Already have an account? <a href="/doctor-login">Login</a>
            </p>
          </div>

          <div className="doctor-footer-links">
            <a href="#">Help Center</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorSignup;
