import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/login");
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
    <div className="auth-container animate-fade-in">
      <div className="auth-left">
        <div className="brand-header animate-slide-in-right">
          <span className="brand-icon">🏥</span>
          <span className="brand-name">HealthPortal</span>
        </div>

        <div className="hospital-image animate-slide-up delay-100">
          <img
            src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop"
            alt="Medical team"
          />
        </div>

        <div className="brand-content animate-slide-up delay-200">
          <h2>Begin your wellness journey today.</h2>
          <p>
            Create a secure patient account to manage appointments, view
            records, and stay connected with your healthcare provider
          </p>

          <div className="features">
            <div className="feature">
              <span className="feature-icon">🔐</span>
              <div>
                <h4>Secure Registration</h4>
                <p>HIPAA compliant data protection</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <div>
                <h4>Quick Access</h4>
                <p>Fast track your clinical visits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="form-wrapper animate-slide-up delay-300">
          <h1>Patient Registration</h1>
          <p className="subtitle">
            Fill in your details to create your secure patient portal account.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
                <span className="input-icon">👤</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  required
                />
                <span className="input-icon">📱</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                />
                <span className="input-icon">✉️</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
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
                  className="input-icon password-toggle"
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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
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
                  className="input-icon password-toggle"
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

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
              />
              <label htmlFor="terms">
                I agree to the <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={!agreedToTerms || loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="login-link">
            <p>
              Already have an account? <a href="/login">Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
