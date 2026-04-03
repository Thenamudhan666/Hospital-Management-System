import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/starter.css";

function Starter() {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="starter-container animate-fade-in">
      {/* Header */}
      <header className="starter-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">⚕️</span>
            <span className="logo-text">HealthPortal</span>
          </div>
          <nav className="header-nav">
            <button
              className="nav-button login-btn"
              onClick={() => navigateTo("/admin-login")}
            >
              Admin
            </button>
            <button
              className="nav-button get-started-btn"
              onClick={() => navigateTo("/login")}
            >
              Log In
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-subtitle animate-slide-up delay-100">
            Full-Stack Healthcare Management
          </p>
          <h1 className="hero-title animate-slide-up delay-200">
            Smart Healthcare
            <span className="highlight-text">Simplified for You</span>
          </h1>
          <p className="hero-description animate-slide-up delay-300">
            Experience seamless hospital management. From booking appointments
            to administering patient records, everything is just a click away.
          </p>

          {/* Tech Stack */}
          <div className="tech-stack animate-slide-up delay-400">
            <div className="tech-item">
              <span className="tech-badge">⚛️</span>
              <span>React 19</span>
            </div>
            <div className="tech-item">
              <span className="tech-badge">🟢</span>
              <span>Node + Express</span>
            </div>
            <div className="tech-item">
              <span className="tech-badge">🗄️</span>
              <span>MySQL</span>
            </div>
          </div>

          {/* Registration Buttons */}
          <div className="register-buttons animate-slide-up delay-500">
            <button
              className="btn-register patient-btn"
              onClick={() => navigateTo("/signup")}
            >
              <span className="btn-icon">👤</span>
              Patient Sign Up
            </button>
            <button
              className="btn-register doctor-btn"
              onClick={() => navigateTo("/doctor-signup")}
            >
              <span className="btn-icon">👨‍⚕️</span>
              Doctor Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">📅</span>
            <h3>Easy Scheduling</h3>
            <p>
              Book appointments with top specialists in seconds, no wait times.
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📂</span>
            <h3>Digital Records</h3>
            <p>
              Access your medical history and prescriptions anytime, anywhere.
            </p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🛡️</span>
            <h3>Secure Platform</h3>
            <p>
              Your data is encrypted and protected with industry-standard
              security.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <h2>How It Works</h2>
        <div className="workflow-grid">
          <div className="workflow-card">
            <div className="workflow-header">
              <div className="workflow-icon">🩺</div>
              <h3>For Patients</h3>
            </div>
            <ul className="workflow-list">
              <li>✓ Sign up and create your profile</li>
              <li>✓ Browse specialities and doctors</li>
              <li>✓ Book appointments & request rooms</li>
            </ul>
          </div>
          <div className="workflow-card">
            <div className="workflow-header">
              <div className="workflow-icon">👨‍⚕️</div>
              <h3>For Doctors</h3>
            </div>
            <ul className="workflow-list">
              <li>✓ Register and verify credentials</li>
              <li>✓ Set availability schedule</li>
              <li>✓ Manage appointments & treat patients</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="starter-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/login">Patient Login</a>
              </li>
              <li>
                <a href="/doctor-login">Doctor Login</a>
              </li>
              <li>
                <a href="/signup">Sign Up</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li>
                <a href="#">Telemedicine</a>
              </li>
              <li>
                <a href="#">Appointments</a>
              </li>
              <li>
                <a href="#">Lab Results</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li>
                <a href="#">Privacy</a>
              </li>
              <li>
                <a href="#">Terms</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 HealthPortal System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Starter;
