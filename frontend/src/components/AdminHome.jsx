import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/admin-home.css";

function AdminHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("rooms");
  const [admin, setAdmin] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    roomtype: "Standard",
  });
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    if (adminData) {
      setAdmin(JSON.parse(adminData));
    }
    fetchRooms();
    fetchDoctors();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      alert("Failed to fetch rooms");
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      alert("Failed to fetch doctors");
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ roomtype: "Standard" });
        setShowCreateForm(false);
        fetchRooms();
      } else {
        alert(data.error || "Failed to create room");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDoctor = async (roomId, doctorId, doctorName) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/doctor`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ doctorName, doctorId }),
      });

      if (response.ok) {
        // Update local state to reflect change immediately
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.room_id === roomId
              ? { ...room, doctor_name: doctorName, doctor_id: doctorId }
              : room,
          ),
        );
      } else {
        const data = await response.json();
        alert(data.error || "Failed to assign doctor");
      }
    } catch (error) {
      console.error("Error assigning doctor:", error);
      alert("Failed to assign doctor");
    }
  };

  const handleConfirmRoom = async (roomId) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/confirm`, {
        method: "PUT",
      });

      if (response.ok) {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.room_id === roomId
              ? { ...room, room_status: "Confirmed" }
              : room,
          ),
        );
        alert("Room confirmed successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to confirm room");
      }
    } catch (error) {
      console.error("Error confirming room:", error);
      alert("Failed to confirm room");
    }
  };

  const handleCancelRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${roomId}/cancel`, {
        method: "PUT",
      });

      if (response.ok) {
        setRooms((prevRooms) =>
          prevRooms.map((room) =>
            room.room_id === roomId
              ? {
                  ...room,
                  room_status: "Available",
                  user_name: null,
                  doctor_name: null,
                }
              : room,
          ),
        );
        alert("Reservation canceled successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to cancel reservation");
      }
    } catch (error) {
      console.error("Error canceling reservation:", error);
      alert("Failed to cancel reservation");
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to permanently delete this room? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRooms((prevRooms) =>
          prevRooms.filter((room) => room.room_id !== roomId),
        );
        alert("Room deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete room");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Failed to delete room");
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderRoomCard = (room) => (
    <div
      key={room.room_id}
      className={`room-card ${room.room_status.toLowerCase()}`}
    >
      <div className="room-header">
        <h3>Room {room.room_id}</h3>
        <span className={`status-badge ${room.room_status.toLowerCase()}`}>
          {room.room_status}
        </span>
      </div>
      <div className="room-info">
        <p>
          <strong>Type:</strong> {room.room_type}
        </p>
        {room.user_name && (
          <p>
            <strong>Patient:</strong> {room.user_name}
          </p>
        )}
        <div className="assign-doctor-section">
          <label htmlFor={`doctor-${room.room_id}`}>
            <strong>Doctor:</strong>
          </label>
          <select
            id={`doctor-${room.room_id}`}
            value={room.doctor_name || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                const [docId, ...nameParts] = val.split("|");
                handleAssignDoctor(
                  room.room_id,
                  parseInt(docId),
                  nameParts.join("|"),
                );
              }
            }}
            className="doctor-select"
          >
            <option value="">Select Doctor</option>
            {doctors.map((doc) => (
              <option key={doc.id} value={`${doc.id}|${doc.name}`}>
                {doc.name} - {doc.specialisation}
              </option>
            ))}
          </select>
        </div>
        {room.room_status === "Reserved" && (
          <div className="room-actions">
            <button
              className="btn-confirm"
              onClick={() => handleConfirmRoom(room.room_id)}
              disabled={!room.doctor_name}
              title={
                !room.doctor_name
                  ? "Assign a doctor to confirm"
                  : "Confirm Admission"
              }
            >
              Confirm
            </button>
            <button
              className="btn-cancel"
              onClick={() => handleCancelRoom(room.room_id)}
            >
              Cancel
            </button>
          </div>
        )}
        <div className="room-actions" style={{ marginTop: "10px" }}>
          <button
            className="btn-delete"
            onClick={() => handleDeleteRoom(room.room_id)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/");
  };

  if (!admin) {
    return (
      <div
        className="admin-home-container"
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

  return (
    <div className="admin-home-container animate-fade-in">
      <header className="admin-header">
        <div className="admin-header-left">
          <span className="admin-icon">⚙️</span>
          <div className="admin-header-content">
            <h1>Welcome, {admin.name}</h1>
            <p>Hospital Administration Panel</p>
          </div>
        </div>
        <div className="admin-header-right">
          <div className="admin-stats">
            <div className="stat">
              <div className="stat-number">{rooms.length}</div>
              <div className="stat-label">Total Rooms</div>
            </div>
            <div className="stat">
              <div className="stat-number">{doctors.length}</div>
              <div className="stat-label">Doctors</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        <div className="tabs animate-slide-up">
          <button
            className={`tab-btn ${activeTab === "rooms" ? "active" : ""}`}
            onClick={() => setActiveTab("rooms")}
          >
            <span>🛏️</span> Manage Rooms
          </button>
          <button
            className={`tab-btn ${activeTab === "doctors" ? "active" : ""}`}
            onClick={() => setActiveTab("doctors")}
          >
            <span>👨‍⚕️</span> Doctors
          </button>
        </div>

        {activeTab === "rooms" && (
          <div className="tab-content">
            <div className="room-section animate-slide-up delay-100">
              <div className="room-header-section">
                <h2>Hospital Rooms</h2>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="btn-create-room"
                >
                  {showCreateForm ? "Cancel" : "+ Create Room"}
                </button>
              </div>

              {showCreateForm && (
                <div className="form-card animate-slide-up delay-50">
                  <h3>Create New Room</h3>
                  <form onSubmit={handleCreateRoom}>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="roomtype">Room Type</label>
                        <select
                          id="roomtype"
                          name="roomtype"
                          value={formData.roomtype}
                          onChange={handleFormChange}
                        >
                          <option value="Standard">Standard</option>
                          <option value="Deluxe">Deluxe</option>
                          <option value="ICU">ICU</option>
                          <option value="Suite">Suite</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn-submit"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create Room"}
                    </button>
                  </form>
                </div>
              )}

              <div className="rooms-management-sections animate-slide-up">
                {rooms.length === 0 ? (
                  <p style={{ textAlign: "center", color: "#666", padding: "3rem" }}>
                    No rooms available. Create one to get started.
                  </p>
                ) : (
                  <>
                    {/* 1. Reserved Section (Needs Attention) */}
                    {rooms.some(r => r.room_status === "Reserved") && (
                      <div className="room-category-block">
                        <div className="room-section-header">
                          <h3>⚠️ Action Required: Reserved</h3>
                          <span className="room-count-badge">{rooms.filter(r => r.room_status === "Reserved").length}</span>
                        </div>
                        <div className="rooms-grid">
                          {rooms.filter(r => r.room_status === "Reserved").map(room => renderRoomCard(room))}
                        </div>
                      </div>
                    )}

                    {/* 2. Confirmed Section (Occupied) */}
                    {rooms.some(r => r.room_status === "Confirmed") && (
                      <div className="room-category-block">
                        <div className="room-section-header">
                          <h3>🏥 Confirmed Admissions</h3>
                          <span className="room-count-badge">{rooms.filter(r => r.room_status === "Confirmed").length}</span>
                        </div>
                        <div className="rooms-grid">
                          {rooms.filter(r => r.room_status === "Confirmed").map(room => renderRoomCard(room))}
                        </div>
                      </div>
                    )}

                    {/* 3. Available Section */}
                    {rooms.some(r => r.room_status === "Available") && (
                      <div className="room-category-block">
                        <div className="room-section-header">
                          <h3>✅ Available Rooms</h3>
                          <span className="room-count-badge">{rooms.filter(r => r.room_status === "Available").length}</span>
                        </div>
                        <div className="rooms-grid">
                          {rooms.filter(r => r.room_status === "Available").map(room => renderRoomCard(room))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "doctors" && (
          <div className="tab-content">
            <h2 className="animate-slide-in-right">Doctor Details</h2>
            <div className="doctors-grid animate-slide-up delay-100">
              {doctors.length === 0 ? (
                <p
                  style={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    color: "#666",
                  }}
                >
                  No doctors registered yet.
                </p>
              ) : (
                doctors.map((doctor) => (
                  <div key={doctor.id} className="doctor-card">
                    <div className="doctor-header">
                      <div className="doctor-avatar">👨‍⚕️</div>
                      <div className="doctor-name-section">
                        <h3>{doctor.name}</h3>
                        <p className="specialisation">
                          {doctor.specialisation}
                        </p>
                      </div>
                    </div>
                    <div className="doctor-info">
                      <p>
                        <span className="info-label">Doctor ID:</span>
                        <span className="info-value">#{doctor.id}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminHome;
