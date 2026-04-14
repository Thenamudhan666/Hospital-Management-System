import React, { useState, useEffect } from "react";
import { Calendar, Clock, User, UserCheck, Search, Filter } from "lucide-react";

function DoctorScheduler({ doctorId }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (doctorId) {
      fetchSchedule();
    }
  }, [doctorId]);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/doctor/${doctorId}/appointments`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching doctor schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === "booked") return app.reservation_id !== null;
    if (filter === "open") return app.status === 'pending' && app.reservation_id === null;
    return true;
  });

  if (loading) return <div className="p-4">Loading schedule...</div>;

  return (
    <div className="scheduler-container animate-fade-in" style={{ padding: '1rem' }}>
      <div className="scheduler-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>My Appointment Schedule</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Manage your upcoming patient visits and open slots.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
          >
            <option value="all">All Slots</option>
            <option value="booked">Booked Only</option>
            <option value="open">Open Only</option>
          </select>
        </div>
      </div>

      <div className="schedule-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredAppointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
            <Calendar size={40} color="#94a3b8" style={{ marginBottom: '1rem' }} />
            <p style={{ color: '#64748b' }}>No appointments found matching the current filter.</p>
          </div>
        ) : (
          filteredAppointments.map((app) => (
            <div 
              key={app.appid} 
              className={`schedule-card ${app.reservation_id ? 'booked' : 'open'}`}
              style={{
                background: 'white',
                padding: '1.25rem 1.5rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease',
                cursor: 'default'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                <div style={{ minWidth: '100px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#0f172a' }}>
                    <Calendar size={16} color="#0ea5e9" />
                    {new Date(app.appdate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>
                    <Clock size={16} color="#64748b" />
                    {new Date('1970-01-01T' + app.timing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  {app.reservation_id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', background: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserCheck size={20} color="#16a34a" />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600 }}>{app.patient_name || 'Confirmed Patient'}</p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Patient ID: #{app.reservation_id}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                      <div style={{ width: '36px', height: '36px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1' }}>
                        <Search size={20} />
                      </div>
                      <p style={{ margin: 0, fontStyle: 'italic' }}>Open Slot - Available for booking</p>
                    </div>
                  )}
                </div>

                <div style={{ minWidth: '150px', textAlign: 'right' }}>
                  <span style={{ 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: app.reservation_id ? '#dcfce7' : '#f1f5f9',
                    color: app.reservation_id ? '#16a34a' : '#64748b'
                  }}>
                    {app.reservation_id ? 'CONFIRMED' : 'OPEN'}
                  </span>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>{app.service_type}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default DoctorScheduler;
