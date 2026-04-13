// AdminRecords.jsx
// Admin view of ALL appointment records across all patients and doctors.
// Live-synced with appointmentStore — status changes from PatientConfirm
// appear here instantly. Admin can also cancel any appointment.

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    grid:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    calendar:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    users:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    chart:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    cog:        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    bell:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    search:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    filter:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    download:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    x:          <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    eye:        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    user:       <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    shield:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    chevD:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>,
    records:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>,
  };
  return map[n] || null;
}

const NAV = [
  { l:"Overview", i:"grid" },
  { l:"Schedule", i:"calendar" },
  { l:"Patients", i:"users" },
  { l:"Records",  i:"records", active:true },
  { l:"Analytics",i:"chart" },
  { l:"Settings", i:"cog" },
];

const ALL_STATUSES = ["all","pending","confirmed","cancelled"];
const ALL_SERVICES = ["all","General Consultation","Follow-Up Visit","Specialist Referral","Emergency Triage","Lab Review"];

export default function AdminRecords() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(() => {
    const data = localStorage.getItem("admin");
    return data ? JSON.parse(data) : null;
  });

  const [apts, setApts] = useState([]);
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("all");
  const [service, setService] = useState("all");
  const [sort,    setSort]    = useState("newest");
  const [expand,  setExpand]  = useState(null);
  const [activeNav,setActiveNav]=useState("Records");
  const [toast,   setToast]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!admin) {
      navigate("/admin-login");
      return;
    }

    const fetchAllApts = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/api/appointments", {
          headers: { "x-user-id": admin.id }
        });
        if (!res.ok) throw new Error("Failed to fetch appointment records");
        const data = await res.json();
        setApts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllApts();
    const interval = setInterval(fetchAllApts, 5000);
    return () => clearInterval(interval);
  }, [admin, navigate]);

  const handleCancel = (id) => {
    fetch(`http://localhost:3000/api/appointments/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-user-id": admin.id },
      body: JSON.stringify({ status: "cancelled" })
    })
      .then(res => res.json())
      .then(() => {
        setToast("Appointment cancelled by admin.");
        setApts(prev => prev.map(a => a.appid === id ? { ...a, status: "cancelled" } : a));
        setTimeout(()=>setToast(null), 3000);
      })
      .catch(err => console.error("Error cancelling appointment:", err));
  };

  // Filter + sort
  let filtered = apts
    .filter(a => status==="all" || a.status===status)
    .filter(a => service==="all" || a.serviceType===service)
    .filter(a => {
      const q = search.toLowerCase();
      return !q || (a.patient_name || "").toLowerCase().includes(q)
               || (a.doctor_name || "").toLowerCase().includes(q)
               || String(a.appid).toLowerCase().includes(q)
               || (a.service_type || "").toLowerCase().includes(q);
    });

  if (sort==="newest") filtered = filtered.slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
  if (sort==="oldest") filtered = filtered.slice().sort((a,b)=>new Date(a.created_at)-new Date(b.created_at));
  if (sort==="date")   filtered = filtered.slice().sort((a,b)=>new Date(a.appdate)-new Date(b.appdate));

  const counts = {
    total:     apts.length,
    pending:   apts.filter(a=>a.status==="pending").length,
    confirmed: apts.filter(a=>a.status==="confirmed").length,
    cancelled: apts.filter(a=>a.status==="cancelled").length,
  };

  return (
    <div style={A.root}>
      {/* SIDEBAR */}
      <aside style={A.sidebar}>
        <div style={A.brandBlock}>
          <div style={A.brandIcon}><Ic n="shield" size={15} c="#fff"/></div>
          <div>
            <div style={A.brandName}>MedSanctuary</div>
            <div style={A.brandRole}>Admin Console</div>
          </div>
        </div>
        <nav style={A.sideNav}>
          {NAV.map(n=>(
            <button key={n.l}
              style={{...A.navItem,...(activeNav===n.l?A.navActive:{})}}
              onClick={()=>setActiveNav(n.l)}>
              <Ic n={n.i} size={15} c={activeNav===n.l?"#1e4a47":"rgba(255,255,255,0.45)"}/>
              {n.l}
            </button>
          ))}
        </nav>
        <div style={S.stats}>
          <div style={S.statItem}>
            <div style={S.statVal}>{loading ? "..." : apts.length}</div>
            <div style={S.statLab}>Total</div>
          </div>
          <div style={S.statItem}>
            <div style={S.statVal}>{loading ? "..." : apts.filter(a=>a.status==="pending").length}</div>
            <div style={S.statLab}>Pending</div>
          </div>
        </div>
        <div style={A.sideFooter}>
          <div style={A.adminCard}>
            <div style={A.adminAvatar}><Ic n="user" size={14} c="#fff"/></div>
            <div>
              <div style={A.adminName}>{admin?.name || "Admin User"}</div>
              <div style={A.adminRole}>Health Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={A.main}>
        {/* TOPBAR */}
        <header style={A.topbar}>
          <div>
            <div style={A.topBreadcrumb}>Dashboard <span style={{color:"#94a3b8",margin:"0 5px"}}>›</span> Appointment Records</div>
          </div>
          <div style={A.topRight}>
            <button style={A.iconBtn}><Ic n="bell" size={17} c="#475569"/>{counts.pending>0&&<span style={A.dot}>{counts.pending}</span>}</button>
            <button style={A.exportBtn}><Ic n="download" size={14} c="#1e4a47"/> Export CSV</button>
          </div>
        </header>

        {error && (
          <div style={{...S.empty, color:"#dc2626", border:"1px solid #fecaca", backgroundColor:"#fef2f2", padding:"12px", borderRadius:10, marginBottom:20}}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={S.tabs}>
          {/* PAGE TITLE */}
          <div style={A.titleRow}>
            <div>
              <h1 style={A.h1}>Appointment Records</h1>
              <p style={A.sub}>Complete log of all scheduled visits across the facility.</p>
            </div>
          </div>

          {/* STAT CARDS */}
          <div style={A.statGrid}>
            {[
              { label:"Total Records",  value:counts.total,     color:"#1e4a47", bg:"#f0f9f8", border:"#c7e7e5" },
              { label:"Pending",        value:counts.pending,   color:"#ca8a04", bg:"#fefce8", border:"#fde68a" },
              { label:"Confirmed",      value:counts.confirmed, color:"#16a34a", bg:"#f0fdf4", border:"#bbf7d0" },
              { label:"Cancelled",      value:counts.cancelled, color:"#dc2626", bg:"#fff5f5", border:"#fecaca" },
            ].map(s=>(
              <div key={s.label} style={{...A.statCard, backgroundColor:s.bg, borderColor:s.border}}>
                <div style={{...A.statNum, color:s.color}}>{s.value}</div>
                <div style={A.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* FILTERS */}
          <div style={A.filterBar}>
            <div style={A.searchWrap}>
              <Ic n="search" size={14} c="#94a3b8"/>
              <input
                style={A.searchIn}
                placeholder="Search patient, doctor, ID, or service..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
              />
              {search && <button style={A.clearBtn} onClick={()=>setSearch("")}><Ic n="x" size={13} c="#94a3b8"/></button>}
            </div>
            <div style={A.filterRight}>
              <FilterSel label="Status" value={status} onChange={setStatus}
                options={ALL_STATUSES.map(s=>({value:s,label:s==="all"?"All Statuses":s.charAt(0).toUpperCase()+s.slice(1)}))}/>
              <FilterSel label="Service" value={service} onChange={setService}
                options={ALL_SERVICES.map(s=>({value:s,label:s==="all"?"All Services":s}))}/>
              <FilterSel label="Sort" value={sort} onChange={setSort}
                options={[{value:"newest",label:"Newest First"},{value:"oldest",label:"Oldest First"},{value:"date",label:"Appointment Date"}]}/>
            </div>
          </div>

          {/* RESULT COUNT */}
          <div style={A.resultCount}>
            Showing <b>{filtered.length}</b> of <b>{apts.length}</b> records
          </div>

          {/* TABLE */}
          {filtered.length===0 ? (
            <div style={A.empty}>
              <Ic n="records" size={40} c="#cbd5e1"/>
              <div style={A.emptyTitle}>No records found</div>
              <div style={A.emptySub}>Try adjusting your search or filter criteria.</div>
            </div>
          ) : (
            <div style={A.tableWrap}>
              <table style={A.table}>
                <thead>
                  <tr style={A.thead}>
                    {["ID","Patient","Doctor","Service","Date & Time","Duration","Status","Actions"].map(h=>(
                      <th key={h} style={A.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(apt=>{
                    const sc = statusColor(apt.status);
                    const isExp = expand === apt.appid;
                    return [
                      <tr key={apt.appid}
                        style={{...A.tr,...(isExp?A.trExp:{})}}
                        onClick={()=>setExpand(isExp?null:apt.appid)}>
                        <td style={A.td}><span style={A.aptId}>APT-{apt.appid}</span></td>
                        <td style={A.td}>
                          <div style={A.patientCell}>
                            <div style={{...A.pAvatar, backgroundColor:"#cbd5e1"}}>
                              {(apt.patient_name || "P").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={A.pName}>{apt.patient_name}</div>
                              <div style={A.pDob}>Patient ID #{apt.reservation_id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={A.td}><div style={A.docName}>{apt.doctor_name || `Doctor #${apt.docid}`}</div><div style={A.docSpec}>{apt.appspe}</div></td>
                        <td style={A.td}><span style={A.serviceTag}>{apt.service_type}</span></td>
                        <td style={A.td}><div style={A.dateVal}>{formatDate(apt.appdate)}</div><div style={A.timeVal}>{apt.timing}</div></td>
                        <td style={{...A.td, textAlign:"center"}}><span style={A.duration}>{apt.duration}m</span></td>
                        <td style={A.td}>
                          <span style={{...A.badge, backgroundColor:sc.bg, color:sc.text, border:`1px solid ${sc.border}`}}>
                            {apt.status.charAt(0).toUpperCase()+apt.status.slice(1)}
                          </span>
                        </td>
                        <td style={A.td} onClick={e=>e.stopPropagation()}>
                          <div style={A.actionCell}>
                            <button style={A.viewBtn} onClick={()=>setExpand(isExp?null:apt.appid)}>
                              <Ic n="eye" size={13} c="#1e4a47"/>
                            </button>
                            {apt.status!=="cancelled" && (
                              <button style={A.cancelBtn} onClick={()=>handleCancel(apt.appid)}>
                                <Ic n="x" size={13} c="#dc2626"/>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>,
                      // Expanded row
                      isExp && (
                        <tr key={apt.id+"-exp"}>
                          <td colSpan={8} style={A.expTd}>
                            <div style={A.expPanel}>
                              <div style={A.expGrid}>
                                <div><span style={A.expLabel}>APPOINTMENT ID</span><div style={A.expVal}>APT-{apt.appid}</div></div>
                                <div><span style={A.expLabel}>CREATED AT</span><div style={A.expVal}>{new Date(apt.created_at).toLocaleString()}</div></div>
                                <div><span style={A.expLabel}>PATIENT ID</span><div style={A.expVal}>#{apt.reservation_id}</div></div>
                                <div><span style={A.expLabel}>FULL DOCTOR</span><div style={A.expVal}>{apt.doctor_name} · {apt.appspe}</div></div>
                              </div>
                              {apt.notes && (
                                <div style={A.notesBox}>
                                  <div style={A.notesLabel}>CLINICAL NOTES</div>
                                  <p style={A.notesText}>{apt.notes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    ];
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{...A.toast}}>
          {toast}
        </div>
      )}
    </div>
  );
}

function FilterSel({ label, value, onChange, options }) {
  return (
    <div style={{position:"relative"}}>
      <select style={A.filterSelect} value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div style={A.selIcon}><Ic n="chevD" size={12} c="#64748b"/></div>
    </div>
  );
}

const A = {
  root:       { display:"flex", minHeight:"100vh", backgroundColor:"#f1f5f4", fontFamily:"'DM Sans','Segoe UI',sans-serif", color:"#1e293b" },
  sidebar:    { width:210, backgroundColor:"#0a1f1e", display:"flex", flexDirection:"column", flexShrink:0, position:"sticky", top:0, height:"100vh" },
  brandBlock: { display:"flex", alignItems:"center", gap:10, padding:"20px 16px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)" },
  brandIcon:  { width:32, height:32, borderRadius:8, backgroundColor:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  brandName:  { fontSize:13, fontWeight:800, color:"#fff", letterSpacing:"-0.3px" },
  brandRole:  { fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:1 },
  sideNav:    { display:"flex", flexDirection:"column", padding:"14px 10px", gap:2, flex:1 },
  navItem:    { display:"flex", alignItems:"center", gap:9, padding:"9px 10px", borderRadius:8, border:"none", background:"none", cursor:"pointer", fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.45)", textAlign:"left" },
  navActive:  { backgroundColor:"rgba(255,255,255,0.08)", color:"#a7f3d0", fontWeight:700 },
  sideFooter: { padding:"12px 12px 16px", borderTop:"1px solid rgba(255,255,255,0.07)" },
  adminCard:  { display:"flex", alignItems:"center", gap:10 },
  adminAvatar:{ width:30, height:30, borderRadius:"50%", backgroundColor:"rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  adminName:  { fontSize:12, fontWeight:700, color:"#fff" },
  adminRole:  { fontSize:10, color:"rgba(255,255,255,0.35)" },
  main:       { flex:1, display:"flex", flexDirection:"column", minWidth:0 },
  topbar:     { display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 28px", height:52, backgroundColor:"#fff", borderBottom:"1px solid #e2e8f0", position:"sticky", top:0, zIndex:10 },
  topBreadcrumb:{ fontSize:13, color:"#334155", fontWeight:600 },
  topRight:   { display:"flex", alignItems:"center", gap:10 },
  iconBtn:    { background:"none", border:"none", cursor:"pointer", padding:7, borderRadius:8, display:"flex", alignItems:"center", position:"relative" },
  dot:        { position:"absolute", top:4, right:4, width:16, height:16, borderRadius:"50%", backgroundColor:"#ef4444", color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" },
  exportBtn:  { display:"flex", alignItems:"center", gap:6, padding:"8px 14px", backgroundColor:"#f0f9f8", color:"#1e4a47", border:"1px solid #c7e7e5", borderRadius:8, fontSize:12.5, fontWeight:700, cursor:"pointer" },
  body:       { padding:"24px 28px", display:"flex", flexDirection:"column", gap:18 },
  titleRow:   { display:"flex", justifyContent:"space-between", alignItems:"flex-start" },
  h1:         { fontSize:26, fontWeight:800, color:"#0a1f1e", margin:"0 0 4px", letterSpacing:"-0.5px" },
  sub:        { fontSize:13, color:"#64748b", margin:0 },
  statGrid:   { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 },
  statCard:   { borderRadius:12, padding:"16px 18px", border:"1px solid" },
  statNum:    { fontSize:24, fontWeight:800, lineHeight:1, marginBottom:4 },
  statLabel:  { fontSize:11, color:"#64748b", fontWeight:500 },
  filterBar:  { display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" },
  searchWrap: { display:"flex", alignItems:"center", gap:8, backgroundColor:"#fff", border:"1px solid #e2e8f0", borderRadius:9, padding:"8px 13px", flex:1, minWidth:200 },
  searchIn:   { border:"none", background:"transparent", outline:"none", fontSize:13, color:"#334155", flex:1 },
  clearBtn:   { background:"none", border:"none", cursor:"pointer", display:"flex", padding:0 },
  filterRight:{ display:"flex", gap:8 },
  filterSelect:{ appearance:"none", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 32px 8px 12px", fontSize:12.5, color:"#334155", background:"#fff", outline:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:500 },
  selIcon:    { position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" },
  resultCount:{ fontSize:12.5, color:"#64748b" },
  empty:      { display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"50px 20px", color:"#94a3b8" },
  emptyTitle: { fontSize:15, fontWeight:700, color:"#334155" },
  emptySub:   { fontSize:13, color:"#94a3b8", textAlign:"center" },
  tableWrap:  { backgroundColor:"#fff", borderRadius:14, border:"1px solid #e2e8f0", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" },
  table:      { width:"100%", borderCollapse:"collapse" },
  thead:      { backgroundColor:"#f8fafc" },
  th:         { padding:"11px 14px", fontSize:10.5, fontWeight:700, letterSpacing:"0.5px", color:"#94a3b8", textAlign:"left", borderBottom:"1px solid #e2e8f0", whiteSpace:"nowrap" },
  tr:         { borderBottom:"1px solid #f1f5f9", cursor:"pointer", transition:"background 0.1s" },
  trExp:      { backgroundColor:"#fafffe" },
  td:         { padding:"13px 14px", fontSize:13, verticalAlign:"middle" },
  aptId:      { fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:"0.4px" },
  patientCell:{ display:"flex", alignItems:"center", gap:9 },
  pAvatar:    { width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"#334155", flexShrink:0 },
  pName:      { fontSize:13, fontWeight:700, color:"#0a1f1e" },
  pDob:       { fontSize:10.5, color:"#94a3b8" },
  docName:    { fontSize:12.5, fontWeight:600, color:"#334155" },
  docSpec:    { fontSize:10.5, color:"#94a3b8" },
  serviceTag: { fontSize:11.5, fontWeight:600, color:"#475569", backgroundColor:"#f1f5f9", padding:"3px 9px", borderRadius:20 },
  dateVal:    { fontSize:12.5, fontWeight:600, color:"#334155" },
  timeVal:    { fontSize:11, color:"#94a3b8" },
  duration:   { fontSize:12, fontWeight:700, color:"#64748b", backgroundColor:"#f1f5f9", padding:"3px 8px", borderRadius:6 },
  badge:      { fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:"0.2px", whiteSpace:"nowrap" },
  actionCell: { display:"flex", gap:6 },
  viewBtn:    { padding:"6px 8px", borderRadius:7, border:"1px solid #c7e7e5", backgroundColor:"#f0f9f8", cursor:"pointer", display:"flex", alignItems:"center" },
  cancelBtn:  { padding:"6px 8px", borderRadius:7, border:"1px solid #fecaca", backgroundColor:"#fff5f5", cursor:"pointer", display:"flex", alignItems:"center" },
  expTd:      { padding:0, backgroundColor:"#f8fffe", borderBottom:"1px solid #e2e8f0" },
  expPanel:   { padding:"16px 20px" },
  expGrid:    { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px 20px", marginBottom:12 },
  expLabel:   { fontSize:9.5, fontWeight:700, letterSpacing:"0.6px", color:"#94a3b8", display:"block", marginBottom:3 },
  expVal:     { fontSize:12.5, fontWeight:600, color:"#334155" },
  notesBox:   { backgroundColor:"#fff", border:"1px solid #e2e8f0", borderRadius:8, padding:"11px 14px" },
  notesLabel: { fontSize:9.5, fontWeight:700, letterSpacing:"0.6px", color:"#94a3b8", marginBottom:5 },
  notesText:  { fontSize:12.5, color:"#475569", lineHeight:1.6, margin:0 },
  toast:      { position:"fixed", bottom:26, right:26, padding:"13px 20px", borderRadius:11, fontSize:13.5, fontWeight:700, backgroundColor:"#fef3c7", color:"#92400e", border:"1px solid #fde68a", boxShadow:"0 6px 20px rgba(0,0,0,0.1)", zIndex:200 },
};
