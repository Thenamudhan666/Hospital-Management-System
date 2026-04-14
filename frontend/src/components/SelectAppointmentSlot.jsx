import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Calendar as CalendarIcon, 
  Folder, 
  Clock, 
  User, 
  Search, 
  Bell, 
  Settings, 
  Stethoscope,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import "../styles/createAppointment.css";

const serviceTypes = [
  "General Consultation",
  "Specialist Follow-up",
  "Diagnostic Test",
  "Tele-health",
  "Surgical Consultation",
  "Emergency"
];

const morningSlots = ["08:00 AM", "09:30 AM", "10:00 AM", "11:15 AM"];
const afternoonSlots = ["12:00 PM", "01:30 PM", "02:45 PM", "04:00 PM"];

export default function SelectAppointmentSlot() {
  const navigate = useNavigate();
  
  // State for appointment data
  const [selectedDateISO, setSelectedDateISO] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState("09:30 AM");
  const [timeFilter, setTimeFilter] = useState("morning"); // morning or afternoon
  const [selectedService, setSelectedService] = useState("General Consultation");
  const [priority, setPriority] = useState("Medium");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [notes, setNotes] = useState("");
  
  // Data states
  const [doctor, setDoctor] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [toasts, setToasts] = useState([]);

  const addToast = (type, title, text) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, title, text }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    const doctorData = localStorage.getItem("doctor");
    if (doctorData) {
      setDoctor(JSON.parse(doctorData));
    } else {
      navigate("/doctor-login");
    }
    fetchRooms();
  }, [navigate]);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
        if (data.length > 0) setSelectedRoomId(data[0].room_id);
      }
    } catch (err) {
      console.error("Error fetching rooms:", err);
    }
  };

  const dateWindow = useMemo(() => {
    const start = new Date(selectedDateISO);
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push({
        full: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        dayNum: d.getDate()
      });
    }
    return dates;
  }, [selectedDateISO]);

  const currentMonthYear = new Date(selectedDateISO).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const slotToTime = (slot) => {
    const [time, period] = slot.split(" ");
    const [hours, minutes] = time.split(":");
    let h = parseInt(hours);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${minutes}:00`;
  };

  const handleCreateAppointment = async () => {
    if (!doctor) return;
    setLoading(true);
    setMessage("");

    const finalTime = selectedSlot.includes("M") ? slotToTime(selectedSlot) : `${selectedSlot}:00`;
    const payload = {
      timing: `${selectedDateISO} ${finalTime}`,
      docid: doctor.id,
      appdate: selectedDateISO,
      service_type: selectedService
    };

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": doctor.id.toString()
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        addToast("success", "Slot Created", "The appointment slot has been saved to the database.");
        setMessage("Appointment slot created successfully!");
      } else {
        addToast("error", "Creation Failed", data.details || data.error || "Could not save the slot.");
        setMessage(`Error: ${data.details || data.error || "Failed to create slot"}`);
      }
    } catch (err) {
      console.error("Booking failed:", err);
      addToast("error", "Connection Error", err.message);
      setMessage(`Connection Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hms-premium-layout">
      {/* Left Sidebar */}
      <aside className="hms-sidebar">
        <div className="sidebar-logo">HMS Clinicals</div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item" onClick={() => navigate("/doctor-home")}>
            <Home size={20} /> Home
          </a>
          <a href="#" className="nav-item active">
            <CalendarIcon size={20} /> Appointments
          </a>
          <a href="#" className="nav-item">
            <Folder size={20} /> Records
          </a>
        </nav>
        <div style={{ marginTop: 'auto' }}>
            <button className="nav-item" style={{ border: 'none', background: 'none', width: '100%', cursor: 'pointer' }} onClick={() => navigate("/")}>
                Logout
            </button>
        </div>
      </aside>

      {/* Main Center Content */}
      <main className="hms-main-content">
        <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Schedule New Slot</h1>
            <p>Configure availability and service parameters for the Central Ward.</p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                <input type="text" placeholder="Search patients or records..." style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f1f5f9', width: '250px' }} />
            </div>
            <Bell size={20} color="#64748b" />
            <Settings size={20} color="#64748b" />
            <div className="practitioner-avatar" style={{ width: '32px', height: '32px', fontSize: '1rem' }}>👨‍⚕️</div>
          </div>
        </header>

        <section className="setup-card">
          {/* 1. Select Date */}
          <div className="card-section">
            <div className="section-title-row">
              <h2 className="section-title">1. Select Date</h2>
              <span className="section-subtitle">Mapping {currentMonthYear}</span>
            </div>
            <div className="date-selector-grid">
              {dateWindow.map((d) => (
                <div 
                  key={d.full} 
                  className={`date-pill ${selectedDateISO === d.full ? "active" : ""}`}
                  onClick={() => setSelectedDateISO(d.full)}
                >
                  <span className="day-label">{d.dayName}</span>
                  <span className="day-number">{String(d.dayNum).padStart(2, "0")}</span>
                </div>
              ))}
              <div className="calendar-button" onClick={() => document.getElementById('full-date-picker').showPicker()}>
                <CalendarIcon size={24} color="#64748b" />
                <input 
                    id="full-date-picker"
                    type="date" 
                    value={selectedDateISO} 
                    onChange={(e) => setSelectedDateISO(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* 2. Select Time */}
          <div className="card-section">
            <div className="section-title-row">
              <h2 className="section-title">2. Select Time</h2>
              <div className="time-filter-row">
                <button className={`filter-chip ${timeFilter === "morning" ? "active" : ""}`} onClick={() => setTimeFilter("morning")}>MORNING</button>
                <button className={`filter-chip ${timeFilter === "afternoon" ? "active" : ""}`} onClick={() => setTimeFilter("afternoon")}>AFTERNOON</button>
              </div>
            </div>
            <div className="time-slots-grid">
              {(timeFilter === "morning" ? morningSlots : afternoonSlots).map((slot) => (
                <div 
                  key={slot} 
                  className={`time-slot ${selectedSlot === slot ? "active" : ""}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </div>
              ))}
              <div 
                className={`time-slot custom ${!selectedSlot.includes("M") ? "active" : ""}`}
                onClick={() => document.getElementById('custom-time-input').showPicker()}
              >
                + Custom
                <input 
                    id="custom-time-input"
                    type="time"
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 3. Service Details */}
          <div className="card-section">
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>3. Service Details</h2>
            <div className="hms-field">
              <label>Service Type</label>
              <div className="service-chips">
                {serviceTypes.map(type => (
                  <div 
                    key={type} 
                    className={`service-chip ${selectedService === type ? "active" : ""}`}
                    onClick={() => setSelectedService(type)}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Right Summary Sidebar */}
      <aside className="hms-summary-sidebar">
        <div className="summary-card">
          <div className="summary-header">Slot Summary</div>
          <div className="summary-body">
            <div className="summary-item">
              <div className="summary-item-left">
                <div className="summary-icon-box"><CalendarIcon size={20} /></div>
                <div className="summary-details">
                  <span className="label">Date</span>
                  <span className="value">{new Date(selectedDateISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', weekday: 'short' })}</span>
                </div>
              </div>
              <button style={{ color: '#2563eb', background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
            </div>

            <div className="summary-item">
              <div className="summary-item-left">
                <div className="summary-icon-box"><Clock size={20} /></div>
                <div className="summary-details">
                  <span className="label">Time Window</span>
                  <span className="value">{selectedSlot}</span>
                </div>
              </div>
              <button style={{ color: '#2563eb', background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Edit</button>
            </div>

            <hr />

            <div className="stat-item">
              <span className="stat-label">Service Type</span>
              <span className="stat-value">{selectedService}</span>
            </div>

            {message && <p style={{ color: message.includes("Error") ? "red" : "green", fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>{message}</p>}

            <button className="btn-create-appointment" onClick={handleCreateAppointment} disabled={loading}>
              {loading ? "Creating..." : "CREATE APPOINTMENT SLOT"}
            </button>
            <p style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'center', marginTop: '1rem' }}>
              Confirmation will be sent to the assigned physician.
            </p>
          </div>
        </div>

        <div className="practitioner-title" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={14} /> Assigned Practitioner
        </div>
        <div className="practitioner-card">
          <div className="practitioner-avatar">👨‍⚕️</div>
          <div className="practitioner-info">
            <h4>Dr. {doctor?.name || "Practitioner"}</h4>
            <p>{doctor?.specialisation || "Specialist"}</p>
          </div>
        </div>
      </aside>

      {/* Toast Container */}
      <div className="hms-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`hms-toast ${toast.type}`}>
            <div className="hms-toast-icon">
              {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="hms-toast-content">
              <h4>{toast.title}</h4>
              <p>{toast.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
