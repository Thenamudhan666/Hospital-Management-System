// PatientConfirm.jsx
// Patient-facing view. Shows all "pending" appointments assigned to them
// and lets them confirm or decline. Confirmed/declined status syncs back
// to appointmentStore so AdminRecords reflects the change instantly.

import { useState, useEffect } from "react";

const formatDate = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

const statusColor = (status) => {
  return status === "confirmed"  ? { bg: "#dcfce7", text: "#16a34a", border: "#bbf7d0" }
       : status === "cancelled" || status === "declined"  ? { bg: "#fee2e2", text: "#dc2626", border: "#fecaca" }
       :                           { bg: "#fef9c3", text: "#ca8a04", border: "#fde68a" };
};

function Ic({ n, size=17, c="currentColor" }) {
  const s = { width:size, height:size, flexShrink:0 };
  const map = {
    calendar:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    clock:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    user:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    stethoscope:<svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>,
    tag:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    check:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
    x:         <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    bell:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    info:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    notes:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="8" y1="9" x2="10" y2="9"/></svg>,
    shield:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  };
  return map[n] || null;
}

// Pattern: read user data from localStorage as per login logic
const getStoredUser = () => {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
};

export default function PatientConfirm() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [apts, setApts] = useState([]);
  const [tab, setTab]   = useState("pending"); // pending | confirmed | cancelled
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchMyApts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:3000/api/appointments?reservation_id=${user.id}`, {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id
          }
        });
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const data = await res.json();
        setApts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyApts();
    const interval = setInterval(fetchMyApts, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const shown = apts.filter(a => a.status === tab);

  const act = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:3000/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setToast(status === "confirmed" ? "✓ Appointment confirmed!" : "✗ Appointment declined.");
      setApts(prev => prev.map(a => a.appid === id ? { ...a, status } : a));
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const counts = {
    pending:   apts.filter(a=>a.status==="pending").length,
    confirmed: apts.filter(a=>a.status==="confirmed").length,
    cancelled: apts.filter(a=>a.status==="cancelled").length,
  };

  return (
    <div style={P.root}>
      {/* TOP HEADER */}
      <header style={P.header}>
        <div style={P.headerLeft}>
          <div style={P.logo}>
            <Ic n="shield" size={16} c="#fff"/>
          </div>
          <div>
            <div style={P.logoName}>MedSanctuary</div>
            <div style={P.logoSub}>Patient Portal</div>
          </div>
        </div>
        <div style={P.headerRight}>
          <button style={P.iconBtn}>
            <Ic n="bell" size={18} c="#475569"/>
            {counts.pending > 0 && <span style={P.dot}>{counts.pending}</span>}
          </button>
          <div style={P.avatarArea}>
            <div style={{...P.bigAvatar, backgroundColor:"#bfdbfe"}}>
              {(user?.username || "P").charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={P.avatarName}>{user?.username || "Guest"}</div>
              <div style={P.avatarSub}>Patient ID #{user?.id || "N/A"}</div>
            </div>
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <div style={P.hero}>
        <div style={P.heroInner}>
          <h1 style={P.heroH1}>Your Appointments</h1>
          <p style={P.heroSub}>Review and confirm upcoming visits scheduled by your care team. Your response helps us prepare effectively.</p>
          <div style={P.statRow}>
            {[
              { label:"Awaiting Confirmation", value: counts.pending,   color:"#ca8a04", bg:"#fef9c3" },
              { label:"Confirmed",             value: counts.confirmed, color:"#16a34a", bg:"#dcfce7" },
              { label:"Declined",              value: counts.cancelled, color:"#dc2626", bg:"#fee2e2" },
            ].map(s=>(
              <div key={s.label} style={{...P.stat, backgroundColor:s.bg}}>
                <div style={{...P.statNum, color:s.color}}>{s.value}</div>
                <div style={P.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={P.content}>
        {/* TABS */}
        <div style={P.tabs}>
          {["pending","confirmed","cancelled"].map(t=>(
            <button key={t}
              style={{...P.tab,...(tab===t?P.tabActive:{})}}
              onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {counts[t]>0 && <span style={{...P.tabBadge,...(tab===t?P.tabBadgeActive:{})}}>{counts[t]}</span>}
            </button>
          ))}
        </div>

        {/* CARDS */}
        {error ? (
          <div style={P.errorBanner}>
            <Ic n="x" size={16} c="#dc2626"/> Error: {error}
          </div>
        ) : loading && apts.length === 0 ? (
          <div style={P.empty}>Loading your records...</div>
        ) : shown.length === 0 ? (
          <div style={P.empty}>
            <Ic n="calendar" size={36} c="#cbd5e1"/>
            <div style={P.emptyText}>No {tab} appointments</div>
            <div style={P.emptySub}>
              {tab==="pending"
                ? "Your care team hasn't scheduled any visits requiring confirmation yet."
                : `No ${tab} appointments to display.`}
            </div>
          </div>
        ) : (
          <div style={P.cards}>
            {shown.map(apt => (
              <AppointmentCard key={apt.appid} apt={apt} onAct={act}/>
            ))}
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{...P.toast,...(toast.startsWith("✓")?P.toastGreen:P.toastRed)}}>
          {toast}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ apt, onAct }) {
  const sc     = statusColor(apt.status);
  const isPend = apt.status === "pending";

  return (
    <div style={C.card}>
      {/* Card header */}
      <div style={C.cardTop}>
        <div style={C.idRow}>
          <span style={C.id}>APT-{apt.appid}</span>
          <span style={{...C.badge, backgroundColor:sc.bg, color:sc.text, border:`1px solid ${sc.border}`}}>
            {apt.status.charAt(0).toUpperCase()+apt.status.slice(1)}
          </span>
        </div>
        <div style={C.service}>{apt.serviceType}</div>
      </div>

      {/* Details grid */}
      <div style={C.detailGrid}>
        <Detail icon="stethoscope" label="DOCTOR" value={`Dr. Elena Rodriguez · Cardiology`}/>
        <Detail icon="calendar" label="DATE" value={formatDate(apt.appdate)}/>
        <Detail icon="clock" label="TIME & DURATION" value={`${apt.timing} · ${apt.duration} min`}/>
        <Detail icon="tag" label="SERVICE" value={apt.serviceType}/>
      </div>

      {/* Notes */}
      {apt.notes && (
        <div style={C.notesBox}>
          <div style={C.notesLabel}><Ic n="notes" size={12} c="#64748b"/> DOCTOR'S NOTE</div>
          <p style={C.notesText}>{apt.notes}</p>
        </div>
      )}

      {/* Actions */}
      {isPend && (
        <div style={C.actions}>
          <button style={C.declineBtn} onClick={()=>onAct(apt.appid,"cancelled")}>
            <Ic n="x" size={14} c="#dc2626"/> Decline
          </button>
          <button style={C.confirmBtn} onClick={()=>onAct(apt.appid,"confirmed")}>
            <Ic n="check" size={14} c="#fff"/> Confirm Visit
          </button>
        </div>
      )}
      {!isPend && (
        <div style={{...C.actions, justifyContent:"flex-start"}}>
          <span style={{fontSize:12, color:"#64748b"}}>
            {apt.status==="confirmed"
              ? "✓ You confirmed this appointment."
              : "✗ You declined this appointment."}
          </span>
        </div>
      )}
    </div>
  );
}

function Detail({ icon, label, value }) {
  return (
    <div style={C.detail}>
      <div style={C.detailLabel}><Ic n={icon} size={11} c="#94a3b8"/> {label}</div>
      <div style={C.detailVal}>{value}</div>
    </div>
  );
}

// ─── Patient styles ───────────────────────────────────────────────────────────
const P = {
  root:       { minHeight:"100vh", backgroundColor:"#f4f7f6", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#1e293b" },
  header:     { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 36px", height:58, backgroundColor:"#fff", borderBottom:"1px solid #e2e8f0", position:"sticky", top:0, zIndex:10 },
  headerLeft: { display:"flex", alignItems:"center", gap:10 },
  logo:       { width:34, height:34, borderRadius:9, backgroundColor:"#1e4a47", display:"flex", alignItems:"center", justifyContent:"center" },
  logoName:   { fontSize:13, fontWeight:800, color:"#0a1f1e", letterSpacing:"-0.3px" },
  logoSub:    { fontSize:10, color:"#94a3b8", marginTop:1 },
  headerRight:{ display:"flex", alignItems:"center", gap:14 },
  iconBtn:    { background:"none", border:"none", cursor:"pointer", padding:7, borderRadius:8, display:"flex", alignItems:"center", position:"relative" },
  dot:        { position:"absolute", top:4, right:4, width:16, height:16, borderRadius:"50%", backgroundColor:"#ef4444", color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" },
  avatarArea: { display:"flex", alignItems:"center", gap:10 },
  bigAvatar:  { width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:"#334155" },
  avatarName: { fontSize:13, fontWeight:700, color:"#0a1f1e" },
  avatarSub:  { fontSize:10, color:"#94a3b8" },
  hero:       { backgroundColor:"#0f2d2b", padding:"36px 36px 32px" },
  heroInner:  { maxWidth:860, margin:"0 auto" },
  heroH1:     { fontSize:28, fontWeight:800, color:"#fff", margin:"0 0 8px", letterSpacing:"-0.6px" },
  heroSub:    { fontSize:14, color:"rgba(255,255,255,0.55)", lineHeight:1.6, margin:"0 0 22px", maxWidth:520 },
  statRow:    { display:"flex", gap:12 },
  stat:       { padding:"12px 20px", borderRadius:12, minWidth:140 },
  statNum:    { fontSize:22, fontWeight:800, lineHeight:1 },
  statLabel:  { fontSize:11, color:"#64748b", marginTop:4, fontWeight:500 },
  content:    { maxWidth:860, margin:"0 auto", padding:"28px 36px" },
  tabs:       { display:"flex", gap:4, marginBottom:20, borderBottom:"1px solid #e2e8f0", paddingBottom:0 },
  tab:        { padding:"8px 18px 10px", border:"none", background:"none", cursor:"pointer", fontSize:13.5, fontWeight:600, color:"#64748b", display:"flex", alignItems:"center", gap:7, borderBottom:"2px solid transparent", marginBottom:"-1px" },
  tabActive:  { color:"#1e4a47", borderBottomColor:"#1e4a47" },
  tabBadge:   { fontSize:10, fontWeight:700, backgroundColor:"#f1f5f9", color:"#64748b", padding:"1px 7px", borderRadius:20 },
  tabBadgeActive:{ backgroundColor:"#e8f2f1", color:"#1e4a47" },
  empty:      { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, padding:"60px 20px", color:"#94a3b8" },
  emptyText:  { fontSize:15, fontWeight:700, color:"#334155" },
  emptySub:   { fontSize:13, color:"#94a3b8", textAlign:"center", maxWidth:340, lineHeight:1.5 },
  cards:      { display:"flex", flexDirection:"column", gap:16 },
  toast:         { position:"fixed", bottom:26, right:26, padding:"13px 20px", borderRadius:11, fontSize:13.5, fontWeight:700, backgroundColor:"#fef3c7", color:"#92400e", border:"1px solid #fde68a", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", zIndex:200 },
  errorBanner:   { padding:"12px 18px", backgroundColor:"#fff1f2", color:"#be123c", border:"1px solid #fecaca", borderRadius:10, fontSize:14, fontWeight:600, display:"flex", alignItems:"center", gap:10, marginBottom:20 },
  toastGreen: { backgroundColor:"#dcfce7", color:"#16a34a", border:"1px solid #bbf7d0" },
  toastRed:   { backgroundColor:"#fee2e2", color:"#dc2626", border:"1px solid #fecaca" },
};

const C = {
  card:       { backgroundColor:"#fff", borderRadius:16, padding:"22px 24px", border:"1px solid #e2e8f0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  cardTop:    { marginBottom:16 },
  idRow:      { display:"flex", alignItems:"center", gap:10, marginBottom:4 },
  id:         { fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"0.5px" },
  badge:      { fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:20, letterSpacing:"0.3px" },
  service:    { fontSize:17, fontWeight:800, color:"#0a1f1e", letterSpacing:"-0.3px" },
  detailGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px 20px", marginBottom:14 },
  detail:     {},
  detailLabel:{ display:"flex", alignItems:"center", gap:4, fontSize:9.5, fontWeight:700, letterSpacing:"0.6px", color:"#94a3b8", marginBottom:3 },
  detailVal:  { fontSize:13, fontWeight:600, color:"#334155" },
  notesBox:   { backgroundColor:"#fafafa", border:"1px solid #f1f5f9", borderRadius:10, padding:"12px 14px", marginBottom:14 },
  notesLabel: { display:"flex", alignItems:"center", gap:6, fontSize:9.5, fontWeight:700, letterSpacing:"0.6px", color:"#64748b", marginBottom:6 },
  notesText:  { fontSize:13, color:"#475569", lineHeight:1.6, margin:0 },
  actions:    { display:"flex", gap:10, justifyContent:"flex-end", marginTop:4 },
  confirmBtn: { display:"flex", alignItems:"center", gap:7, padding:"11px 22px", backgroundColor:"#1e4a47", color:"#fff", border:"none", borderRadius:9, fontSize:13.5, fontWeight:700, cursor:"pointer" },
  declineBtn: { display:"flex", alignItems:"center", gap:7, padding:"11px 20px", backgroundColor:"#fff", color:"#dc2626", border:"1.5px solid #fca5a5", borderRadius:9, fontSize:13.5, fontWeight:700, cursor:"pointer" },
};
