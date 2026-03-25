// ================================================================
//  FILE: frontend/src/pages/ApplicationFormPage.jsx
//
//  Parent application datasheet (4 steps) → POST /api/parent/applications
// ================================================================
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { parentApi } from '../services/api';

/** Maps UI state → Spring Boot ApplicationService.submitApplication body */
function buildApplicationPayload(child, applicant, mother, father) {
  const opt = (v) => {
    if (v == null) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
  };
  return {
    applicantNameEnglish: applicant.nameEn.trim(),
    applicantNameSinhala: applicant.nameSi.trim(),
    applicantRelationship: applicant.relationship,
    contactNumber: applicant.contact.trim(),
    phoneNumber: applicant.phone.trim(),
    addressLine1: applicant.addrLine1.trim(),
    addressLine2: applicant.addrLine2?.trim() || '',
    addressLine3: applicant.addrLine3?.trim() || '',
    town: applicant.town.trim(),
    street: applicant.street.trim(),
    district: applicant.district,
    applicantNic: applicant.nic.trim(),
    locationLink: applicant.mapsLink.trim(),
    childNameEnglish: child.nameEn.trim(),
    childNameSinhala: child.nameSi.trim(),
    birthCertNumber: child.certNo.trim(),
    birthCertDivision: child.certDivision.trim(),
    birthCertDistrict: child.certDistrict,
    dateOfBirth: child.dob,
    category: applicant.category,
    motherFullName: opt(mother.name),
    motherContact: opt(mother.contact),
    motherIdNumber: opt(mother.nic),
    motherOccupation: opt(mother.occupation),
    motherPlaceOfWork: opt(mother.workplace),
    motherEmail: opt(mother.email),
    fatherFullName: opt(father.name),
    fatherContact: opt(father.contact),
    fatherIdNumber: opt(father.nic),
    fatherOccupation: opt(father.occupation),
    fatherPlaceOfWork: opt(father.workplace),
    fatherEmail: opt(father.email),
  };
}

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────
const SRI_LANKA_DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Kegalle',
];

const CATEGORIES = [
  { code: 'OG', label: 'OG — Old Girls / Old Boys' },
  { code: 'SIS', label: 'SIS — Siblings' },
  { code: 'CO', label: 'CO — Category CO' },
  { code: 'TR', label: 'TR — Transfer' },
  { code: 'ED', label: 'ED — Educational' },
  { code: 'AB', label: 'AB — Abroad / Other' },
];

const SECTION_LABELS = ['Applicant', 'Child', 'Parents', 'Review'];

// ─────────────────────────────────────────────────────────────
//  UTILITIES
// ─────────────────────────────────────────────────────────────
function haversine(lat1, lon1, lat2 = 6.9271, lon2 = 79.8612) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}

function extractCoords(link) {
  if (!link) return null;
  const m = link.match(/[@?q=](-?\d+\.\d+),(-?\d+\.\d+)/);
  return m ? { lat: parseFloat(m[1]), lon: parseFloat(m[2]) } : null;
}

// ─────────────────────────────────────────────────────────────
//  THEME TOKENS
// ─────────────────────────────────────────────────────────────
const LIGHT = {
  pageBg:        "#e8f0fb",
  headerBg:      "linear-gradient(135deg,#0d2044 60%,#1a4fa0)",
  cardBg:        "#ffffff",
  cardBorder:    "#c8d8f0",
  inputBg:       "#f0f5fd",
  inputBorder:   "#c8d8f0",
  inputFocus:    "#1a4fa0",
  inputShadow:   "rgba(26,79,160,0.12)",
  text:          "#0d2044",
  textMuted:     "#6b7280",
  progressBg:    "#ffffff",
  groupTitle:    "#c4952a",
  sectionTitle:  "#0d2044",
  navBorder:     "#c8d8f0",
  chipBg:        "#ffffff",
  chipBorder:    "#c8d8f0",
  chipText:      "#0d2044",
  chipSelected:  { bg:"#fdf3dc", border:"#c4952a", text:"#7a5a10" },
  reviewBg:      "#f0f5fd",
  reviewBorder:  "#c8d8f0",
  distanceBg:    "rgba(196,149,42,0.08)",
  distanceBorder:"rgba(196,149,42,0.3)",
  parentMother:  { header:"#fdf2f8", headerText:"#9d174d", headerBorder:"#fce7f3", badgeBg:"#fce7f3", badgeText:"#9d174d" },
  parentFather:  { header:"#eff6ff", headerText:"#1e40af", headerBorder:"#dbeafe", badgeBg:"#dbeafe", badgeText:"#1e40af" },
  btnOutlineBg:  "#ffffff",
  btnOutlineBorder: "#c8d8f0",
  btnOutlineText:"#0d2044",
  stepDoneBg:    "#c4952a",
  stepDoneText:  "#ffffff",
  stepActiveBg:  "#1a4fa0",
  stepActiveText:"#ffffff",
  stepDefaultBg: "#e5e7eb",
  stepDefaultText:"#6b7280",
  stepLineDone:  "#c4952a",
  stepLineDefault:"#c8d8f0",
  stepLabelActive:"#1a4fa0",
  stepLabelDefault:"#6b7280",
  toastSuccess:  { bg:"#dcfce7", border:"#86efac", text:"#14532d" },
  toastError:    { bg:"#fee2e2", border:"#fca5a5", text:"#7f1d1d" },
};

const DARK = {
  pageBg:        "#0d1b2e",
  headerBg:      "linear-gradient(135deg,#060e1c 60%,#0d2044)",
  cardBg:        "rgba(2,8,25,0.75)",
  cardBorder:    "rgba(180,160,100,0.2)",
  inputBg:       "rgba(255,255,255,0.05)",
  inputBorder:   "rgba(180,160,100,0.25)",
  inputFocus:    "rgba(196,149,42,0.7)",
  inputShadow:   "rgba(196,149,42,0.12)",
  text:          "#f0ead8",
  textMuted:     "rgba(255,255,255,0.4)",
  progressBg:    "#0a1525",
  groupTitle:    "#e0b84d",
  sectionTitle:  "#f0ead8",
  navBorder:     "rgba(196,149,42,0.2)",
  chipBg:        "rgba(255,255,255,0.04)",
  chipBorder:    "rgba(180,160,100,0.25)",
  chipText:      "#f0ead8",
  chipSelected:  { bg:"rgba(196,149,42,0.18)", border:"#c4952a", text:"#e0b84d" },
  reviewBg:      "rgba(2,8,25,0.5)",
  reviewBorder:  "rgba(180,160,100,0.2)",
  distanceBg:    "rgba(196,149,42,0.1)",
  distanceBorder:"rgba(196,149,42,0.3)",
  parentMother:  { header:"rgba(157,23,77,0.12)", headerText:"#f9a8d4", headerBorder:"rgba(157,23,77,0.2)", badgeBg:"rgba(157,23,77,0.15)", badgeText:"#f9a8d4" },
  parentFather:  { header:"rgba(30,64,175,0.12)", headerText:"#93c5fd", headerBorder:"rgba(30,64,175,0.2)", badgeBg:"rgba(30,64,175,0.15)", badgeText:"#93c5fd" },
  btnOutlineBg:  "transparent",
  btnOutlineBorder:"rgba(255,255,255,0.2)",
  btnOutlineText:"rgba(255,255,255,0.7)",
  stepDoneBg:    "#c4952a",
  stepDoneText:  "#ffffff",
  stepActiveBg:  "#1a4fa0",
  stepActiveText:"#ffffff",
  stepDefaultBg: "rgba(255,255,255,0.1)",
  stepDefaultText:"rgba(255,255,255,0.35)",
  stepLineDone:  "#c4952a",
  stepLineDefault:"rgba(255,255,255,0.1)",
  stepLabelActive:"#c4952a",
  stepLabelDefault:"rgba(255,255,255,0.35)",
  toastSuccess:  { bg:"rgba(20,83,45,0.9)", border:"#86efac", text:"#dcfce7" },
  toastError:    { bg:"rgba(127,29,29,0.9)", border:"#fca5a5", text:"#fee2e2" },
};

// ─────────────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────────────
function Toast({ message, type, t, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 3500);
    return () => clearTimeout(id);
  }, [onClose]);
  const colors = t.toastSuccess;
  const ec = t.toastError;
  const c = type === "success" ? colors : ec;
  return (
    <div style={{
      position:"fixed", bottom:24, right:24, zIndex:9999,
      background:c.bg, border:`1px solid ${c.border}`, color:c.text,
      borderRadius:10, padding:"12px 20px", fontSize:14, fontWeight:500,
      boxShadow:"0 4px 24px rgba(0,0,0,0.18)", maxWidth:360,
      animation:"toastIn 0.3s ease",
    }}>
      {message}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  FIELD COMPONENT
// ─────────────────────────────────────────────────────────────
function Field({ label, required, hint, full, children, t }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6, gridColumn: full ? "1/-1" : undefined }}>
      <label style={{ fontSize:12, fontWeight:500, color:t.text, display:"flex", alignItems:"center", gap:4 }}>
        {label}{required && <span style={{color:"#ef4444",fontSize:13}}> *</span>}
      </label>
      {children}
      {hint && <span style={{fontSize:11,color:t.textMuted}}>{hint}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  INPUT STYLES (inline, theme-aware)
// ─────────────────────────────────────────────────────────────
function inputStyle(t, extra = {}) {
  return {
    fontFamily:"'DM Sans',sans-serif", fontSize:14, color:t.text,
    background:t.inputBg, border:`1px solid ${t.inputBorder}`,
    borderRadius:8, padding:"10px 14px", outline:"none", width:"100%",
    appearance:"none", WebkitAppearance:"none", transition:"border-color 0.2s,box-shadow 0.2s",
    ...extra,
  };
}

function InputEl({ t, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      style={{
        ...inputStyle(t),
        ...(focused ? { borderColor:t.inputFocus, boxShadow:`0 0 0 3px ${t.inputShadow}`, background: t.pageBg === "#0d1b2e" ? "rgba(255,255,255,0.08)" : "#fff" } : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

function SelectEl({ t, children, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      style={{
        ...inputStyle(t, {
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7280' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:36,
        }),
        ...(focused ? { borderColor:t.inputFocus, boxShadow:`0 0 0 3px ${t.inputShadow}` } : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {children}
    </select>
  );
}

// ─────────────────────────────────────────────────────────────
//  FIELD GROUP
// ─────────────────────────────────────────────────────────────
function FieldGroup({ title, children, t }) {
  return (
    <div style={{ background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:12, padding:"24px 28px", marginBottom:20 }}>
      {title && <div style={{ fontSize:11, fontWeight:500, textTransform:"uppercase", letterSpacing:1, color:t.groupTitle, marginBottom:18 }}>{title}</div>}
      {children}
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────
//  PARENT CARD
// ─────────────────────────────────────────────────────────────
function ParentCard({ type, fields, onChange, t }) {
  const c = type === "mother" ? t.parentMother : t.parentFather;
  const title = type === "mother" ? "Mother's Details" : "Father's Details";
  return (
    <div style={{ border:`1px solid ${t.cardBorder}`, borderRadius:12, overflow:"hidden", marginBottom:20 }}>
      <div style={{ padding:"14px 24px", fontSize:13, fontWeight:500, display:"flex", alignItems:"center", gap:10, background:c.header, color:c.headerText, borderBottom:`1px solid ${c.headerBorder}` }}>
        <span>{title}</span>
        <span style={{ fontSize:11, padding:"3px 8px", borderRadius:20, marginLeft:"auto", fontWeight:400, background:c.badgeBg, color:c.badgeText }}>Optional</span>
      </div>
      <div style={{ padding:"20px 24px", background:t.cardBg }}>
        <Grid2>
          <Field label="Full Name" t={t} full>
            <InputEl t={t} type="text" placeholder={`${type === "mother" ? "Mother" : "Father"}'s full name`} value={fields.name} onChange={e=>onChange("name",e.target.value)} />
          </Field>
          <Field label="Contact Number" t={t}><InputEl t={t} type="tel" placeholder="e.g. 0771234567" value={fields.contact} onChange={e=>onChange("contact",e.target.value)} /></Field>
          <Field label="NIC / ID Number" t={t}><InputEl t={t} type="text" placeholder="National ID number" value={fields.nic} onChange={e=>onChange("nic",e.target.value)} /></Field>
          <Field label="Occupation" t={t}><InputEl t={t} type="text" placeholder={type==="mother"?"e.g. Teacher":"e.g. Engineer"} value={fields.occupation} onChange={e=>onChange("occupation",e.target.value)} /></Field>
          <Field label="Place of Work" t={t}><InputEl t={t} type="text" placeholder="Employer / institution" value={fields.workplace} onChange={e=>onChange("workplace",e.target.value)} /></Field>
          <Field label="Email Address" t={t}><InputEl t={t} type="email" placeholder="e.g. name@email.com" value={fields.email} onChange={e=>onChange("email",e.target.value)} /></Field>
        </Grid2>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  REVIEW ROW
// ─────────────────────────────────────────────────────────────
function ReviewRow({ label, value, t }) {
  return (
    <div>
      <div style={{ fontSize:11, color:t.textMuted, marginBottom:3, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</div>
      <div style={{ fontSize:14, fontWeight:500, color: value ? t.text : t.textMuted }}>{value || "—"}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ApplicationFormPage() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);
  const t = dark ? DARK : LIGHT;

  const [current, setCurrent] = useState(0);
  const [saved, setSaved] = useState([false, false, false, false]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [distPreview, setDistPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [appNumber, setAppNumber] = useState("");

  const [child, setChild] = useState({
    nameEn:"", nameSi:"", dob:"", certNo:"", certDivision:"", certDistrict:"",
    birthPlace:"", country:"LK",
  });
  const [applicant, setApplicant] = useState({
    relationship:"", nic:"", nameEn:"", nameSi:"", contact:"", phone:"",
    addrLine1:"", addrLine2:"", addrLine3:"", street:"", town:"", district:"",
    mapsLink:"", category:"",
  });
  const [mother, setMother] = useState({ name:"", contact:"", nic:"", occupation:"", workplace:"", email:"" });
  const [father, setFather] = useState({ name:"", contact:"", nic:"", occupation:"", workplace:"", email:"" });

  // Live distance
  useEffect(() => {
    const coords = extractCoords(applicant.mapsLink);
    setDistPreview(coords ? haversine(coords.lat, coords.lon) : null);
  }, [applicant.mapsLink]);

  const showToast = useCallback((message, type = "error") => {
    setToast({ message, type });
  }, []);

  // ── Validation ──────────────────────────────────────────────
  const validate = (idx) => {
    if (idx === 0) {
      if (!applicant.nameEn.trim())       return "Enter your full name in English";
      if (!applicant.nameSi.trim())       return "Enter your full name in Sinhala";
      if (!applicant.relationship)        return "Select your relationship to the child";
      if (!applicant.nic.trim())          return "Enter NIC number";
      if (!applicant.contact.trim())      return "Enter contact number";
      if (!applicant.phone.trim())        return "Enter WhatsApp number";
      if (!applicant.addrLine1.trim())    return "Enter Address Line I";
      if (!applicant.street.trim())       return "Enter street name";
      if (!applicant.town.trim())         return "Enter town / city";
      if (!applicant.district)            return "Select district";
      if (!applicant.mapsLink.trim())     return "Paste your Google Maps location link";
      if (!applicant.category)            return "Select an application category";
    }
    if (idx === 1) {
      if (!child.nameEn.trim())       return "Enter child's full name in English";
      if (!child.nameSi.trim())       return "Enter child's full name in Sinhala";
      if (!child.dob)                 return "Enter child's date of birth";
      if (!child.certNo.trim())       return "Enter birth certificate number";
      if (!child.certDivision.trim()) return "Enter birth certificate division";
      if (!child.certDistrict)        return "Select birth certificate district";
      if (!child.birthPlace.trim())   return "Enter place of birth";
    }
    return null;
  };

  const goTo = (idx) => {
    if (idx > current) {
      const err = validate(current);
      if (err) { showToast(err); return; }
    }
    setCurrent(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = (idx) => {
    const err = validate(idx);
    if (err) { showToast(err); return; }
    const n = [...saved]; n[idx] = true; setSaved(n);
    showToast("Section saved successfully", "success");
    setTimeout(() => setSaved(s => { const x=[...s]; x[idx]=false; return x; }), 2500);
  };

  const handleSubmit = async () => {
    const e0 = validate(0);
    const e1 = validate(1);
    if (e0) { showToast(e0); return; }
    if (e1) { showToast(e1); return; }
    setLoading(true);
    try {
      const payload = buildApplicationPayload(child, applicant, mother, father);
      const { data } = await parentApi.submitApplication(payload);
      setAppNumber(data.applicationNumber || '');
      setSubmitted(true);
      toast.success(data.message || 'Application submitted successfully!');
    } catch (err) {
      showToast(err?.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepState = (i) => i === current ? "active" : i < current ? "done" : "default";

  // ── Styles ──────────────────────────────────────────────────
  const btnStyle = (variant) => {
    const base = { fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, padding:"11px 28px", borderRadius:8, border:"none", cursor:"pointer", transition:"all 0.2s", display:"inline-flex", alignItems:"center", gap:8 };
    if (variant === "outline") return { ...base, background:t.btnOutlineBg, border:`1.5px solid ${t.btnOutlineBorder}`, color:t.btnOutlineText };
    if (variant === "primary") return { ...base, background:"#1a4fa0", color:"white" };
    if (variant === "save")    return { ...base, background: saved[current] ? "#16803c" : "#c4952a", color:"white" };
    if (variant === "success") return { ...base, background:"#1a4fa0", color:"white", padding:"12px 36px", fontSize:15 };
    return base;
  };

  // ── Success Screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight:"100vh", background:t.pageBg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap'); @keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ textAlign:"center", maxWidth:460, padding:40 }}>
          <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(22,128,60,0.15)", border:"2px solid #16803c", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:32 }}>✓</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:600, color:t.text, marginBottom:12 }}>Application Submitted</h1>
          <p style={{ color:t.textMuted, fontSize:14, marginBottom:20 }}>Your application has been received successfully.</p>
          <div style={{ background:t.cardBg, border:`1px solid ${t.cardBorder}`, borderRadius:12, padding:"16px 24px", marginBottom:28 }}>
            <div style={{ fontSize:11, color:t.textMuted, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Application Number</div>
            <div style={{ fontSize:26, fontWeight:600, color:"#c4952a", letterSpacing:2 }}>{appNumber}</div>
          </div>
          <p style={{ fontSize:13, color:t.textMuted, marginBottom:20 }}>Please save this number for your records.</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              fontFamily:"'DM Sans',sans-serif", fontSize:14, fontWeight:500, padding:'12px 28px', borderRadius:8,
              border:'none', cursor:'pointer', background:'#1a4fa0', color:'white',
            }}
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:t.pageBg, fontFamily:"'DM Sans',sans-serif", color:t.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder, textarea::placeholder { color: rgba(107,114,128,0.7); }
        select option { background: ${dark ? "#0d1b2e" : "#fff"}; color: ${dark ? "#f0ead8" : "#0d2044"}; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: ${dark ? "invert(1) opacity(0.5)" : "opacity(0.5)"}; }
        button:hover { opacity: 0.88; }
      `}</style>

      {/* HEADER */}
      <div style={{ background:t.headerBg, color:"white", padding:"28px 48px 22px", position:"relative", overflow:"hidden" }}>
        <div style={{ content:"", position:"absolute", top:-60, right:-60, width:220, height:220, borderRadius:"50%", background:"rgba(196,149,42,0.2)", pointerEvents:"none" }} />
        <div style={{ content:"", position:"absolute", bottom:-40, left:"30%", width:140, height:140, borderRadius:"50%", background:"rgba(91,141,224,0.15)", pointerEvents:"none" }} />
        <div style={{ position:"relative", zIndex:1, maxWidth:900, margin:"0 auto", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontWeight:600, letterSpacing:"-0.5px", marginBottom:5 }}>Application Data Sheet</h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.55)", fontWeight:300 }}>Complete all required fields marked with an asterisk (*)</p>
          </div>
          {/* Dark/Light toggle */}
          <button
            onClick={() => setDark(!dark)}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"50%", width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:18, flexShrink:0, marginTop:4, transition:"background 0.2s" }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{ background:t.progressBg, borderBottom:`1px solid ${t.cardBorder}`, padding:"0 48px", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center", height:56 }}>
          {SECTION_LABELS.map((label, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", flex: i < SECTION_LABELS.length - 1 ? 1 : undefined }}>
              <button onClick={() => { if (i <= current) goTo(i); }} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor: i <= current ? "pointer" : "default", padding:0, opacity: i > current + 1 ? 0.5 : 1 }}>
                <div style={{
                  width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:500, flexShrink:0, transition:"all 0.3s",
                  background: stepState(i) === "active" ? t.stepActiveBg : stepState(i) === "done" ? t.stepDoneBg : t.stepDefaultBg,
                  color: stepState(i) === "active" ? t.stepActiveText : stepState(i) === "done" ? t.stepDoneText : t.stepDefaultText,
                }}>
                  {stepState(i) === "done" ? "✓" : i + 1}
                </div>
                <span style={{ fontSize:12, fontWeight: stepState(i) === "active" ? 500 : 400, color: stepState(i) === "active" ? t.stepLabelActive : t.stepLabelDefault, whiteSpace:"nowrap" }}>{label}</span>
              </button>
              {i < SECTION_LABELS.length - 1 && (
                <div style={{ flex:1, height:1, background: i < current ? t.stepLineDone : t.stepLineDefault, margin:"0 10px", maxWidth:50 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"36px 48px 80px" }}>
        <p style={{ fontSize:12, color:t.textMuted, marginBottom:24 }}><span style={{color:"#ef4444",fontSize:14}}>*</span> Required fields</p>

        {/* ── SECTION 0: APPLICANT ── */}
        {current === 0 && (
          <div style={{ animation:"fadeUp 0.35s ease" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:28, paddingBottom:20, borderBottom:`1px solid ${t.cardBorder}` }}>
              <div style={{ width:48, height:48, borderRadius:12, background: dark ? "rgba(196,149,42,0.15)" : "#fdf3dc", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:"#c4952a" }}>A</span>
              </div>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:600, color:t.sectionTitle }}>Applicant Information</div>
                <div style={{ fontSize:13, color:t.textMuted, marginTop:4 }}>Details of the parent or guardian completing this form</div>
              </div>
            </div>

            <FieldGroup title="Identity" t={t}>
              <Grid2>
                <Field label="Full Name (English)" required t={t} full><InputEl t={t} type="text" placeholder="As per NIC" value={applicant.nameEn} onChange={e=>setApplicant({...applicant,nameEn:e.target.value})} /></Field>
                <Field label="Full Name (Sinhala)" required t={t} full><InputEl t={t} type="text" placeholder="ජාතික හැඳුනුම්පතට අනුව" value={applicant.nameSi} onChange={e=>setApplicant({...applicant,nameSi:e.target.value})} /></Field>
                <Field label="Relationship to Child" required t={t}>
                  <SelectEl t={t} value={applicant.relationship} onChange={e=>setApplicant({...applicant,relationship:e.target.value})}>
                    <option value="" disabled>Select relationship</option>
                    <option>Mother</option><option>Father</option><option>Guardian</option>
                  </SelectEl>
                </Field>
                <Field label="NIC Number" required t={t}><InputEl t={t} type="text" placeholder="199XXXXXXXXXV or 20XXXXXXXXXX" value={applicant.nic} onChange={e=>setApplicant({...applicant,nic:e.target.value})} /></Field>
              </Grid2>
            </FieldGroup>

            <FieldGroup title="Contact Details" t={t}>
              <Grid2>
                <Field label="Contact Number" required t={t}><InputEl t={t} type="tel" placeholder="07X XXXXXXX" value={applicant.contact} onChange={e=>setApplicant({...applicant,contact:e.target.value})} /></Field>
                <Field label="WhatsApp Number" required t={t}><InputEl t={t} type="tel" placeholder="07X XXXXXXX" value={applicant.phone} onChange={e=>setApplicant({...applicant,phone:e.target.value})} /></Field>
              </Grid2>
            </FieldGroup>

            <FieldGroup title="Address" t={t}>
              <Grid2>
                <Field label="Address Line I" required t={t} full><InputEl t={t} type="text" placeholder="House number, building name" value={applicant.addrLine1} onChange={e=>setApplicant({...applicant,addrLine1:e.target.value})} /></Field>
                <Field label="Address Line II" t={t} full><InputEl t={t} type="text" placeholder="Apartment, unit (optional)" value={applicant.addrLine2} onChange={e=>setApplicant({...applicant,addrLine2:e.target.value})} /></Field>
                <Field label="Address Line III" t={t} full><InputEl t={t} type="text" placeholder="Additional info (optional)" value={applicant.addrLine3} onChange={e=>setApplicant({...applicant,addrLine3:e.target.value})} /></Field>
                <Field label="Street" required t={t}><InputEl t={t} type="text" placeholder="e.g. Havelock Road" value={applicant.street} onChange={e=>setApplicant({...applicant,street:e.target.value})} /></Field>
                <Field label="Town / City" required t={t}><InputEl t={t} type="text" placeholder="e.g. Thimbirigasyaya" value={applicant.town} onChange={e=>setApplicant({...applicant,town:e.target.value})} /></Field>
                <Field label="District" required t={t} full>
                  <SelectEl t={t} value={applicant.district} onChange={e=>setApplicant({...applicant,district:e.target.value})}>
                    <option value="">Select district</option>
                    {SRI_LANKA_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </SelectEl>
                </Field>
              </Grid2>
            </FieldGroup>

            <FieldGroup title="Home Location" t={t}>
              <Grid2>
                <Field label="Google Maps Link" required t={t} full hint="Open Google Maps → find your home → Share → Copy Link → paste here">
                  <InputEl t={t} type="url" placeholder="https://maps.app.goo.gl/..." value={applicant.mapsLink} onChange={e=>setApplicant({...applicant,mapsLink:e.target.value})} />
                </Field>
              </Grid2>
            </FieldGroup>

            <FieldGroup title={<>Application Category <span style={{color:"#ef4444",fontSize:13}}>*</span></>} t={t}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:4 }}>
                {CATEGORIES.map(cat => {
                  const sel = applicant.category === cat.code;
                  const cs = t.chipSelected;
                  return (
                    <button key={cat.code}
                      onClick={() => setApplicant({...applicant, category: sel ? "" : cat.code})}
                      style={{ padding:"8px 16px", border:`1.5px solid ${sel ? cs.border : t.chipBorder}`, borderRadius:20, cursor:"pointer", fontSize:13, fontFamily:"'DM Sans',sans-serif", fontWeight: sel ? 500 : 400, color: sel ? cs.text : t.chipText, background: sel ? cs.bg : t.chipBg, transition:"all 0.2s" }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </FieldGroup>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:32, paddingTop:24, borderTop:`1px solid ${t.navBorder}` }}>
              <div />
              <div style={{ display:"flex", gap:10 }}>
                <button style={btnStyle("save")} onClick={()=>handleSave(0)}>{saved[0] ? "Saved ✓" : "Save"}</button>
                <button style={btnStyle("primary")} onClick={()=>goTo(1)}>Continue →</button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 1: CHILD ── */}
        {current === 1 && (
          <div style={{ animation:"fadeUp 0.35s ease" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:28, paddingBottom:20, borderBottom:`1px solid ${t.cardBorder}` }}>
              <div style={{ width:48, height:48, borderRadius:12, background: dark ? "rgba(91,141,224,0.15)" : "#dce8fb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:"#1a4fa0" }}>C</span>
              </div>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:600, color:t.sectionTitle }}>Child Information</div>
                <div style={{ fontSize:13, color:t.textMuted, marginTop:4 }}>Details about the child being enrolled</div>
              </div>
            </div>

            <FieldGroup title="Name Details" t={t}>
              <Grid2>
                <Field label="Full Name (English)" required t={t}><InputEl t={t} type="text" placeholder="e.g. Saman Perera" value={child.nameEn} onChange={e=>setChild({...child,nameEn:e.target.value})} /></Field>
                <Field label="Full Name (Sinhala)" required t={t}><InputEl t={t} type="text" placeholder="සිංහලෙන් ලියන්න" value={child.nameSi} onChange={e=>setChild({...child,nameSi:e.target.value})} /></Field>
              </Grid2>
            </FieldGroup>

            <FieldGroup title="Birth Certificate Details" t={t}>
              <Grid2>
                <Field label="Date of Birth" required t={t}><InputEl t={t} type="date" value={child.dob} onChange={e=>setChild({...child,dob:e.target.value})} /></Field>
                <Field label="Birth Certificate Number" required t={t}><InputEl t={t} type="text" placeholder="e.g. BC/123456" value={child.certNo} onChange={e=>setChild({...child,certNo:e.target.value})} /></Field>
                <Field label="Division" required t={t}><InputEl t={t} type="text" placeholder="e.g. Colombo" value={child.certDivision} onChange={e=>setChild({...child,certDivision:e.target.value})} /></Field>
                <Field label="District" required t={t}>
                  <SelectEl t={t} value={child.certDistrict} onChange={e=>setChild({...child,certDistrict:e.target.value})}>
                    <option value="">Select district</option>
                    {SRI_LANKA_DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}
                  </SelectEl>
                </Field>
                <Field label="Place of Birth" required t={t} full hint="Hospital, clinic, or location name">
                  <InputEl t={t} type="text" placeholder="e.g. De Soysa Maternity Hospital" value={child.birthPlace} onChange={e=>setChild({...child,birthPlace:e.target.value})} />
                </Field>
                <Field label="Country" required t={t}>
                  <SelectEl t={t} value={child.country} onChange={e=>setChild({...child,country:e.target.value})}>
                    <option value="LK">Sri Lanka</option>
                    <option value="AU">Australia</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="other">Other</option>
                  </SelectEl>
                </Field>
              </Grid2>
            </FieldGroup>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:32, paddingTop:24, borderTop:`1px solid ${t.navBorder}` }}>
              <button style={btnStyle("outline")} onClick={()=>goTo(0)}>← Back</button>
              <div style={{ display:"flex", gap:10 }}>
                <button style={btnStyle("save")} onClick={()=>handleSave(1)}>{saved[1] ? "Saved ✓" : "Save"}</button>
                <button style={btnStyle("primary")} onClick={()=>goTo(2)}>Continue →</button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 2: PARENTS ── */}
        {current === 2 && (
          <div style={{ animation:"fadeUp 0.35s ease" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:28, paddingBottom:20, borderBottom:`1px solid ${t.cardBorder}` }}>
              <div style={{ width:48, height:48, borderRadius:12, background: dark ? "rgba(91,141,224,0.12)" : "#dce8fb", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:"#1a4fa0" }}>P</span>
              </div>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:600, color:t.sectionTitle }}>Parent Information</div>
                <div style={{ fontSize:13, color:t.textMuted, marginTop:4 }}>Both sections are optional — fill in what applies</div>
              </div>
            </div>

            <ParentCard type="mother" fields={mother} onChange={(k,v)=>setMother({...mother,[k]:v})} t={t} />
            <ParentCard type="father" fields={father} onChange={(k,v)=>setFather({...father,[k]:v})} t={t} />

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:32, paddingTop:24, borderTop:`1px solid ${t.navBorder}` }}>
              <button style={btnStyle("outline")} onClick={()=>goTo(1)}>← Back</button>
              <div style={{ display:"flex", gap:10 }}>
                <button style={btnStyle("save")} onClick={()=>handleSave(2)}>{saved[2] ? "Saved ✓" : "Save"}</button>
                <button style={btnStyle("primary")} onClick={()=>goTo(3)}>Continue →</button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 3: REVIEW & SUBMIT ── */}
        {current === 3 && (
          <div style={{ animation:"fadeUp 0.35s ease" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:28, paddingBottom:20, borderBottom:`1px solid ${t.cardBorder}` }}>
              <div style={{ width:48, height:48, borderRadius:12, background: dark ? "rgba(196,149,42,0.15)" : "#fdf3dc", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:600, color:"#c4952a" }}>R</span>
              </div>
              <div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:600, color:t.sectionTitle }}>Review & Submit</div>
                <div style={{ fontSize:13, color:t.textMuted, marginTop:4 }}>Please review all details carefully before submitting</div>
              </div>
            </div>

            {/* Child review */}
            <FieldGroup title="Child Details" t={t}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, background:t.reviewBg, border:`1px solid ${t.reviewBorder}`, borderRadius:10, padding:20 }}>
                <ReviewRow label="Name (English)" value={child.nameEn} t={t} />
                <ReviewRow label="Name (Sinhala)" value={child.nameSi} t={t} />
                <ReviewRow label="Date of Birth" value={child.dob} t={t} />
                <ReviewRow label="Birth Cert. No." value={child.certNo} t={t} />
                <ReviewRow label="Division" value={child.certDivision} t={t} />
                <ReviewRow label="District" value={child.certDistrict} t={t} />
                <ReviewRow label="Place of Birth" value={child.birthPlace} t={t} />
                <ReviewRow label="Country" value={child.country} t={t} />
              </div>
            </FieldGroup>

            {/* Applicant review */}
            <FieldGroup title="Applicant Details" t={t}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, background:t.reviewBg, border:`1px solid ${t.reviewBorder}`, borderRadius:10, padding:20 }}>
                <ReviewRow label="Name (English)" value={applicant.nameEn} t={t} />
                <ReviewRow label="Name (Sinhala)" value={applicant.nameSi} t={t} />
                <ReviewRow label="Relationship" value={applicant.relationship} t={t} />
                <ReviewRow label="NIC" value={applicant.nic} t={t} />
                <ReviewRow label="Contact" value={applicant.contact} t={t} />
                <ReviewRow label="WhatsApp" value={applicant.phone} t={t} />
                <ReviewRow label="Address" value={[applicant.addrLine1, applicant.street, applicant.town, applicant.district].filter(Boolean).join(", ")} t={t} />
                <ReviewRow label="Distance to School" value={distPreview ? `${distPreview} km` : "—"} t={t} />
                <ReviewRow label="Category" value={CATEGORIES.find(c=>c.code===applicant.category)?.label || applicant.category} t={t} />
              </div>
            </FieldGroup>

            {/* Parents review (only if filled) */}
            {(mother.name || father.name) && (
              <FieldGroup title="Parent Details" t={t}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, background:t.reviewBg, border:`1px solid ${t.reviewBorder}`, borderRadius:10, padding:20 }}>
                  {mother.name && <><ReviewRow label="Mother's Name" value={mother.name} t={t} /><ReviewRow label="Mother's Contact" value={mother.contact} t={t} /></>}
                  {father.name && <><ReviewRow label="Father's Name" value={father.name} t={t} /><ReviewRow label="Father's Contact" value={father.contact} t={t} /></>}
                </div>
              </FieldGroup>
            )}

            <p style={{ fontSize:13, color:t.textMuted, marginBottom:24 }}>
              Once submitted, you cannot edit this application. Please ensure all details are correct.
            </p>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8, paddingTop:24, borderTop:`1px solid ${t.navBorder}` }}>
              <button style={btnStyle("outline")} onClick={()=>goTo(2)}>← Back</button>
              <button style={{ ...btnStyle("success"), opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting…" : "Submit Application ✓"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && <Toast message={toast.message} type={toast.type} t={t} onClose={() => setToast(null)} />}
    </div>
  );
}