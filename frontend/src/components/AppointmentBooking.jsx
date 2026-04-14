import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, CheckCircle, ChevronRight, ArrowLeft, AlertCircle } from "lucide-react";
import "../styles/createAppointment.css";
import "../styles/home.css"; // Reusing some base styles for consistency

function AppointmentBooking() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [user, setUser] = useState(null);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  const addToast = (type, title, text) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    fetchAvailableSlots();
  }, [navigate]);

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch("/api/available-slots");
      if (response.ok) {
        const data = await response.json();
        setSlots(data);
      } else {
        setError("Failed to load available appointments.");
      }
    } catch (err) {
      setError("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot || !user) return;
    setBooking(true);
    try {
      const response = await fetch(`/api/appointments/${selectedSlot.appid}/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": (user.id || user.userid || "0").toString()
        }
      });

      if (response.ok) {
        addToast("success", "Appointment Confirmed", "Your reservation was successful.");
        setTimeout(() => {
          navigate("/appointment-confirmation", { state: { appointment: selectedSlot } });
        }, 1200);
      } else {
        const data = await response.json();
        addToast("error", "Booking Failed", data.details || data.error || "Unknown error");
      }
    } catch (err) {
      console.error("Booking error:", err);
      addToast("error", "Network Error", "Unable to connect to the booking service.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="loading-container">Loading slots...</div>;

  return (
    <div className="home-container animate-fade-in" style={{ background: '#f8fafc' }}>
      <header className="home-header">
        <div className="header-left">
          <button onClick={() => navigate("/home")} className="back-btn" style={{ background: 'none', border: 'none', color: 'white', marginRight: '1rem', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <span className="brand-name">Book Appointment</span>
        </div>
      </header>

      <main className="booking-main" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="booking-header" style={{ marginBottom: '2rem' }}>
          <h1>Select an Appointment</h1>
          <p style={{ color: '#64748b' }}>Choose an available slot from our specialists.</p>
        </div>

        {error ? (
          <div className="error-card" style={{ padding: '2rem', background: '#fee2e2', color: '#dc2626', borderRadius: '12px' }}>{error}</div>
        ) : slots.length === 0 ? (
          <div className="no-slots-card" style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <Calendar size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <h3>No slots available currently</h3>
            <p>Please check back later or contact support if this is an emergency.</p>
          </div>
        ) : (
          <div className="slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {slots.map((slot) => (
              <div 
                key={slot.appid} 
                className={`slot-card ${selectedSlot?.appid === slot.appid ? 'selected' : ''}`}
                onClick={() => setSelectedSlot(slot)}
                style={{
                  background: 'white',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: `2px solid ${selectedSlot?.appid === slot.appid ? '#0ea5e9' : '#e2e8f0'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: selectedSlot?.appid === slot.appid ? '0 8px 16px rgba(14, 165, 233, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.75rem', background: '#eff6ff', borderRadius: '12px' }}>
                    <span style={{ fontSize: '1.5rem' }}>👨‍⚕️</span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Dr. {slot.doctor_name}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{slot.doctor_specialization}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#1e293b' }}>
                    <Calendar size={16} color="#0ea5e9" />
                    {new Date(slot.appdate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#1e293b' }}>
                    <Clock size={16} color="#0ea5e9" />
                    {(() => {
                        const d = new Date(slot.timing);
                        if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const fallback = new Date('1970-01-01T' + slot.timing);
                        return !isNaN(fallback.getTime()) ? fallback.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
                    })()}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#1e293b' }}>
                    <CheckCircle size={16} color="#10b981" />
                    {slot.service_type}
                  </div>
                </div>

                <button 
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: selectedSlot?.appid === slot.appid ? '#0ea5e9' : '#f1f5f9',
                    color: selectedSlot?.appid === slot.appid ? 'white' : '#1e293b',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {selectedSlot?.appid === slot.appid ? 'Selected' : 'Select Slot'}
                  {selectedSlot?.appid === slot.appid && <CheckCircle size={16} />}
                </button>
              </div>
            ))}
          </div>
        )}

        {selectedSlot && (
          <div className="booking-summary animate-slide-up" style={{ 
            position: 'fixed', 
            bottom: '2rem', 
            left: '50%', 
            transform: 'translateX(-50%)',
            background: 'white',
            padding: '1.5rem 2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '3rem',
            width: '90%',
            maxWidth: '800px',
            zIndex: 100
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Confirm Reservation</p>
              <h3 style={{ margin: '0.25rem 0 0 0' }}>
                Dr. {selectedSlot.doctor_name} — {(() => {
                    const d = new Date(selectedSlot.timing);
                    if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const fallback = new Date('1970-01-01T' + selectedSlot.timing);
                    return !isNaN(fallback.getTime()) ? fallback.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
                })()}
              </h3>
            </div>
            <button 
              onClick={handleConfirmBooking}
              disabled={booking}
              style={{
                marginLeft: 'auto',
                background: '#0ea5e9',
                color: 'white',
                border: 'none',
                padding: '0.875rem 2rem',
                borderRadius: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s',
                opacity: booking ? 0.7 : 1
              }}
            >
              {booking ? "Confirming..." : "Book Now"}
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default AppointmentBooking;
