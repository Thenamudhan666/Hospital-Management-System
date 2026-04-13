// DoctorScheduler.jsx
// The doctor fills out all details and dispatches the appointment.
// The appointment lands in appointmentStore with status "pending",
// awaiting patient confirmation in PatientConfirm.jsx.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Local helper for date formatting
const formatDate = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

// ─── Data ────────────────────────────────────────────────────────────────────
const DAYS = ["SU","MO","TU","WE","TH","FR","SA"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_M = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Default fallback patients (will be replaced by DB data)
const PATIENTS_FALLBACK = [
  { id: 1, name: "Marcus Thorne",  dob: "1985-03-12", initials: "MT", avatarColor: "#cbd5e1" },
  { id: 2, name: "Sarah Jenkins",  dob: "1991-07-22", initials: "SJ", avatarColor: "#bfdbfe" },
  { id: 3, name: "Lena Park",      dob: "1978-11-04", initials: "LP", avatarColor: "#d1fae5" },
  { id: 4, name: "Omar Hassan",    dob: "2000-01-30", initials: "OH", avatarColor: "#fde68a" },
];

const SERVICE_TYPES = ["General Consultation","Follow-Up Visit","Specialist Referral","Emergency Triage","Lab Review"];
const DURATIONS = [15, 20, 30, 45, 60];

const SLOTS = ["08:30 AM","09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","01:00 PM","02:00 PM","02:30 PM","03:30 PM"];
const UNAVAILABLE = new Set(["09:00 AM","02:00 PM"]);

const NAV = [
  { label:"Overview",  icon:"grid" },
  { label:"Schedule",  icon:"calendar", active: true },
  { label:"Patients",  icon:"users" },
  { label:"Analytics", icon:"bar-chart" },
  { label:"Settings",  icon:"cog" },
];

function getDaysInMonth(y,m){ return new Date(y,m+1,0).getDate(); }
function getFirstDay(y,m){ return new Date(y,m,1).getDay(); }
function ordinal(n){ const s=["th","st","nd","rd"],v=n%100; return s[(v-20)%10]||s[v]||s[0]; }
function pad2(id){ return id < 100 ? `APT-${String(id).padStart(3,"0")}` : `APT-${id}`; }
let _idCounter = 10;

// ─── Icons ───────────────────────────────────────────────────────────────────
function Ic({ n, size=17, c="currentColor" }) {
  const s={width:size,height:size,flexShrink:0};
  const icons = {
    grid:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    calendar:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    users:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    "bar-chart":<svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    cog:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    bell:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    search:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    chevL:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
    chevR:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
    chevRsm:   <svg style={{width:11,height:11}} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
    chevD:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
    send:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
    check:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    calCheck:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>,
    user:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    stethoscope:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
  };
  return icons[n] || null;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoctorScheduler() {
  const navigate = useNavigate();
  const [doctor,    setDoctor]        = useState(() => {
    const data = localStorage.getItem("doctor");
    return data ? JSON.parse(data) : null;
  });
  
  const today = new Date();
  const [activeNav, setActiveNav]     = useState("Schedule");
  const [viewYear,  setViewYear]      = useState(today.getFullYear());
  const [viewMonth, setViewMonth]     = useState(today.getMonth());
  const [selDay,    setSelDay]        = useState(today.getDate());
  const [selMo,     setSelMo]         = useState(today.getMonth());
  const [selYr,     setSelYr]         = useState(today.getFullYear());
  const [selTime,   setSelTime]       = useState("09:30 AM");
  const [patient,   setPatient]       = useState(null);
  const [patients,  setPatients]      = useState(PATIENTS_FALLBACK);
  const [service,   setService]       = useState(SERVICE_TYPES[0]);
  const [duration,  setDuration]      = useState(45);
  const [notes,     setNotes]         = useState("");
  const [dispatched,setDispatched]    = useState(false);
  const [lastId,    setLastId]        = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading,   setLoading]       = useState(false);
  const [error,     setError]         = useState(null);

  useEffect(() => {
    if (!doctor) {
      navigate("/doctor-login");
      return;
    }

    // Fetch real patients from DB
    const fetchPatients = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/users", {
          headers: { "x-user-id": doctor.id }
        });
        if (!res.ok) throw new Error("Failed to fetch patients");
        const data = await res.json();
        if (data.length > 0) {
          const mapped = data.map(u => ({
            id: u.userid,
            name: u.username,
            initials: u.username.split(" ").map(n => n[0]).join("").toUpperCase(),
            avatarColor: "#cbd5e1"
          }));
          setPatients(mapped);
          setPatient(mapped[0]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    // Poll appointments every 5 seconds
    const fetchApts = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/api/appointments", {
          headers: { "x-user-id": doctor.id }
        });
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
    fetchApts();
    const interval = setInterval(fetchApts, 5000);
    return () => clearInterval(interval);
  }, [doctor, navigate]);

  // Calendar helpers
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay    = getFirstDay(viewYear, viewMonth);
  const prevDays    = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1);
  const cells = [];
  for (let i=0;i<firstDay;i++) cells.push({ d: prevDays-firstDay+1+i, out:true });
  for (let d=1;d<=daysInMonth;d++) cells.push({ d, out:false });

  const isToday = d => d===today.getDate() && viewMonth===today.getMonth() && viewYear===today.getFullYear();
  const isSel   = d => d===selDay && viewMonth===selMo && viewYear===selYr;

  const prevMonth = () => viewMonth===0 ? (setViewMonth(11),setViewYear(y=>y-1)) : setViewMonth(m=>m-1);
  const nextMonth = () => viewMonth===11? (setViewMonth(0), setViewYear(y=>y+1)) : setViewMonth(m=>m+1);

  const selDateStr = `${selYr}-${String(selMo+1).padStart(2,"0")}-${String(selDay).padStart(2,"0")}`;
  const selDateObj = new Date(selDateStr+"T00:00:00");
  const dayName    = selDateObj.toLocaleDateString("en-US",{weekday:"long"});
  const timeOfDay  = parseInt(selTime)<12?"Morning":parseInt(selTime)<17?"Afternoon":"Evening";
  const apptLabel  = `${SHORT_M[selMo]} ${selDay}${ordinal(selDay)}, ${selYr} · ${selTime}`;

  const handleDispatch = async () => {
    if (dispatched || !patient) return;
    
    const payload = {
      timing: selTime,
      docid: doctor.id, 
      reservation_id: patient.id,
      appspe: doctor.specialisation || "General",
      appdate: selDateStr,
      notes: notes,
      service_type: service
    };

    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/appointments", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": doctor.id
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Dispatch failed");
      const data = await res.json();
      setLastId(`APT-${data.appid}`);
      setDispatched(true);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNotes(""); setDispatched(false); setLastId(null);
  };

  return (
    <div style={S.root}>
      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={S.brandBlock}>
          <div style={S.brandIcon}><Ic n="stethoscope" size={16} c="#fff"/></div>
          <div>
            <div style={S.brandName}>MedSanctuary</div>
            <div style={S.brandRole}>Doctor Portal</div>
          </div>
        </div>
        <nav style={S.sideNav}>
          {NAV.map(item=>(
            <button key={item.label}
              style={{...S.navItem,...(activeNav===item.label?S.navActive:{})}}
              onClick={()=>setActiveNav(item.label)}>
              <Ic n={item.icon} size={16} c={activeNav===item.label?"#1e4a47":"#64748b"}/>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={S.sideFooter}>
          <div style={S.doctorCard}>
            <div style={S.docAvatar}><Ic n="user" size={16} c="#fff"/></div>
            <div>
              <div style={S.docName}>Dr. Elena Rodriguez</div>
              <div style={S.docSpec}>Cardiology</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={S.main}>
        {/* TOPBAR */}
        <header style={S.topbar}>
          <div style={S.searchBox}>
            <Ic n="search" size={14} c="#94a3b8"/>
            <input style={S.searchIn} placeholder="Search patients or records..."/>
          </div>
          <div style={S.topRight}>
            <button style={S.iconBtn}><Ic n="bell" size={18} c="#475569"/><span style={S.dot}/></button>
            <div style={S.topAvatar}><Ic n="user" size={16} c="#fff"/></div>
          </div>
        </header>

        {/* CONTENT */}
        <div style={S.content}>
          {/* ── LEFT ── */}
          <div style={S.left}>
            <div style={S.crumb}>
              <span style={S.crumbLink}>Schedule</span>
              <Ic n="chevRsm" c="#94a3b8"/>
              <span style={S.crumbCur}>New Appointment</span>
            </div>
            <h1 style={S.h1}>Create Appointment {loading && <span style={{fontSize:14,color:"#94a3b8",fontWeight:400}}>(Updating...)</span>}</h1>
            {error && <div style={{color:"#ef4444",fontSize:13,fontWeight:600,marginBottom:8}}>Error: {error}</div>}
            <p style={S.sub}>Schedule a new clinical visit for a registered patient.</p>

            {/* STEP 1 – Patient */}
            <StepCard num="1" title="Select Patient">
              <Label>REGISTERED PATIENTS</Label>
              <div style={S.patientGrid}>
                {patients.map(p=>(
                  <button key={p.id}
                    style={{...S.patientBtn,...(patient?.id===p.id?S.patientBtnActive:{})}}
                    onClick={()=>setPatient(p)}>
                    <div style={{...S.pAvatar,backgroundColor:p.avatarColor}}>{p.initials}</div>
                    <div>
                      <div style={S.pName}>{p.name}</div>
                      <div style={S.pDob}>DOB {p.dob || "N/A"}</div>
                    </div>
                    {patient?.id===p.id && <div style={S.checkMark}><Ic n="check" size={11} c="#fff"/></div>}
                  </button>
                ))}
              </div>
            </StepCard>

            {/* STEP 2 – Service */}
            <StepCard num="2" title="Service Details">
              <div style={S.twoCol}>
                <div>
                  <Label>SERVICE TYPE</Label>
                  <Sel value={service} onChange={setService} options={SERVICE_TYPES}/>
                </div>
                <div>
                  <Label>DURATION (MIN)</Label>
                  <Sel value={duration} onChange={v=>setDuration(Number(v))} options={DURATIONS}/>
                </div>
              </div>
            </StepCard>

            {/* STEP 3 – Clinical Notes */}
            <StepCard num="3" title="Clinical Notes">
              <textarea
                style={S.textarea}
                placeholder="Add instructions, reason for visit, or pre-visit requirements..."
                value={notes}
                onChange={e=>setNotes(e.target.value)}
                rows={4}
              />
            </StepCard>

            {/* DISPATCH */}
            {!dispatched ? (
              <button style={S.dispatchBtn} onClick={handleDispatch}>
                <Ic n="send" size={16} c="#fff"/>
                Dispatch to Patient
              </button>
            ) : (
              <div style={S.successBanner}>
                <div style={S.successIcon}><Ic n="check" size={18} c="#16a34a"/></div>
                <div>
                  <div style={S.successTitle}>Appointment Dispatched — {lastId}</div>
                  <div style={S.successSub}>Patient will receive a confirmation request. Status: <b>Pending</b></div>
                </div>
                <button style={S.resetBtn} onClick={handleReset}>+ New</button>
              </div>
            )}

            {/* INFO STRIP */}
            <div style={S.infoStrip}>
              {[
                { icon:"bell", color:"#0284c7", bg:"#eff6ff", border:"#bae6fd", title:"AUTO-NOTIFY", text:"Patient is notified instantly via app & email once you dispatch." },
                { icon:"calCheck", color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0", title:"PENDING REVIEW", text:"Appointment stays pending until the patient confirms or declines." },
                { icon:"cog", color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe", title:"HIPAA SECURE", text:"All records are encrypted end-to-end per health compliance standards." },
              ].map(c=>(
                <div key={c.title} style={{...S.infoCard, backgroundColor:c.bg, borderColor:c.border}}>
                  <div style={{...S.infoIcon,color:c.color}}><Ic n={c.icon} size={13} c={c.color}/> {c.title}</div>
                  <p style={S.infoText}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT – Calendar & Summary ── */}
          <div style={S.right}>
            <div style={S.calCard}>
              <div style={S.calHdr}>
                <span style={S.calTitle}>{MONTHS[viewMonth]} {viewYear}</span>
                <div style={{display:"flex",gap:4}}>
                  <button style={S.calBtn} onClick={prevMonth}><Ic n="chevL" size={13} c="#475569"/></button>
                  <button style={S.calBtn} onClick={nextMonth}><Ic n="chevR" size={13} c="#475569"/></button>
                </div>
              </div>
              <div style={S.calGrid}>
                {DAYS.map(d=><div key={d} style={S.calDH}>{d}</div>)}
              </div>
              <div style={S.calGrid}>
                {cells.map((cell,i)=>{
                  const tod=!cell.out&&isToday(cell.d);
                  const sel=!cell.out&&isSel(cell.d);
                  return(
                    <div key={i}
                      style={{...S.calCell,...(cell.out?S.calOut:{}),...(tod?S.calToday:{}),...(sel&&!tod?S.calSel:{})}}
                      onClick={()=>!cell.out&&(setSelDay(cell.d),setSelMo(viewMonth),setSelYr(viewYear))}>
                      {cell.d}
                    </div>
                  );
                })}
              </div>

              {/* Time Slots */}
              <div style={S.slotLabel}>SELECT TIME SLOT</div>
              <div style={S.slotGrid}>
                {SLOTS.map(t=>{
                  const unavail = UNAVAILABLE.has(t);
                  const active  = selTime===t;
                  return(
                    <button key={t} disabled={unavail}
                      style={{...S.slot,...(unavail?S.slotOff:{}),...(active?S.slotOn:{})}}>
                      <span onClick={()=>!unavail&&setSelTime(t)}>{t}</span>
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              <div style={S.summary}>
                <div style={S.sumRow}>
                  <span style={S.sumLabel}>PATIENT</span>
                  <span style={S.sumVal}>{patient?.name || "None"}</span>
                </div>
                <div style={S.sumRow}>
                  <span style={S.sumLabel}>DATE & TIME</span>
                  <span style={S.sumVal}>{apptLabel}</span>
                </div>
                <div style={S.sumRow}>
                  <span style={S.sumLabel}>SERVICE</span>
                  <span style={S.sumVal}>{service}</span>
                </div>
                <div style={S.sumRow}>
                  <span style={S.sumLabel}>DURATION</span>
                  <span style={S.sumVal}>{duration} min</span>
                </div>
                <div style={{...S.sumRow,borderBottom:"none"}}>
                  <span style={S.sumLabel}>STATUS AFTER DISPATCH</span>
                  <span style={{...S.sumVal,...S.pending}}>Pending Patient</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StepCard({ num, title, children }) {
  return (
    <div style={S.stepCard}>
      <div style={S.stepHdr}>
        <div style={S.stepNum}>{num}</div>
        <span style={S.stepTitle}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function Label({ children }) {
  return <div style={S.label}>{children}</div>;
}

function Sel({ value, onChange, options }) {
  return (
    <div style={{position:"relative"}}>
      <select style={S.select} value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
      <div style={S.selIcon}><Ic n="chevD" size={13} c="#64748b"/></div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root:        { display:"flex", minHeight:"100vh", backgroundColor:"#f1f5f4", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#1e293b" },
  sidebar:     { width:210, backgroundColor:"#0f2d2b", display:"flex", flexDirection:"column", padding:"0", flexShrink:0, position:"sticky", top:0, height:"100vh" },
  brandBlock:  { display:"flex", alignItems:"center", gap:10, padding:"20px 18px 18px", borderBottom:"1px solid rgba(255,255,255,0.08)" },
  brandIcon:   { width:32, height:32, borderRadius:8, backgroundColor:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  brandName:   { fontSize:13, fontWeight:800, color:"#fff", letterSpacing:"-0.3px" },
  brandRole:   { fontSize:10, color:"rgba(255,255,255,0.45)", marginTop:1 },
  sideNav:     { display:"flex", flexDirection:"column", padding:"16px 10px", gap:2, flex:1 },
  navItem:     { display:"flex", alignItems:"center", gap:9, padding:"9px 11px", borderRadius:8, border:"none", background:"none", cursor:"pointer", fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.55)", textAlign:"left" },
  navActive:   { backgroundColor:"rgba(255,255,255,0.1)", color:"#a7f3d0", fontWeight:700 },
  sideFooter:  { padding:"14px 12px", borderTop:"1px solid rgba(255,255,255,0.08)" },
  doctorCard:  { display:"flex", alignItems:"center", gap:10 },
  docAvatar:   { width:32, height:32, borderRadius:"50%", backgroundColor:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  docName:     { fontSize:12, fontWeight:700, color:"#fff" },
  docSpec:     { fontSize:10, color:"rgba(255,255,255,0.45)" },
  main:        { flex:1, display:"flex", flexDirection:"column", minWidth:0 },
  topbar:      { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", height:54, backgroundColor:"#fff", borderBottom:"1px solid #e2e8f0", position:"sticky", top:0, zIndex:10 },
  searchBox:   { display:"flex", alignItems:"center", gap:8, backgroundColor:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:8, padding:"7px 13px", width:300 },
  searchIn:    { border:"none", background:"transparent", outline:"none", fontSize:13, color:"#475569", width:"100%" },
  topRight:    { display:"flex", alignItems:"center", gap:8 },
  iconBtn:     { background:"none", border:"none", cursor:"pointer", padding:7, borderRadius:8, display:"flex", alignItems:"center", position:"relative" },
  dot:         { position:"absolute", top:6, right:6, width:7, height:7, borderRadius:"50%", backgroundColor:"#ef4444", border:"1.5px solid #fff" },
  topAvatar:   { width:32, height:32, borderRadius:"50%", backgroundColor:"#0f2d2b", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" },
  content:     { display:"flex", gap:22, padding:"26px 28px", alignItems:"flex-start" },
  left:        { flex:1, display:"flex", flexDirection:"column", gap:14, minWidth:0 },
  right:       { width:300, flexShrink:0 },
  crumb:       { display:"flex", alignItems:"center", gap:6 },
  crumbLink:   { fontSize:12, color:"#64748b", cursor:"pointer" },
  crumbCur:    { fontSize:12, color:"#334155", fontWeight:600 },
  h1:          { fontSize:30, fontWeight:800, color:"#0a1f1e", margin:"4px 0 6px", letterSpacing:"-0.7px" },
  sub:         { fontSize:13.5, color:"#64748b", lineHeight:1.6, margin:"0 0 4px", maxWidth:500 },
  stepCard:    { backgroundColor:"#fff", borderRadius:14, padding:"20px 22px", border:"1px solid #e2e8f0", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" },
  stepHdr:     { display:"flex", alignItems:"center", gap:10, marginBottom:16 },
  stepNum:     { width:26, height:26, borderRadius:"50%", backgroundColor:"#e0f2fe", color:"#0369a1", fontSize:12, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  stepTitle:   { fontWeight:700, fontSize:15, color:"#0a1f1e" },
  label:       { fontSize:9.5, fontWeight:700, letterSpacing:"0.8px", color:"#94a3b8", marginBottom:9 },
  patientGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 },
  patientBtn:  { display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, border:"1.5px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", position:"relative", textAlign:"left" },
  patientBtnActive:{ border:"1.5px solid #1e4a47", backgroundColor:"#f0f9f8" },
  pAvatar:     { width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#334155", flexShrink:0 },
  pName:       { fontSize:13, fontWeight:700, color:"#0a1f1e" },
  pDob:        { fontSize:11, color:"#94a3b8", marginTop:1 },
  checkMark:   { position:"absolute", top:8, right:8, width:18, height:18, borderRadius:"50%", backgroundColor:"#1e4a47", display:"flex", alignItems:"center", justifyContent:"center" },
  twoCol:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
  select:      { width:"100%", appearance:"none", border:"1px solid #e2e8f0", borderRadius:9, padding:"10px 34px 10px 12px", fontSize:13, color:"#334155", background:"#fafafa", outline:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:500 },
  selIcon:     { position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" },
  textarea:    { width:"100%", border:"1px solid #e2e8f0", borderRadius:10, padding:"11px 13px", fontSize:13.5, color:"#475569", background:"#fafafa", outline:"none", resize:"none", fontFamily:"inherit", lineHeight:1.6, boxSizing:"border-box" },
  dispatchBtn: { alignSelf:"flex-start", display:"flex", alignItems:"center", gap:8, padding:"13px 26px", backgroundColor:"#1e4a47", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer", letterSpacing:"-0.2px" },
  successBanner:{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", backgroundColor:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:12 },
  successIcon: { width:36, height:36, borderRadius:"50%", backgroundColor:"#dcfce7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  successTitle:{ fontWeight:700, fontSize:14, color:"#0f2d2b" },
  successSub:  { fontSize:12, color:"#64748b", marginTop:2 },
  resetBtn:    { marginLeft:"auto", padding:"8px 14px", backgroundColor:"#1e4a47", color:"#fff", border:"none", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" },
  infoStrip:   { display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 },
  infoCard:    { borderRadius:11, padding:"14px 16px", border:"1px solid" },
  infoIcon:    { display:"flex", alignItems:"center", gap:5, fontSize:9.5, fontWeight:700, letterSpacing:"0.6px", marginBottom:7 },
  infoText:    { fontSize:12, color:"#475569", lineHeight:1.5, margin:0 },
  calCard:     { backgroundColor:"#fff", borderRadius:16, padding:"20px 18px", border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  calHdr:      { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 },
  calTitle:    { fontWeight:800, fontSize:15, color:"#0a1f1e", letterSpacing:"-0.3px" },
  calBtn:      { background:"none", border:"1px solid #e2e8f0", borderRadius:7, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" },
  calGrid:     { display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2, marginBottom:2 },
  calDH:       { textAlign:"center", fontSize:9.5, fontWeight:700, color:"#94a3b8", padding:"4px 0", letterSpacing:"0.3px" },
  calCell:     { textAlign:"center", padding:"7px 2px", borderRadius:7, fontSize:12, fontWeight:500, color:"#334155", cursor:"pointer" },
  calOut:      { color:"#e2e8f0", cursor:"default" },
  calToday:    { backgroundColor:"#1e4a47", color:"#fff", fontWeight:700 },
  calSel:      { backgroundColor:"#e8f2f1", color:"#1e4a47", fontWeight:700, border:"1px solid #1e4a47" },
  slotLabel:   { fontSize:9.5, fontWeight:700, letterSpacing:"0.8px", color:"#94a3b8", margin:"14px 0 8px" },
  slotGrid:    { display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 },
  slot:        { padding:"9px 6px", borderRadius:8, border:"1px solid #e2e8f0", backgroundColor:"#fafafa", fontSize:12, fontWeight:600, color:"#334155", cursor:"pointer" },
  slotOn:      { border:"1.5px solid #1e4a47", backgroundColor:"#f0f9f8", color:"#1e4a47" },
  slotOff:     { color:"#cbd5e1", backgroundColor:"#f8fafc", textDecoration:"line-through", cursor:"not-allowed" },
  summary:     { marginTop:16, border:"1px solid #e2e8f0", borderRadius:11, overflow:"hidden" },
  sumRow:      { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 14px", borderBottom:"1px solid #f1f5f9" },
  sumLabel:    { fontSize:9.5, fontWeight:700, letterSpacing:"0.6px", color:"#94a3b8" },
  sumVal:      { fontSize:12.5, fontWeight:600, color:"#0a1f1e", textAlign:"right", maxWidth:160 },
  pending:     { backgroundColor:"#fef9c3", color:"#ca8a04", padding:"2px 8px", borderRadius:20, fontSize:11 },
};
