import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Clock, User, ArrowLeft, Download, Share2 } from "lucide-react";
import "../styles/home.css"; 

function PatientConfirm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    if (location.state?.appointment) {
      setAppointment(location.state.appointment);
    } else {
      // If no state, redirect home
      navigate("/home");
    }
  }, [location, navigate]);

  if (!appointment) return null;

  return (
    <div className="home-container animate-fade-in" style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <header className="home-header">
        <div className="header-left">
          <button onClick={() => navigate("/home")} className="back-btn" style={{ background: 'none', border: 'none', color: 'white', marginRight: '1rem', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <span className="brand-name">Booking Confirmed</span>
        </div>
      </header>

      <main style={{ padding: '4rem 2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <div className="confirmation-card animate-slide-up" style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '24px', 
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            background: '#dcfce7', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <CheckCircle size={40} color="#16a34a" />
          </div>

          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#0f172a' }}>Appointment Confirmed!</h1>
          <p style={{ color: '#64748b', marginBottom: '2.5rem' }}>Your reservation has been successfully placed. We've sent a notification to your email.</p>

          <div style={{ 
            background: '#f1f5f9', 
            borderRadius: '16px', 
            padding: '1.5rem', 
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <User size={20} color="#0ea5e9" />
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Doctor</p>
                <p style={{ margin: 0, fontWeight: 600 }}>Dr. {appointment.doctor_name}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Calendar size={20} color="#0ea5e9" />
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Date</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{new Date(appointment.appdate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Clock size={20} color="#0ea5e9" />
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Time</p>
                <p style={{ margin: 0, fontWeight: 600 }}>
                    {(() => {
                        const d = new Date(appointment.timing);
                        if (!isNaN(d.getTime())) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const fallback = new Date('1970-01-01T' + appointment.timing);
                        return !isNaN(fallback.getTime()) ? fallback.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Invalid Time";
                    })()}
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => window.print()}
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#1e293b',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <Download size={18} /> Print
            </button>
            <button 
              onClick={() => navigate("/home")}
              style={{
                flex: 2,
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: '#0ea5e9',
                color: 'white',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        <p style={{ marginTop: '2rem', color: '#94a3b8', fontSize: '0.9rem' }}>
          Need to reschedule? Contact us at <strong>support@healthportal.com</strong>
        </p>
      </main>
    </div>
  );
}

export default PatientConfirm;
