import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

function Login() {
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
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const user = data.user;
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: user.username,
            phone: user.userphno,
            email: user.usermail,
            id: user.userid,
          }),
        );
        navigate("/home");
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
    <div className="auth-container animate-fade-in">
      <div className="auth-left">
        <div className="brand-header animate-slide-in-right">
          <span className="brand-icon">🏥</span>
          <span className="brand-name">HealthPortal</span>
        </div>

        <div className="hospital-image animate-slide-up delay-100">
          <img
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop"
            alt="Hospital corridor"
          />
        </div>

        <div className="brand-content animate-slide-up delay-200">
          <h2>Your health, managed in one secure place.</h2>
          <p>
            Access your lab results, schedule appointments, and communicate
            directly with your medical care team from any device.
          </p>

          <div className="features">
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <div>
                <h4>HIPAA Compliant</h4>
                <p>Your data is encrypted and protected</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">⏰</span>
              <div>
                <h4>24/7 Support</h4>
                <p>We're here to help you anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="form-wrapper animate-slide-up delay-300">
          <h1>Welcome Back</h1>
          <p className="subtitle">
            Please sign in to access your patient dashboard.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
                <span className="input-icon">📱</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Password
                <a href="#" className="forgot-link">
                  Forgot password?
                </a>
              </label>
              <div className="input-wrapper">
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

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember">Remember this device for 30 days</label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div className="help-section">
            <p className="signup-link">
              Don't have an account?
              <a href="/signup">Sign Up</a>
            </p>
          </div>

          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
