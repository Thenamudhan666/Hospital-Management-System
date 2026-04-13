import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const TIME_SLOTS = [
  { time: "09:00 AM", badge: "FAST TRACK", badgeType: "fasttrack" },
  { time: "10:30 AM", badge: null },
  { time: "01:00 PM", badge: null },
  { time: "02:30 PM", badge: "LAST SLOT", badgeType: "lastslot" },
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  });

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState(null);
  const [selDoc, setSelDoc] = useState(null);
  const [selTime, setSelTime] = useState("09:00 AM");

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchDocs = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/api/doctors", {
          headers: { "x-user-id": user.id }
        });
        if (!res.ok) throw new Error("Failed to load doctors");
        const data = await res.json();
        setDoctors(data);
        if (data.length > 0) setSelDoc(data[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, [user, navigate]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const dotDays = new Set([9, 11]);

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const isSelected = (day) =>
    day === selectedDate &&
    viewMonth === selectedMonth &&
    viewYear === selectedYear;

  const handlePrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const handleNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setSelectedMonth(viewMonth);
    setSelectedYear(viewYear);
  };

  const handleBook = async () => {
    if (!selDoc || !user) return;
    setLoading(true);
    setError(null);

    const payload = {
      timing: selTime,
      docid: selDoc.id,
      reservation_id: user.id,
      appspe: selDoc.specialisation || "General",
      appdate: `${selectedYear}-${String(selectedMonth+1).padStart(2,"0")}-${String(selectedDate).padStart(2,"0")}`,
      notes: "Self-booked consultation",
      service_type: "Initial Consultation"
    };

    try {
      const res = await fetch("http://localhost:3000/api/appointments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Booking failed. Please try again.");
      setBooked(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedDateObj = new Date(selectedYear, selectedMonth, selectedDate);
  const dayName = selectedDateObj.toLocaleDateString("en-US", { weekday: "long" });
  const timeOfDay =
    parseInt(selTime) < 12 ? "Morning" :
    parseInt(selTime) < 17 ? "Afternoon" : "Evening";

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1 < 0 ? 11 : viewMonth - 1);
    cells.push({ day: prevMonthDays - firstDay + 1 + i, outside: true });
  }
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, outside: false });

  return (
    <div style={styles.root}>
      <nav style={styles.nav}>
        <span style={styles.brand}>Sanctuary Manager</span>
        <div style={styles.navLinks}>
          <span style={styles.navActive}>Booking</span>
          <span style={styles.navLink}>Create Slots</span>
          <span style={styles.navLink}>Overview</span>
        </div>
        <div style={styles.navRight}>
          <div style={styles.searchBox}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input style={styles.searchInput} placeholder="Search..." />
          </div>
          <button style={styles.iconBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
          <button style={styles.iconBtn}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
          <div style={styles.avatar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.left}>
          <div style={styles.headerSection}>
            <h1 style={styles.heading}>Request a Consultation</h1>
            {error && <div style={{backgroundColor:"#fee2e2", color:"#b91c1c", padding:"10px", borderRadius:8, marginBottom:16, fontSize:14, fontWeight:600}}>✕ {error}</div>}
            <p style={styles.subheading}>
              Select a preferred date and time for your session. Our practitioners offer
              specialized care in a serene environment designed for your clinical recovery.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.calHeader}>
              <span style={styles.calMonthYear}>{MONTHS[viewMonth]} {viewYear}</span>
              <div style={styles.calNavBtns}>
                <button style={styles.calNavBtn} onClick={handlePrev}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button style={styles.calNavBtn} onClick={handleNext}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>
            </div>

            <div style={styles.calGrid}>
              {DAYS.map(d => <div key={d} style={styles.dayHeader}>{d}</div>)}
            </div>

            <div style={styles.calGrid}>
              {cells.map((cell, i) => {
                const isOut = cell.outside;
                const isTod = !isOut && isToday(cell.day);
                const isSel = !isOut && isSelected(cell.day);
                const hasDot = !isOut && dotDays.has(cell.day);

                let cellStyle = { ...styles.dayCell };
                if (isOut) cellStyle = { ...cellStyle, color: "#cbd5e1" };
                if (isTod) cellStyle = { ...cellStyle, ...styles.todayCell };
                if (isSel && !isTod) cellStyle = { ...cellStyle, ...styles.selectedCell };

                return (
                  <div
                    key={i}
                    style={cellStyle}
                    onClick={() => !isOut && handleDayClick(cell.day)}
                  >
                    <span>{cell.day}</span>
                    {isTod && <span style={styles.todayLabel}>TODAY</span>}
                    {hasDot && !isTod && <span style={styles.dot} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={styles.bottomRow}>
            <div style={styles.doctorCard}>
              <div style={styles.doctorAvatar}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#94a3b8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                <div style={styles.docBadge}>LEAD CLINICIAN</div>
              </div>
              <div>
                <div style={styles.doctorName}>{selDoc?.name || "Loading..."}</div>
                <div style={styles.doctorRole}>{selDoc?.specialisation || "Specialist"}</div>
                <div style={styles.doctorRating}>★ 4.9/5 Rating</div>
              </div>
            </div>

            <div style={styles.facilityCard}>
              <div style={styles.facilityLabel}>FACILITY NOTE</div>
              <p style={styles.facilityText}>
                Located in the North Wing Sanctuary. Please arrive 10 minutes early for the decompression sequence.
              </p>
            </div>
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.rightCard}>
            <div style={styles.sectionTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e4a47" strokeWidth="2" style={{marginRight:8}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Available Times
            </div>
            <div style={styles.timeList}>
              {TIME_SLOTS.map(slot => (
                <button
                  key={slot.time}
                  style={{
                    ...styles.timeSlot,
                    ...(selTime === slot.time ? styles.timeSlotActive : {}),
                  }}
                  onClick={() => setSelTime(slot.time)}
                >
                  <span style={styles.timeText}>{slot.time}</span>
                  {slot.badge && (
                    <span style={{
                      ...styles.badge,
                      ...(slot.badgeType === "fasttrack" ? styles.badgeFasttrack : styles.badgeLastslot),
                    }}>
                      {slot.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={styles.divider} />

            <div style={styles.summaryLabel}>SUMMARY</div>
            <div style={styles.summaryItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e4a47" strokeWidth="2" style={{marginRight:10,flexShrink:0}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div>
                <div style={styles.summaryMain}>
                  {MONTHS[selectedMonth]} {selectedDate}, {selectedYear}
                </div>
                <div style={styles.summaryMeta}>{dayName} {timeOfDay}</div>
              </div>
            </div>
            <div style={styles.summaryItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e4a47" strokeWidth="2" style={{marginRight:10,flexShrink:0}}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              <div>
                <div style={styles.summaryMain}>Initial Consultation</div>
                <div style={styles.summaryMeta}>45 Minute Session</div>
              </div>
            </div>

            <button
              style={{...styles.confirmBtn, opacity: loading ? 0.7 : 1}}
              disabled={loading || booked}
              onClick={handleBook}
            >
              {loading ? "Booking..." : confirmed ? "✓ Appointment Confirmed!" : "Confirm Appointment →"}
            </button>
            <div style={styles.cancelNote}>Flexible cancellation up to 24 hours before.</div>
          </div>

          {/* Help Card */}
          <div style={styles.helpCard}>
            <div style={styles.helpIcon}>?</div>
            <div>
              <div style={styles.helpTitle}>Need help choosing?</div>
              <div style={styles.helpSub}>Speak with a sanctuary guide.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    backgroundColor: "#f0f4f3",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#1e293b",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 40px",
    height: 56,
    backgroundColor: "#fff",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  brand: {
    fontWeight: 700,
    fontSize: 16,
    color: "#1e293b",
    letterSpacing: "-0.3px",
    minWidth: 160,
  },
  navLinks: {
    display: "flex",
    gap: 32,
  },
  navActive: {
    fontWeight: 600,
    fontSize: 14,
    color: "#1e4a47",
    borderBottom: "2px solid #1e4a47",
    paddingBottom: 2,
    cursor: "pointer",
  },
  navLink: {
    fontWeight: 400,
    fontSize: 14,
    color: "#64748b",
    cursor: "pointer",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    padding: "6px 12px",
    gap: 8,
    border: "1px solid #e2e8f0",
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: 13,
    color: "#64748b",
    width: 140,
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    backgroundColor: "#475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  main: {
    display: "flex",
    gap: 24,
    padding: "40px 40px",
    maxWidth: 1160,
    margin: "0 auto",
    alignItems: "flex-start",
  },
  left: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  right: {
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    flexShrink: 0,
  },
  headerSection: {
    marginBottom: 4,
  },
  heading: {
    fontSize: 36,
    fontWeight: 800,
    color: "#0f2d2b",
    margin: "0 0 10px",
    letterSpacing: "-1px",
    lineHeight: 1.15,
  },
  subheading: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 500,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "28px 32px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  calHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  calMonthYear: {
    fontWeight: 700,
    fontSize: 18,
    color: "#0f2d2b",
    letterSpacing: "-0.3px",
  },
  calNavBtns: {
    display: "flex",
    gap: 4,
  },
  calNavBtn: {
    background: "none",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 4,
  },
  dayHeader: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    letterSpacing: "0.5px",
    padding: "6px 0",
  },
  dayCell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 4px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    color: "#334155",
    cursor: "pointer",
    minHeight: 50,
    gap: 2,
    transition: "background 0.15s",
  },
  todayCell: {
    backgroundColor: "#1e4a47",
    color: "#fff",
    fontWeight: 700,
  },
  selectedCell: {
    backgroundColor: "#e8f2f1",
    color: "#1e4a47",
    fontWeight: 700,
    border: "1.5px solid #1e4a47",
  },
  todayLabel: {
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: "0.5px",
    color: "rgba(255,255,255,0.8)",
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    backgroundColor: "#94a3b8",
  },
  bottomRow: {
    display: "flex",
    gap: 16,
  },
  doctorCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: "20px 24px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    border: "1px solid #e2e8f0",
  },
  doctorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    gap: 4,
    overflow: "hidden",
    position: "relative",
  },
  docBadge: {
    fontSize: 6,
    fontWeight: 700,
    backgroundColor: "#1e4a47",
    color: "#fff",
    padding: "2px 4px",
    borderRadius: 3,
    letterSpacing: "0.3px",
  },
  doctorName: {
    fontWeight: 700,
    fontSize: 15,
    color: "#0f2d2b",
    marginBottom: 2,
  },
  doctorRole: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  doctorRating: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: 600,
  },
  facilityCard: {
    flex: 1.4,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: "20px 24px",
    border: "1px solid #e2e8f0",
  },
  facilityLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "1px",
    color: "#94a3b8",
    marginBottom: 8,
  },
  facilityText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.6,
    margin: 0,
  },
  rightCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: 15,
    color: "#0f2d2b",
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
  },
  timeList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  timeSlot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    transition: "all 0.15s",
    width: "100%",
  },
  timeSlotActive: {
    backgroundColor: "#1e4a47",
    border: "1px solid #1e4a47",
    color: "#fff",
  },
  timeText: {
    fontWeight: 600,
    fontSize: 14,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.5px",
    padding: "3px 8px",
    borderRadius: 20,
  },
  badgeFasttrack: {
    backgroundColor: "transparent",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.5)",
  },
  badgeLastslot: {
    backgroundColor: "#dcfce7",
    color: "#16a34a",
  },
  divider: {
    borderTop: "1px solid #e2e8f0",
    margin: "20px 0 16px",
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "1px",
    color: "#94a3b8",
    marginBottom: 12,
  },
  summaryItem: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  summaryMain: {
    fontWeight: 700,
    fontSize: 14,
    color: "#0f2d2b",
  },
  summaryMeta: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  confirmBtn: {
    width: "100%",
    padding: "15px",
    backgroundColor: "#1e4a47",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 8,
    transition: "background 0.15s",
    letterSpacing: "-0.2px",
  },
  cancelNote: {
    textAlign: "center",
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 10,
  },
  helpCard: {
    backgroundColor: "#f0f4f3",
    borderRadius: 14,
    padding: "18px 20px",
    display: "flex",
    alignItems: "center",
    gap: 14,
    border: "1px solid #dde8e7",
  },
  helpIcon: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "#1e4a47",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    flexShrink: 0,
  },
  helpTitle: {
    fontWeight: 700,
    fontSize: 14,
    color: "#0f2d2b",
  },
  helpSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
};
