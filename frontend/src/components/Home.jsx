import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

function Home() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const username = user?.username || "Patient";
  const userPhone = user?.phone || "N/A";
  const userEmail = user?.email || "N/A";
  const userId = user?.id || "N/A";

  const handleBookAppointment = () => {
    navigate("/book-appointment");
  };

  const handleRequestAdmission = () => {
    navigate("/room-booking");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="home-container animate-fade-in">
      <header className="home-header">
        <div className="header-left">
          <span className="brand-icon">🏥</span>
          <span className="brand-name">HealthPortal</span>
        </div>
        <nav className="header-nav">
          <a href="#profile">Profile</a>
          <a href="#records">Records</a>
          <a href="#help">Help</a>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </nav>
      </header>

      <main className="home-main">
        <div className="welcome-section">
          {/* Profile Section */}
          <div className="profile-section animate-slide-up">
            <div className="profile-image">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                alt="Profile"
              />
            </div>
            <h1>Hello, {username}!</h1>
            <p>Welcome back to your personal health dashboard.</p>

            <div className="user-details-card">
              <h3>My Profile Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Full Name</span>
                  <span className="detail-value">{username}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{userPhone}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <span className="detail-value">{userEmail}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Patient ID</span>
                  <span className="detail-value">#{userId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="actions-container">
            <div className="action-card book-appointment animate-slide-up delay-100">
              <div className="action-image">
                <img
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=350&fit=crop"
                  alt="Book Appointment"
                />
              </div>
              <div className="action-content">
                <h3>Book an Appointment</h3>
                <p>
                  Schedule a visit with your preferred specialist or general
                  practitioner. connecting you with the best care.
                </p>
                <button onClick={handleBookAppointment} className="action-btn">
                  <span>📅</span> Book Now
                </button>
              </div>
            </div>

            <div className="action-card request-admission animate-slide-up delay-200">
              <div className="action-image">
                <img
                  src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&h=350&fit=crop"
                  alt="Request Admission"
                />
              </div>
              <div className="action-content">
                <h3>Request Admission</h3>
                <p>
                  Pre-register or request a private room for an upcoming
                  hospital procedure. ensuring your comfort and care.
                </p>
                <button onClick={handleRequestAdmission} className="action-btn">
                  <span>🛏️</span> Request Room
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-content">
          <div className="home-footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/room-booking">Room Booking</a></li>
              <li><a href="#profile">My Profile</a></li>
              <li><a href="#records">Medical Records</a></li>
            </ul>
          </div>
          <div className="home-footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Emergency: 108</a></li>
            </ul>
          </div>
          <div className="home-footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="home-footer-bottom">
          <p>&copy; 2026 HealthPortal System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
