import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/userRoomBooking.css";

const RoomBooking = () => {
  const navigate = useNavigate();
  const [activeFloor, setActiveFloor] = useState("all");
  const [activeView, setActiveView] = useState("available"); // "available" or "myBookings"
  const [rooms, setRooms] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserData = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  const mapRoom = (room) => {
    const statusFromDB = (room.room_status || "AVAILABLE").toUpperCase();
    let status = statusFromDB;
    let statusColor = "available";
    let borderColor = "green";
    let progressPercent = 0;

    if (statusFromDB === "OCCUPIED") {
      statusColor = "booked";
      borderColor = "orange";
      progressPercent = 100;
    } else if (statusFromDB === "CONFIRMED") {
      status = "CONFIRMED";
      statusColor = "confirmed";
      borderColor = "blue";
      progressPercent = 75;
    } else if (
      statusFromDB === "RESERVED" ||
      statusFromDB === "CLEANING" ||
      statusFromDB === "MAINTENANCE"
    ) {
      status = "RESERVED";
      statusColor = "RESERVED";
      borderColor = "blue";
      progressPercent = 50;
    }

    return {
      id: room.room_id,
      name: `Room ${room.room_id}`,
      type: room.room_type || "PATIENT ROOM",
      status: status,
      statusColor,
      borderColor,
      guestName: room.user_name || "",
      doctorName: room.doctor_name || "",
      dates: room.user_name ? "IN-PATIENT" : "",
      checkInInfo: room.doctor_name
        ? `Dr. ${room.doctor_name}`
        : status === "RESERVED"
          ? "Reserved for patient"
          : "Available for occupancy",
      progressPercent,
    };
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }
      const data = await response.json();

      // Only keep available rooms for the main view
      const availableRooms = data
        .filter((room) => (room.room_status || "Available").toUpperCase() === "AVAILABLE")
        .map(mapRoom);

      setRooms(availableRooms);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching rooms:", err);
      setError("Could not load rooms. Please try again later.");
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    const userData = getUserData();
    if (!userData || !userData.id) return;

    try {
      const response = await fetch(`/api/user/${userData.id}/rooms`);
      if (!response.ok) {
        throw new Error("Failed to fetch your bookings");
      }
      const data = await response.json();
      setMyBookings(data.map(mapRoom));
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchMyBookings();
  }, []);

  const handleBook = async (roomId) => {
    try {
      const userData = getUserData();
      const userName = userData ? userData.username : "Guest User";
      const userId = userData ? userData.id : null;

      const response = await fetch(`/api/rooms/${roomId}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, userId }),
      });

      if (response.ok) {
        fetchRooms();
        fetchMyBookings();
      } else {
        alert("Failed to book room");
      }
    } catch (err) {
      console.error("Error booking room:", err);
      alert("An error occurred while booking");
    }
  };

  const floors = [
    { id: "all", label: "All Rooms" },
    { id: "Standard", label: "Standard" },
    { id: "Deluxe", label: "Deluxe" },
    { id: "ICU", label: "ICU" },
    { id: "Suite", label: "Suite" },
  ];

  const statusBadges = [
    { label: "AVAILABLE", color: "badge-available" },
    { label: "RESERVED", color: "badge-booked" },
    { label: "CONFIRMED", color: "badge-confirmed" },
  ];

  const displayRooms = activeView === "available" ? rooms : myBookings;

  return (
    <div className="room-booking-container">
      {/* Navigation Header */}
      <div className="top-nav">
        <button className="home-btn" onClick={() => navigate("/home")}>
          <span className="home-icon">🏠</span> Home
        </button>
      </div>

      {/* Header */}
      <div className="booking-header">
        <div className="header-content">
          <h1 className="header-title">
            {activeView === "available" ? "Available Rooms" : "My Bookings"}
          </h1>
          <p className="header-subtitle">
            {activeView === "available"
              ? "   Browse and book available rooms"
              : "View your current reservations and confirmed rooms"}
          </p>
        </div>
        <div className="header-controls">
          <div className="status-badges">
            {statusBadges.map((badge, index) => (
              <span key={index} className={`status-badge ${badge.color}`}>
                <span className="badge-dot"></span>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* View Toggle Tabs */}
      <div className="view-tabs">
        <button
          className={`view-tab ${activeView === "available" ? "active" : ""}`}
          onClick={() => setActiveView("available")}
        >
          <span>🛏️</span> Available Rooms
        </button>
        <button
          className={`view-tab ${activeView === "myBookings" ? "active" : ""}`}
          onClick={() => {
            setActiveView("myBookings");
            fetchMyBookings();
          }}
        >
          <span>📋</span> My Bookings
          {myBookings.length > 0 && (
            <span className="booking-count">{myBookings.length}</span>
          )}
        </button>
      </div>

      {/* Floor Filter Tabs (only for available rooms) */}
      {activeView === "available" && (
        <div className="floor-tabs">
          {floors.map((floor) => (
            <button
              key={floor.id}
              className={`floor-tab ${activeFloor === floor.id ? "active" : ""}`}
              onClick={() => setActiveFloor(floor.id)}
            >
              {floor.label}
            </button>
          ))}
        </div>
      )}

      {/* Room Cards Grid */}
      <div className="rooms-grid">
        {loading && <div className="loading-message">Loading rooms...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && activeView === "myBookings" && myBookings.length === 0 && (
          <div className="no-rooms-message">
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <h3>No Bookings Yet</h3>
              <p>You haven't booked any rooms. Browse available rooms to make a reservation.</p>
              <button
                className="book-room-btn"
                onClick={() => setActiveView("available")}
                style={{ marginTop: "16px", padding: "12px 24px", fontSize: "14px" }}
              >
                Browse Available Rooms
              </button>
            </div>
          </div>
        )}

        {!loading && !error && activeView === "available" && rooms.length === 0 && (
          <div className="no-rooms-message">
            No rooms available at the moment.
          </div>
        )}

        {!loading &&
          !error &&
          displayRooms
            .filter((room) => {
              if (activeView === "myBookings") return true;
              if (activeFloor === "all") return true;
              return room.type === activeFloor;
            })
            .map((room) => (
              <div
                key={room.id}
                className={`room-card room-card-${room.borderColor}`}
              >
                {/* Card Header */}
                <div className="room-card-header">
                  <h3 className="room-number">{room.name}</h3>
                  <span className={`room-status-badge ${room.statusColor}`}>
                    {room.status}
                  </span>
                </div>

                {/* Room Type */}
                <p className="room-type">{room.type}</p>

                {/* Guest Info or Reserved Info */}
                <div className="room-info">
                  {activeView === "myBookings" && (
                    <>
                      <p className="guest-dates">
                        <span className="reserved-icon">🏥</span> Status: {room.status}
                      </p>
                      {room.doctorName && (
                        <p className="guest-name" style={{ fontSize: "13px", marginTop: "4px" }}>
                          👨‍⚕️ Dr. {room.doctorName}
                        </p>
                      )}
                    </>
                  )}
                  {activeView === "available" && (
                    <p className="reserved-info">
                      <span className="reserved-icon">📅</span> Available for occupancy
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="progress-container">
                  <div className="progress-bar">
                    <div
                      className={`progress-fill progress-fill-${room.borderColor}`}
                      style={{ width: `${room.progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="room-card-footer">
                  {activeView === "available" && room.status === "AVAILABLE" ? (
                    <button
                      className="book-room-btn"
                      onClick={() => handleBook(room.id)}
                    >
                      Book Room
                    </button>
                  ) : (
                    <p className="check-in-status">{room.checkInInfo}</p>
                  )}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default RoomBooking;
