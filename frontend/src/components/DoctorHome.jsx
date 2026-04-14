import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DoctorScheduler from "./DoctorScheduler";
import "../styles/doctor-home.css";

function DoctorHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [doctor, setDoctor] = useState(null);
  const [assignedRooms, setAssignedRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    const doctorData = localStorage.getItem("doctor");
    if (doctorData) {
      const parsed = JSON.parse(doctorData);
      setDoctor(parsed);
      fetchAssignedRooms(parsed.id);
    }
  }, []);

  const fetchAssignedRooms = async (doctorId) => {
    setLoadingRooms(true);
    try {
      const response = await fetch(`/api/doctor/${doctorId}/rooms`);
      if (response.ok) {
        const data = await response.json();
        setAssignedRooms(data);
      }
    } catch (error) {
      console.error("Error fetching assigned rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("doctor");
    navigate("/");
  };

  if (!doctor) {
    return (
      <div
        className="doctor-home-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const confirmedRooms = assignedRooms.filter(
    (r) => r.room_status === "Confirmed",
  );
  const reservedRooms = assignedRooms.filter(
    (r) => r.room_status === "Reserved",
  );

  return (
    <div className="doctor-home-container animate-fade-in">
      <header className="doctor-header">
        <div className="doctor-header-left">
          <span className="doctor-icon">👨‍⚕️</span>
          <div className="doctor-header-content">
            <h1>Welcome, Dr. {doctor.name}</h1>
            <p>{doctor.specialisation} Specialist</p>
          </div>
        </div>
        <div className="doctor-header-right">
          <button className="btn-create-appointment" onClick={() => navigate("/select-slot")}>
            <span>➕</span> Create New Appointment
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="doctor-content">
        <div className="tabs animate-slide-up">
          <button
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span>📊</span> Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            <span>📅</span> My Rooms
          </button>
          <button
            className={`tab-btn ${activeTab === "scheduler" ? "active" : ""}`}
            onClick={() => setActiveTab("scheduler")}
          >
            <span>⏰</span> Appointment Schedule
          </button>
          <button
            className={`tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span>⚙️</span> Settings
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="tab-content">
            <div className="form-card animate-slide-up delay-100">
              <h2>Overview</h2>
              <div className="appointments-grid">
                <div className="appointment-card confirmed">
                  <div className="appointment-header">
                    <h3>Confirmed Patients</h3>
                    <span className="status-badge confirmed">
                      {confirmedRooms.length} Active
                    </span>
                  </div>
                  <div className="appointment-details">
                    {confirmedRooms.length > 0 ? (
                      confirmedRooms.map((room) => (
                        <p key={room.room_id}>
                          <strong>Room {room.room_id}</strong>{" "}
                          {room.user_name || "Patient"} — {room.room_type}
                        </p>
                      ))
                    ) : (
                      <p>No confirmed patients at this time.</p>
                    )}
                  </div>
                </div>
                <div className="appointment-card pending">
                  <div className="appointment-header">
                    <h3>Pending Reservations</h3>
                    <span className="status-badge pending">
                      {reservedRooms.length} Pending
                    </span>
                  </div>
                  <div className="appointment-details">
                    {reservedRooms.length > 0 ? (
                      reservedRooms.map((room) => (
                        <p key={room.room_id}>
                          <strong>Room {room.room_id}</strong>{" "}
                          {room.user_name || "Patient"} — Awaiting confirmation
                        </p>
                      ))
                    ) : (
                      <p>No pending reservations.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="tab-content">
            <h2 className="animate-slide-in-right">Assigned Rooms</h2>
            {loadingRooms ? (
              <div className="form-card animate-slide-up delay-100">
                <p>Loading assigned rooms...</p>
              </div>
            ) : assignedRooms.length === 0 ? (
              <div className="form-card animate-slide-up delay-100">
                <p
                  style={{
                    textAlign: "center",
                    color: "#64748b",
                    padding: "2rem",
                  }}
                >
                  No rooms are currently assigned to you. The admin will assign
                  rooms when patients request admission.
                </p>
              </div>
            ) : (
              <div className="appointments-grid animate-slide-up delay-100">
                {assignedRooms.map((room) => (
                  <div
                    key={room.room_id}
                    className={`appointment-card ${room.room_status === "Confirmed" ? "confirmed" : "pending"}`}
                  >
                    <div className="appointment-header">
                      <h3>Room {room.room_id}</h3>
                      <span
                        className={`status-badge ${room.room_status === "Confirmed" ? "confirmed" : "pending"}`}
                      >
                        {room.room_status}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <p>
                        <strong>Type:</strong> {room.room_type}
                      </p>
                      <p>
                        <strong>Patient:</strong>{" "}
                        {room.user_name || "Not assigned"}
                      </p>
                      <p>
                        <strong>Status:</strong> {room.room_status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "scheduler" && (
          <div className="tab-content">
            <DoctorScheduler doctorId={doctor.id} />
          </div>
        )}

        {activeTab === "settings" && (
          <div className="tab-content">
            <div className="form-card animate-slide-up delay-100">
              <h2>Profile Settings</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" value={doctor.name} readOnly />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={doctor.email} readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={doctor.phone} readOnly />
                </div>
                <div className="form-group">
                  <label>Specialisation</label>
                  <input
                    type="text"
                    value={doctor.specialisation}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorHome;
