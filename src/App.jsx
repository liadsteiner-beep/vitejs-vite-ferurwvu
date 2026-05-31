import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// ─── FIREBASE ─────────────────────────────────────────────────────────────────
const firebaseApp = initializeApp({
  apiKey: "AIzaSyB2w6kVjNJ5nMHNMvd0gOxvEBu5Vp6y4KI",
  authDomain: "harish-pharmacy.firebaseapp.com",
  projectId: "harish-pharmacy",
  storageBucket: "harish-pharmacy.firebasestorage.app",
  messagingSenderId: "362049883380",
  appId: "1:362049883380:web:5d61d2e41f6d08e99a22a1",
});
const db = getFirestore(firebaseApp);

async function fbSave(data) {
  try {
    if (typeof window !== "undefined" && window._setSaveTime) window._setSaveTime();
    await setDoc(doc(db, "pharmacy", "schedule"), data);
  } catch(e) { console.error("Firebase save error:", e); }
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const APP_NAME = "סידור עבודה בית מרקחת חריש";

const ROLES = ["רוקח", "פרח"];
const ROLE_COLORS = {
  "רוקח": { bg: "#0ea5e9", light: "#e0f2fe", dark: "#0369a1" },
  "פרח":  { bg: "#a855f7", light: "#f3e8ff", dark: "#7e22ce" },
};

// Budget — encoded to avoid casual reading (not shown to employees)
const _B = atob("W3sibjoiXHU1ZTMwXHU1ZTFhIiwibWluIjo0LCJtYXgiOjV9LHsibjoiXHU1ZTIwXHU1ZGUwXHU1ZTA0IiwibWluIjo0LCJtYXgiOjR9LHsibjoiXHU1ZTI5XHU1ZTBhIiwibWluIjoyLCJtYXgiOjJ9LHsibjoiXHU1ZTViXHU1ZTFhXHU1ZGYyIiwibWluIjozLCJtYXgiOjR9LHsibjoiXHU1ZTI5XHU1ZGU3IiwibWluIjowLCJtYXgiOjB9LHsibm8iOiJcdTA1E1x1MDVENU5cdTA1NzQiLCJtaW4iOjAsIm1heCI6OTl9LHsibm8iOiJcdTA1NTRcdTA1RTFcdTA1RDkiLCJtaW4iOjAsIm1heCI6OTl9XQ==");
const BUDGET = (() => {
  try {
    return JSON.parse(_B).map(b => ({ name: b.n || b.no, role: "רוקח", min: b.min, max: b.max }));
  } catch {
    return [
      { name: "סמר",  role: "רוקח", min: 4, max: 5 },
      { name: "סלאם", role: "רוקח", min: 4, max: 4 },
      { name: "שפא",  role: "רוקח", min: 2, max: 2 },
      { name: "ליאן", role: "רוקח", min: 3, max: 4 },
      { name: "עדי",  role: "רוקח", min: 0, max: 0 },
      { name: "סג׳א", role: "רוקח", min: 0, max: 99 },
      { name: "ליעד", role: "רוקח", min: 0, max: 99 },
    ];
  }
})();

const INITIAL_EMPLOYEES = [
  { id: 1,  name: "סמר",  role: "רוקח", phone: "" },
  { id: 2,  name: "סלאם", role: "רוקח", phone: "" },
  { id: 3,  name: "שפא",  role: "רוקח", phone: "" },
  { id: 4,  name: "ליאן", role: "רוקח", phone: "" },
  { id: 5,  name: "עדי",  role: "רוקח", phone: "" },
  { id: 6,  name: "סג׳א", role: "רוקח", phone: "" },
  { id: 7,  name: "ליעד", role: "רוקח", phone: "" },
  { id: 8,  name: "סונדוס", role: "פרח", phone: "" },
  { id: 9,  name: "יאנה",   role: "פרח", phone: "" },
  { id: 10, name: "מוהנא",  role: "פרח", phone: "" },
  { id: 11, name: "אמיליה", role: "פרח", phone: "" },
  { id: 12, name: "לורין",  role: "פרח", phone: "" },
];

// Day shift templates: dayOfWeek (0=Sun) -> shifts
const DAY_SHIFTS = {
  0: [ { id:"morning", label:"בוקר", time:"08:00-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"evening", label:"ערב", time:"14:00-22:00", slots:{"רוקח":1,"פרח":1} } ],
  1: [ { id:"morning", label:"בוקר", time:"08:00-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"evening", label:"ערב", time:"14:00-22:00", slots:{"רוקח":1,"פרח":1} } ],
  2: [ { id:"morning", label:"בוקר", time:"08:00-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"evening", label:"ערב", time:"14:00-22:00", slots:{"רוקח":1,"פרח":1} } ],
  3: [ { id:"morning", label:"בוקר", time:"08:00-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"evening", label:"ערב", time:"14:00-22:00", slots:{"רוקח":1,"פרח":1} } ],
  4: [ { id:"morning", label:"בוקר", time:"08:00-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"evening", label:"ערב", time:"14:00-22:00", slots:{"רוקח":1,"פרח":1} } ],
  5: [ { id:"open",    label:"פתיחה", time:"08:00-14:00", slots:{"רוקח":1,"פרח":1} }, { id:"close", label:"סגירה", time:"14:00-20:00", slots:{"רוקח":1,"פרח":0} } ],
  6: [ { id:"morning", label:"בוקר שבת", time:"09:00-15:00", slots:{"רוקח":1,"פרח":0} }, { id:"evening", label:"ערב שבת", time:"15:00-21:00", slots:{"רוקח":1,"פרח":1} } ],
};
const STORAGE_KEY = "pharmacy_harishv1";
const MANAGER_PASSWORD_DEFAULT = "liad2903";

function loadLocalData() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function saveData(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {}
  fbSave(d);
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
// Returns the start of the scheduling week:
// - Before publish: next week (Sun after this week)
// - After publish: week after next
// - Thu/Fri/Sat: always one week further
function getSchedulingWeekStart(offsetWeeks = 0, isPublished = false) {
  const today = new Date();
  const day = today.getDay(); // 0=Sun ... 6=Sat
  // Base: if Thu(4)/Fri(5)/Sat(6) add extra week
  const baseExtra = day >= 4 ? 1 : 0;
  // If published, show the week after the current scheduling week
  const publishedExtra = isPublished ? 1 : 0;
  const sunday = new Date(today);
  // Next Sunday
  sunday.setDate(today.getDate() + (7 - day));
  // Add extras
  sunday.setDate(sunday.getDate() + (baseExtra + publishedExtra + offsetWeeks) * 7);
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

function getWeekDates(offsetWeeks = 0, isPublished = false) {
  const sunday = getSchedulingWeekStart(offsetWeeks, isPublished);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function formatDate(d) { return d.toLocaleDateString("he-IL", { weekday:"long", day:"numeric", month:"numeric" }); }
function formatDateShort(d) { return d.toLocaleDateString("he-IL", { day:"numeric", month:"numeric" }); }
function dateKey(d) { return d.toISOString().split("T")[0]; }
function isFirstOfMonth(d) { return d.getDate() === 1; }

// Deadline: next Tuesday 12:00 of the scheduling week
function getDeadline(offsetWeeks = 0) {
  // Deadline = Tuesday 12:00 of the week BEFORE the scheduling week
  const dates = getWeekDates(offsetWeeks);
  const tuesday = new Date(dates[2]); // Tuesday of the scheduling week
  tuesday.setHours(12, 0, 0, 0);
  tuesday.setDate(tuesday.getDate() - 7); // Tuesday of the PREVIOUS week
  return tuesday;
}

function isPastDeadline(offsetWeeks = 0) { return new Date() > getDeadline(offsetWeeks); }

const WEEK_DATES = getWeekDates(0); // default for auto-assign algorithm

// ─── AUTO-ASSIGN ALGORITHM ───────────────────────────────────────────────────
function autoAssign(employees, availability, fridayRota, assigned) {
  const newAssigned = { ...assigned };

  // Helper: get assigned for a slot
  const getA = (date, shiftId, role) => newAssigned[`${dateKey(date)}_${shiftId}_${role}`] || [];
  const setA = (date, shiftId, role, ids) => { newAssigned[`${dateKey(date)}_${shiftId}_${role}`] = ids; };
  const isAv = (empId, date, shiftId) => !!availability[`${empId}_${dateKey(date)}_${shiftId}`];

  // Count assigned shifts per employee
  const countShifts = (empId) => {
    let total = 0, morning = 0, evening = 0;
    weekDates.forEach(date => {
      const dayShifts = DAY_SHIFTS[date.getDay()] || [];
      dayShifts.forEach(sh => {
        ROLES.forEach(role => {
          if (getA(date, sh.id, role).includes(empId)) {
            total++;
            if (sh.id === "morning" || sh.id === "open") morning++;
            else evening++;
          }
        });
      });
    });
    return { total, morning, evening };
  };

  // Check if employee already works that day
  const worksToday = (empId, date) => {
    const dayShifts = DAY_SHIFTS[date.getDay()] || [];
    return dayShifts.some(sh => ROLES.some(role => getA(date, sh.id, role).includes(empId)));
  };

  // Check morning-after-evening constraint
  const hadEveningYesterday = (empId, date) => {
    const prev = new Date(date); prev.setDate(prev.getDate() - 1);
    const prevShifts = DAY_SHIFTS[prev.getDay()] || [];
    return prevShifts.some(sh => (sh.id === "evening" || sh.id === "close") && ROLES.some(role => getA(prev, sh.id, role).includes(empId)));
  };

  // 1. Apply Friday rota for pharmacists
  const friday = weekDates[5];
  const fridayDateLabel = friday.toLocaleDateString("he-IL",{day:"numeric",month:"numeric",year:"numeric"});
  const fridayEntry = fridayRota.find(r => r.date === fridayDateLabel);
  if (fridayEntry) {
    if (fridayEntry.open) {
      const emp = employees.find(e => e.name === fridayEntry.open && e.role === "רוקח");
      if (emp) { const cur = getA(friday,"open","רוקח"); if(!cur.includes(emp.id)) setA(friday,"open","רוקח",[...cur,emp.id]); }
    }
    if (fridayEntry.close) {
      const emp = employees.find(e => e.name === fridayEntry.close && e.role === "רוקח");
      if (emp) { const cur = getA(friday,"close","רוקח"); if(!cur.includes(emp.id)) setA(friday,"close","רוקח",[...cur,emp.id]); }
    }
  }

  // 2. Drug closing on 1st of month: add ליעד to morning with note
  weekDates.forEach(date => {
    if (isFirstOfMonth(date)) {
      const lieadEmp = employees.find(e => e.name === "ליעד" && e.role === "רוקח");
      const dayShifts = DAY_SHIFTS[date.getDay()] || [];
      const morningShift = dayShifts.find(sh => sh.id === "morning" || sh.id === "open");
      if (lieadEmp && morningShift) {
        const current = getA(date, morningShift.id, "רוקח");
        if (!current.includes(lieadEmp.id)) setA(date, morningShift.id, "רוקח", [...current, lieadEmp.id]);
      }
    }
  });

  // 3. Auto-assign pharmacists (skip Friday open/close which is done by rota)
  const pharmacists = employees.filter(e => e.role === "רוקח" && e.name !== "עדי");

  weekDates.forEach(date => {
    const dow = date.getDay();
    const dayShifts = DAY_SHIFTS[dow] || [];
    dayShifts.forEach(shift => {
      if (dow === 5) return; // Friday handled by rota
      const needed = shift.slots["רוקח"] || 0;
      if (!needed) return;
      const current = getA(date, shift.id, "רוקח");
      if (current.length >= needed) return;

      // Score candidates
      const isMorning = shift.id === "morning" || shift.id === "open";
      const candidates = pharmacists
        .filter(emp => {
          if (current.includes(emp.id)) return false;
          if (!isAv(emp.id, date, shift.id)) return false;
          if (worksToday(emp.id, date)) return false;
          if (isMorning && hadEveningYesterday(emp.id, date)) return false; // rule 4
          const budget = BUDGET.find(b => b.name === emp.name);
          if (budget && budget.max === 0) return false;
          const { total } = countShifts(emp.id);
          if (budget && total >= budget.max) return false;
          return true;
        })
        .sort((a, b) => {
          const bA = BUDGET.find(x => x.name === a.name) || { min:0, max:99 };
          const bB = BUDGET.find(x => x.name === b.name) || { min:0, max:99 };
          const cA = countShifts(a.id);
          const cB = countShifts(b.id);
          // Prioritize those who need more shifts
          const needA = bA.min - cA.total;
          const needB = bB.min - cB.total;
          if (needB !== needA) return needB - needA;
          // Balance morning/evening: rule 5
          const ratioA = isMorning ? cA.morning - cA.evening : cA.evening - cA.morning;
          const ratioB = isMorning ? cB.morning - cB.evening : cB.evening - cB.morning;
          return ratioA - ratioB;
        });

      if (candidates.length > 0) {
        setA(date, shift.id, "רוקח", [...current, candidates[0].id]);
      }
    });
  });

  // 4. Auto-assign פרח
  const parchs = employees.filter(e => e.role === "פרח");
  weekDates.forEach(date => {
    const dow = date.getDay();
    const dayShifts = DAY_SHIFTS[dow] || [];
    dayShifts.forEach(shift => {
      const needed = shift.slots["פרח"] || 0;
      if (!needed) return;
      const current = getA(date, shift.id, "פרח");
      if (current.length >= needed) return;
      const isMorning = shift.id === "morning" || shift.id === "open";
      const candidates = parchs
        .filter(emp => {
          if (current.includes(emp.id)) return false;
          if (!isAv(emp.id, date, shift.id)) return false;
          if (worksToday(emp.id, date)) return false;
          return true;
        })
        .sort((a, b) => {
          const cA = countShifts(a.id);
          const cB = countShifts(b.id);
          const ratioA = isMorning ? cA.morning - cA.evening : cA.evening - cA.morning;
          const ratioB = isMorning ? cB.morning - cB.evening : cB.evening - cB.morning;
          return ratioA - ratioB;
        });
      if (candidates.length > 0) {
        setA(date, shift.id, "פרח", [...current, candidates[0].id]);
      }
    });
  });

  return newAssigned;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]               = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [pwInput, setPwInput]         = useState("");
  const [pwError, setPwError]         = useState(false);
  const [showManagerLogin, setShowManagerLogin] = useState(false);
  const [employees, setEmployees]     = useState(INITIAL_EMPLOYEES);
  const [availability, setAvailability] = useState({});
  const [assigned, setAssigned]       = useState({});
  const [notes, setNotes]             = useState({}); // empId_dateKey_shiftId -> note
  const [empNotes, setEmpNotes]       = useState({}); // empId -> note to manager
  const [empPasswords, setEmpPasswords] = useState({}); // empId -> password
  const [managerPassword, setManagerPassword] = useState(MANAGER_PASSWORD_DEFAULT);
  const [empPwInput, setEmpPwInput]   = useState("");
  const [empPwConfirm, setEmpPwConfirm] = useState("");
  const [empPwError, setEmpPwError]   = useState("");
  const [selectedEmp, setSelectedEmp] = useState(null); // emp clicked on login screen
  const [fridayRota, setFridayRota]   = useState([]); // [{name, shift, date}]
  const [published, setPublished]     = useState(false);
  const [toast, setToast]             = useState(null);
  const [managerTab, setManagerTab]   = useState("simulation");
  const [newEmpName, setNewEmpName]   = useState("");
  const [newEmpRole, setNewEmpRole]   = useState("רוקח");
  const [newEmpPhone, setNewEmpPhone] = useState("");
  const [empNoteInput, setEmpNoteInput] = useState("");
  const [fbLoaded, setFbLoaded] = useState(false);
  const [showAutoConfirm, setShowAutoConfirm] = useState(false);
  const [sendMode, setSendMode] = useState("personal");
  const [weekOffset, setWeekOffset] = useState(0);
  const [vacations, setVacations] = useState({});
  // Friday rota form state
  const [newRotaDate, setNewRotaDate] = useState("");
  const [newRotaOpen, setNewRotaOpen] = useState("");
  const [newRotaClose, setNewRotaClose] = useState("");
  // Vacation request form state (employee)
  const [vacType, setVacType] = useState("יום בודד");
  const [vacStart, setVacStart] = useState("");
  const [vacEnd, setVacEnd] = useState("");
  const [vacNote, setVacNote] = useState("");
  const weekDates = getWeekDates(weekOffset, published); // empId -> [{start, end, type, status, note}]
  const [dayRemarks, setDayRemarks] = useState({}); // dateKey -> ["הורדת מבצע", ...]
  const [shiftNotes, setShiftNotes] = useState({}); // dateKey_shiftId -> string
  const [changePwModal, setChangePwModal] = useState(null); // null | "manager" | empId
  const [changePwOld, setChangePwOld]     = useState("");
  const [changePwNew, setChangePwNew]     = useState("");
  const [changePwNew2, setChangePwNew2]   = useState("");
  const [changePwErr, setChangePwErr]     = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    // First load from localStorage as fast fallback
    const local = loadLocalData();
    if (local) {
      if (local.employees) {
        const hasOldNames = local.employees.some(e => ["פרח 1","פרח 2","פרח 3"].includes(e.name));
        if (!hasOldNames) setEmployees(local.employees);
      }
      if (local.availability) setAvailability(local.availability);
      if (local.assigned)     setAssigned(local.assigned);
      if (local.notes)        setNotes(local.notes);
      if (local.empNotes)     setEmpNotes(local.empNotes);
      if (local.empPasswords) setEmpPasswords(local.empPasswords);
      if (local.managerPassword && local.managerPassword !== "harishpharm2025") setManagerPassword(local.managerPassword);
      if (local.fridayRota)   setFridayRota(local.fridayRota);
      if (local.published)    setPublished(local.published);
      if (local.dayRemarks)   setDayRemarks(local.dayRemarks);
      if (local.shiftNotes)   setShiftNotes(local.shiftNotes);
    }
    // Load once from Firebase (saves quota vs onSnapshot)
    getDoc(doc(db, "pharmacy", "schedule")).then((snap) => {
      if (!snap.exists()) { setFbLoaded(true); return; }
      const d = snap.data();
      if (d.employees) {
        const hasOldNames = d.employees.some(e => ["פרח 1","פרח 2","פרח 3"].includes(e.name));
        if (!hasOldNames) setEmployees(d.employees);
      }
      if (d.availability) setAvailability(d.availability);
      if (d.assigned)     setAssigned(d.assigned);
      if (d.notes)        setNotes(d.notes);
      if (d.empNotes)     setEmpNotes(d.empNotes);
      if (d.empPasswords) setEmpPasswords(d.empPasswords);
      if (d.managerPassword && d.managerPassword !== "harishpharm2025") setManagerPassword(d.managerPassword);
      if (d.fridayRota)   setFridayRota(d.fridayRota);
      if (d.published)    setPublished(d.published);
      if (d.dayRemarks)   setDayRemarks(d.dayRemarks);
      if (d.shiftNotes)   setShiftNotes(d.shiftNotes);
      if (d.vacations)    setVacations(d.vacations);
      setFbLoaded(true);
    }).catch(() => setFbLoaded(true));
  }, []);

  useEffect(() => {
    saveData({ employees, availability, assigned, notes, empNotes, empPasswords, managerPassword, fridayRota, published, dayRemarks, shiftNotes, vacations });
  }, [employees, availability, assigned, notes, empNotes, empPasswords, managerPassword, fridayRota, published, dayRemarks, shiftNotes, vacations]);

  function showToast(msg, type="ok") { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  // ── AUTH ──
  function loginManager() {
    if (pwInput === managerPassword) {
      setCurrentUser({isManager:true});
      setView("manager");
      setPwInput("");
      setPwError(false);
      setShowManagerLogin(false);
    } else {
      setPwError(true);
    }
  }
  function selectEmp(emp) {
    setSelectedEmp(emp);
    setEmpPwInput("");
    setEmpPwConfirm("");
    setEmpPwError("");
  }

  function submitEmpLogin() {
    const isNew = !empPasswords[selectedEmp.id];
    if (isNew) {
      if (empPwInput.length < 4) { setEmpPwError("סיסמה חייבת להיות לפחות 4 תווים"); return; }
      if (empPwInput !== empPwConfirm) { setEmpPwError("הסיסמאות אינן תואמות"); return; }
      setEmpPasswords(prev => ({ ...prev, [selectedEmp.id]: empPwInput }));
      setCurrentUser(selectedEmp);
      setEmpNoteInput(empNotes[selectedEmp.id] || "");
      setView("employee");
      setSelectedEmp(null);
    } else {
      if (empPwInput !== empPasswords[selectedEmp.id]) { setEmpPwError("סיסמה שגויה"); return; }
      setCurrentUser(selectedEmp);
      setEmpNoteInput(empNotes[selectedEmp.id] || "");
      setView("employee");
      setSelectedEmp(null);
    }
  }

  function loginEmp(emp)  { setCurrentUser(emp); setEmpNoteInput(empNotes[emp.id]||""); setView("employee"); }
  function logout()       { setCurrentUser(null); setView("login"); }

  const REMARK_OPTIONS = ["הורדת מבצע","העלאת מבצע","הזמנת כללית","אספקת כללית"];

  function toggleRemark(date, remark) {
    const k = dateKey(date);
    const cur = dayRemarks[k] || [];
    const next = cur.includes(remark) ? cur.filter(r=>r!==remark) : [...cur, remark];
    setDayRemarks(prev => ({ ...prev, [k]: next }));
  }
  function getRemarks(date) { return dayRemarks[dateKey(date)] || []; }

  // ── VACATION HELPERS ──
  function addVacationRequest(empId, startDate, endDate, type, note) {
    const req = { id: Date.now(), start: startDate, end: endDate, type, note, status: "pending" };
    const updated = { ...vacations, [empId]: [...(vacations[empId]||[]), req] };
    setVacations(updated);
    fbSave({ employees, availability, assigned, notes, empNotes, empPasswords, managerPassword, fridayRota, published, dayRemarks, shiftNotes, vacations: updated });
    showToast("בקשת חופשה נשלחה ✓");
  }
  function approveVacation(empId, vacId) {
    const updated = { ...vacations, [empId]: (vacations[empId]||[]).map(v => v.id===vacId?{...v,status:"approved"}:v) };
    setVacations(updated);
    fbSave({ employees, availability, assigned, notes, empNotes, empPasswords, managerPassword, fridayRota, published, dayRemarks, shiftNotes, vacations: updated });
    showToast("חופשה אושרה ✓");
  }
  function rejectVacation(empId, vacId) {
    const updated = { ...vacations, [empId]: (vacations[empId]||[]).map(v => v.id===vacId?{...v,status:"rejected"}:v) };
    setVacations(updated);
    fbSave({ employees, availability, assigned, notes, empNotes, empPasswords, managerPassword, fridayRota, published, dayRemarks, shiftNotes, vacations: updated });
    showToast("חופשה נדחתה", "err");
  }
  function parseDDMMYY(str) {
    if (!str) return null;
    const parts = str.split("/");
    if (parts.length !== 3) return null;
    const [dd, mm, yy] = parts;
    return `20${yy}-${mm.padStart(2,"0")}-${dd.padStart(2,"0")}`;
  }
  function isOnVacation(empId, date) {
    const key = dateKey(date);
    return (vacations[empId]||[]).some(v => {
      if (v.status !== "approved") return false;
      const start = parseDDMMYY(v.start) || v.start;
      const end = parseDDMMYY(v.end) || v.end;
      return key >= start && key <= end;
    });
  }
  const pendingVacations = Object.entries(vacations).flatMap(([empId,reqs])=>
    reqs.filter(r=>r.status==="pending").map(r=>({...r, empId: Number(empId)}))
  );

  function snKey(date, shiftId) { return `${dateKey(date)}_${shiftId}`; }
  function getShiftNote(date, shiftId) { return shiftNotes[snKey(date,shiftId)] || ""; }
  function setShiftNote(date, shiftId, val) { setShiftNotes(prev=>({...prev,[snKey(date,shiftId)]:val})); }

  function openChangePw() {
    setChangePwModal(currentUser.isManager ? "manager" : currentUser.id);
    setChangePwOld(""); setChangePwNew(""); setChangePwNew2(""); setChangePwErr("");
  }

  function submitChangePw() {
    if (changePwNew.length < 4)            { setChangePwErr("סיסמה חדשה — לפחות 4 תווים"); return; }
    if (changePwNew !== changePwNew2)       { setChangePwErr("הסיסמאות אינן תואמות"); return; }
    if (changePwModal === "manager") {
      if (changePwOld !== managerPassword) { setChangePwErr("סיסמה נוכחית שגויה"); return; }
      setManagerPassword(changePwNew);
    } else {
      if (changePwOld !== empPasswords[changePwModal]) { setChangePwErr("סיסמה נוכחית שגויה"); return; }
      setEmpPasswords(prev => ({ ...prev, [changePwModal]: changePwNew }));
    }
    setChangePwModal(null);
    showToast("סיסמה עודכנה ✓");
  }

  // ── AVAILABILITY ──
  const avKey = (empId,date,shiftId) => `${empId}_${dateKey(date)}_${shiftId}`;
  const isAv  = (empId,date,shiftId) => !!availability[avKey(empId,date,shiftId)];

  function toggleAv(date,shiftId) {
    if (isPastDeadline(weekOffset) && !currentUser?.isManager) { showToast("השיבוץ נעול (עבר יום שלישי 12:00)","err"); return; }
    const k = avKey(currentUser.id,date,shiftId);
    setAvailability(prev=>({...prev,[k]:!prev[k]}));
  }

  // ── ASSIGN ──
  const aKey      = (date,shiftId,role) => `${dateKey(date)}_${shiftId}_${role}`;
  const getAssigned = (date,shiftId,role) => assigned[aKey(date,shiftId,role)]||[];

  function toggleAssign(date,shiftId,role,empId) {
    const k   = aKey(date,shiftId,role);
    const cur = assigned[k]||[];
    const shift = (DAY_SHIFTS[date.getDay()]||[]).find(s=>s.id===shiftId);
    const max = shift?.slots[role]||1;
    // No max check in manual mode (manager override)
    setAssigned(prev=>({...prev,[k]: cur.includes(empId)?cur.filter(id=>id!==empId):[...cur,empId]}));
  }

  // ── AUTO ASSIGN ──
  function runAutoAssign() {
    const result = autoAssign(employees, availability, fridayRota, assigned);
    setAssigned(result);
    setShowAutoConfirm(false);
    showToast("שיבוץ אוטומטי הושלם ✓");
  }

  // ── CSV UPLOAD ──
  function handleCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split(/\r?\n/).filter(Boolean);
      const rota = [];
      lines.slice(1).forEach(line => { // skip header
        const parts = line.split(",").map(s=>s.trim());
        if (parts.length>=3) rota.push({ date:parts[0], name:parts[1], shift:parts[2] });
      });
      setFridayRota(rota);
      showToast(`נטענו ${rota.length} תורנויות שישי ✓`);
    };
    reader.readAsText(file, "utf-8");
    e.target.value="";
  }

  // ── NOTES ──
  function saveEmpNote() {
    setEmpNotes(prev=>({...prev,[currentUser.id]:empNoteInput}));
    showToast("הערה נשמרה ✓");
  }

  // ── STATS ──
  function getEmpStats(empId) {
    let morning=0, evening=0;
    weekDates.forEach(date=>{
      (DAY_SHIFTS[date.getDay()]||[]).forEach(sh=>{
        ROLES.forEach(role=>{
          if(getAssigned(date,sh.id,role).includes(empId)){
            if(sh.id==="morning"||sh.id==="open") morning++;
            else evening++;
          }
        });
      });
    });
    return { morning, evening, total: morning+evening };
  }

  // ── MISSING SLOTS ──
  function getMissingSlots() {
    const missing = [];
    weekDates.forEach(date=>{
      (DAY_SHIFTS[date.getDay()]||[]).forEach(sh=>{
        ROLES.forEach(role=>{
          const needed = sh.slots[role]||0;
          const filled = getAssigned(date,sh.id,role).length;
          if(filled < needed) missing.push({ date, shift:sh, role, filled, needed });
        });
      });
    });
    return missing;
  }

  // ── WHATSAPP ──
  function buildScheduleText() {
    let t = `📋 ${APP_NAME}\nשבוע ${formatDateShort(weekDates[0])}–${formatDateShort(weekDates[6])}\n\n`;
    weekDates.forEach(date=>{
      let block=`📅 ${formatDate(date)}\n`; let any=false;
      (DAY_SHIFTS[date.getDay()]||[]).forEach(sh=>{
        const parts=[];
        ROLES.forEach(role=>{
          const emps=getAssigned(date,sh.id,role);
          if(emps.length) parts.push(`${role}: ${emps.map(id=>employees.find(e=>e.id===id)?.name||"?").join(", ")}`);
        });
        if(parts.length){
          any=true;
          const sNote = getShiftNote(date, sh.id);
          block+=`  ${sh.label} (${sh.time}) — ${parts.join(" | ")}${sNote?`\n     💬 ${sNote}`:""}\n`;
        }
      });
      const remarks = getRemarks(date);
      if(remarks.length){ any=true; block+=`  📌 ${remarks.join(" | ")}\n`; }
      if(any) t+=block+"\n";
    });
    return t;
  }

  function buildReminderText() {
    return `💊 ${APP_NAME}\nתזכורת: נא להשתבץ לשבוע ${formatDateShort(weekDates[0])}–${formatDateShort(weekDates[6])} עד יום שלישי 12:00\nפתח/י את האפליקציה ורשום/י זמינות.`;
  }

  function buildPersonalText(emp) {
    let t = `💊 ${APP_NAME}\nשלום ${emp.name}! הסידור שלך לשבוע ${formatDateShort(weekDates[0])}–${formatDateShort(weekDates[6])}:\n\n`;
    let any = false;
    weekDates.forEach(date=>{
      let dayLine = "";
      (DAY_SHIFTS[date.getDay()]||[]).forEach(sh=>{
        ROLES.forEach(role=>{
          if(getAssigned(date,sh.id,role).includes(emp.id)){
            any = true;
            const sNote = getShiftNote(date, sh.id);
            dayLine += `📅 ${formatDate(date)} — ${sh.label} (${sh.time})${sNote?`\n   💬 ${sNote}`:""}\n`;
          }
        });
      });
      const remarks = getRemarks(date);
      if(dayLine) {
        t += dayLine;
        if(remarks.length) t += `   📌 ${remarks.join(" | ")}\n`;
      }
    });
    if(!any) t += "לא שובצת השבוע.\n";
    t += "\nבהצלחה! 💊";
    return t;
  }

  function openWhatsApp(phone, text) {
    const num = phone.replace(/\D/g,"");
    window.open(`https://wa.me/${num.startsWith("0")?`972${num.slice(1)}`:num}?text=${encodeURIComponent(text)}`,"_blank");
  }

  function sendGroupReminder() {
    const text = buildReminderText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,"_blank");
  }

  // ── WHO HASN'T SUBMITTED ──
  function notSubmitted() {
    return employees.filter(emp=>{
      const total = weekDates.reduce((acc,date)=>{
        return acc + (DAY_SHIFTS[date.getDay()]||[]).filter(sh=>(sh.slots[emp.role]||0)>0 && isAv(emp.id,date,sh.id)).length;
      },0);
      return total===0;
    });
  }

  // ── STYLES ──
  const S = {
    app:    { minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Segoe UI',Tahoma,sans-serif", direction:"rtl", color:"#1e293b" },
    header: { background:"#1e293b", padding:"12px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 10px rgba(0,0,0,0.2)" },
    logo:   { fontSize:"14px", fontWeight:"800", color:"#38bdf8", lineHeight:1.3 },
    main:   { maxWidth:900, margin:"0 auto", padding:"16px 12px 80px" },
    card:   { background:"#fff", border:"1px solid #e2e8f0", borderRadius:"12px", padding:"14px", marginBottom:"12px", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" },
    alertCard: { background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"12px", padding:"14px", marginBottom:"12px" },
    btn:    (bg,fg)=>({ background:bg||"#0ea5e9", color:fg||"#fff", border:"none", borderRadius:"9px", padding:"9px 16px", fontWeight:"700", fontSize:"13px", cursor:"pointer" }),
    btnSm:  (bg,fg)=>({ background:bg||"#64748b", color:fg||"#fff", border:"none", borderRadius:"7px", padding:"4px 10px", fontWeight:"700", fontSize:"12px", cursor:"pointer" }),
    btnOut: (c)=>({ background:"transparent", color:c||"#1e293b", border:`2px solid ${c||"#1e293b"}`, borderRadius:"9px", padding:"8px 14px", fontWeight:"700", fontSize:"13px", cursor:"pointer" }),
    input:  { background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"8px", padding:"8px 12px", fontSize:"13px", color:"#1e293b", direction:"rtl", boxSizing:"border-box" },
    tab:    (a)=>({ background:a?"#1e293b":"transparent", color:a?"#f8fafc":"#64748b", border:"none", borderRadius:"7px", padding:"6px 13px", fontWeight:"700", fontSize:"12px", cursor:"pointer" }),
    badge:  (role)=>({ background:ROLE_COLORS[role]?.light||"#f1f5f9", color:ROLE_COLORS[role]?.dark||"#334155", border:`1px solid ${ROLE_COLORS[role]?.bg||"#cbd5e1"}`, borderRadius:"20px", padding:"2px 9px", fontSize:"11px", fontWeight:"700", display:"inline-block" }),
    chip:   (a)=>({ border:`2px solid ${a?"#0ea5e9":"#e2e8f0"}`, background:a?"#e0f2fe":"#f8fafc", color:a?"#0369a1":"#64748b", borderRadius:"9px", padding:"7px 12px", fontWeight:"700", fontSize:"12px", cursor:"pointer", userSelect:"none" }),
    empChip:(a,dim)=>({ border:`2px solid ${a?"#22c55e":"#0ea5e9"}`, background:a?"#dcfce7":"#eff6ff", color:a?"#15803d":"#1d4ed8", borderRadius:"9px", padding:"5px 10px", fontWeight:"700", fontSize:"12px", cursor:"pointer", userSelect:"none", opacity:dim?0.35:1 }),
    toast:  (type)=>({ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:type==="err"?"#ef4444":"#22c55e", color:"#fff", padding:"11px 22px", borderRadius:"11px", fontWeight:"700", fontSize:"14px", zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,0.2)", whiteSpace:"nowrap" }),
    sTitle: { fontWeight:"800", fontSize:"13px", color:"#475569", marginBottom:8 },
  };

  // ════════════ LOADING ════════════
  if (!fbLoaded) return (
    <div style={{minHeight:"100vh",background:"#1e293b",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',Tahoma,sans-serif"}}>
      <div style={{fontSize:52,marginBottom:16}}>💊</div>
      <div style={{color:"#38bdf8",fontWeight:"800",fontSize:18,marginBottom:8}}>{APP_NAME}</div>
      <div style={{color:"#64748b",fontSize:14}}>טוען נתונים...</div>
    </div>
  );

  // ════════════ LOGIN ════════════
  if (view==="login") return (
    <div style={S.app}>
      <div style={S.header}><div style={S.logo}>{APP_NAME}</div></div>
      <div style={{...S.main, maxWidth:400}}>
        <div style={{textAlign:"center",padding:"24px 0 14px"}}>
          <div style={{fontSize:46,marginBottom:6}}>💊</div>
          <div style={{fontSize:20,fontWeight:"800"}}>{APP_NAME}</div>
          <div style={{color:"#94a3b8",fontSize:12,marginTop:3}}>שבוע {formatDateShort(weekDates[0])} – {formatDateShort(weekDates[6])}</div>
          {isPastDeadline() && <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:"8px",padding:"6px 12px",fontSize:12,color:"#dc2626",marginTop:8,fontWeight:"700"}}>⏰ השיבוץ נעול — עבר יום שלישי 12:00</div>}
        </div>
        <div style={S.card}>
          {!showManagerLogin ? (
            <button style={{...S.btn("#1e293b"),width:"100%",padding:"12px",fontSize:"14px",marginBottom:12}} onClick={()=>setShowManagerLogin(true)}>🔑 כניסה כמנהל/ת</button>
          ) : (
            <div style={{marginBottom:12}}>
              <div style={{fontWeight:"700",fontSize:13,marginBottom:8,color:"#1e293b"}}>🔑 כניסת מנהל/ת</div>
              <input
                style={{...S.input,width:"100%",marginBottom:7,letterSpacing:"0.1em"}}
                type="password"
                placeholder="סיסמה"
                value={pwInput}
                onChange={e=>{setPwInput(e.target.value);setPwError(false);}}
                onKeyDown={e=>e.key==="Enter"&&loginManager()}
                autoFocus
              />
              {pwError && <div style={{color:"#ef4444",fontSize:12,fontWeight:"700",marginBottom:6}}>❌ סיסמה שגויה</div>}
              <div style={{display:"flex",gap:7}}>
                <button style={{...S.btn(),flex:1}} onClick={loginManager}>כניסה</button>
                <button style={{...S.btn("#94a3b8"),flex:1}} onClick={()=>{setShowManagerLogin(false);setPwInput("");setPwError(false);}}>ביטול</button>
              </div>
            </div>
          )}
          <div style={{color:"#94a3b8",textAlign:"center",fontSize:12,marginBottom:10}}>— כניסה כעובד/ת —</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {employees.map(emp=>(
              <button key={emp.id} style={{...S.btn("#f8fafc","#1e293b"),width:"100%",textAlign:"right",border:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 13px"}} onClick={()=>selectEmp(emp)}>
                <span>👤 {emp.name}</span>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {empPasswords[emp.id] ? <span style={{fontSize:10,color:"#22c55e"}}>🔒</span> : <span style={{fontSize:10,color:"#f59e0b"}}>הגדר סיסמה</span>}
                  <span style={S.badge(emp.role)}>{emp.role}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Employee password modal */}
          {selectedEmp && (
            <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
              <div style={{background:"#fff",borderRadius:16,padding:24,width:"100%",maxWidth:340,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
                <div style={{fontWeight:"800",fontSize:16,marginBottom:4}}>👤 {selectedEmp.name}</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:16}}>
                  {!empPasswords[selectedEmp.id] ? "כניסה ראשונה — קבע/י סיסמה אישית" : "הכנס/י סיסמה"}
                </div>
                <input
                  style={{...S.input,width:"100%",marginBottom:8,letterSpacing:"0.1em",boxSizing:"border-box"}}
                  type="password"
                  placeholder="סיסמה"
                  value={empPwInput}
                  onChange={e=>{setEmpPwInput(e.target.value);setEmpPwError("");}}
                  onKeyDown={e=>e.key==="Enter"&&(!empPasswords[selectedEmp.id]?null:submitEmpLogin())}
                  autoFocus
                />
                {!empPasswords[selectedEmp.id] && (
                  <input
                    style={{...S.input,width:"100%",marginBottom:8,letterSpacing:"0.1em",boxSizing:"border-box"}}
                    type="password"
                    placeholder="אימות סיסמה"
                    value={empPwConfirm}
                    onChange={e=>{setEmpPwConfirm(e.target.value);setEmpPwError("");}}
                    onKeyDown={e=>e.key==="Enter"&&submitEmpLogin()}
                  />
                )}
                {empPwError && <div style={{color:"#ef4444",fontSize:12,fontWeight:"700",marginBottom:8}}>❌ {empPwError}</div>}
                <div style={{display:"flex",gap:8}}>
                  <button style={{...S.btn(),flex:1}} onClick={submitEmpLogin}>
                    {!empPasswords[selectedEmp.id] ? "קבע סיסמה וכנס/י" : "כניסה"}
                  </button>
                  <button style={{...S.btn("#94a3b8"),flex:1}} onClick={()=>{setSelectedEmp(null);setEmpPwInput("");setEmpPwConfirm("");setEmpPwError("");}}>ביטול</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );

  // ════════════ EMPLOYEE ════════════
  if (view==="employee") {
    const myRole = currentUser.role;
    const locked = isPastDeadline(weekOffset);
    const relevantDays = weekDates.filter(date=>(DAY_SHIFTS[date.getDay()]||[]).some(sh=>(sh.slots[myRole]||0)>0));
    const totalSel = weekDates.reduce((acc,date)=>(DAY_SHIFTS[date.getDay()]||[]).filter(sh=>(sh.slots[myRole]||0)>0&&isAv(currentUser.id,date,sh.id)).length+acc,0);
    return (
      <div style={S.app}>
        <div style={S.header}>
          <div style={S.logo}>{APP_NAME}</div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={S.badge(myRole)}>{myRole}</span>
            <span style={{fontSize:12,color:"#94a3b8"}}>{currentUser.name}</span>
            <button style={S.btnSm("#475569")} onClick={openChangePw}>🔑 סיסמה</button>
            <button style={S.btnSm()} onClick={logout}>יציאה</button>
          </div>
        </div>
        <div style={S.main}>
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
              <div style={{fontWeight:"800",fontSize:16}}>📅 שבוע {formatDateShort(weekDates[0])} – {formatDateShort(weekDates[6])}</div>
              <div style={{display:"flex",alignItems:"center",gap:6,background:"#f1f5f9",borderRadius:"8px",padding:"3px 8px"}}>
                <button style={{background:"none",border:"none",color:"#1e293b",cursor:"pointer",fontSize:16,padding:"0 4px"}} onClick={()=>setWeekOffset(w=>Math.max(0,w-1))}>◀</button>
                <span style={{fontSize:11,color:"#64748b",minWidth:60,textAlign:"center"}}>
                  {weekOffset===0?"הבא":weekOffset===1?"שבועיים":`+${weekOffset+1} שבועות`}
                </span>
                <button style={{background:"none",border:"none",color:"#1e293b",cursor:"pointer",fontSize:16,padding:"0 4px"}} onClick={()=>setWeekOffset(w=>w+1)}>▶</button>
              </div>
            </div>
            <div style={{color:"#64748b",fontSize:12,marginTop:3}}>
              {locked
                ? <span style={{color:"#ef4444",fontWeight:"700"}}>⏰ שבוע זה נעול — עבר יום שלישי 12:00</span>
                : <>סמן/י זמינות • <span style={{color:"#0ea5e9",fontWeight:"700"}}>{totalSel} נבחרו</span></>}
            </div>
          </div>

          {/* Published schedule */}
          {published && (()=>{
            const mySlots=[];
            weekDates.forEach(date=>{(DAY_SHIFTS[date.getDay()]||[]).forEach(sh=>{if(getAssigned(date,sh.id,myRole).includes(currentUser.id)) mySlots.push({date,sh});});});
            return (
              <div style={{...S.card,background:"#f0fdf4",border:"1px solid #86efac",marginBottom:12}}>
                <div style={{fontWeight:"800",color:"#15803d",marginBottom:6}}>✅ המשמרות שלך השבוע</div>
                {mySlots.length===0 ? <div style={{color:"#64748b",fontSize:13}}>לא שובצת השבוע</div>
                  : mySlots.map(({date,sh})=>(
                    <div key={dateKey(date)+sh.id} style={{fontSize:13,color:"#166534",marginBottom:2}}>
                      <strong>{formatDate(date)}</strong> — {sh.label} ({sh.time})
                    </div>
                  ))}
              </div>
            );
          })()}

          {/* Availability selection */}
          {relevantDays.map(date=>{
            const onVac = isOnVacation(currentUser.id, date);
            return (
              <div key={dateKey(date)} style={S.card}>
                <div style={{fontWeight:"800",fontSize:13,marginBottom:8}}>{formatDate(date)}</div>
                {onVac ? (
                  <div style={{background:"#d1fae5",border:"1px solid #6ee7b7",borderRadius:"10px",padding:"12px",textAlign:"center",color:"#065f46",fontWeight:"700",fontSize:14}}>
                    🌴 חופשה נעימה! 😊
                  </div>
                ) : (
                  <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                    {(DAY_SHIFTS[date.getDay()]||[]).filter(sh=>(sh.slots[myRole]||0)>0).map(sh=>{
                      const active=isAv(currentUser.id,date,sh.id);
                      return (
                        <button key={sh.id} style={S.chip(active)} onClick={()=>!locked&&toggleAv(date,sh.id)} disabled={locked&&!active}>
                          {active?"✓ ":""}{sh.label} <span style={{fontSize:10,opacity:0.7,fontWeight:"400"}}>{sh.time}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Vacation request */}
          <div style={S.card}>
            <div style={S.sTitle}>🌴 בקשת חופשה</div>
            {(vacations[currentUser.id]||[]).length>0 && (
              <div style={{marginBottom:12}}>
                {(vacations[currentUser.id]||[]).map(v=>(
                  <div key={v.id} style={{fontSize:12,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0",borderBottom:"1px solid #f1f5f9"}}>
                    <span>{v.type==="יום בודד"?v.start:`${v.start} – ${v.end}`} ({v.type})</span>
                    <span style={{fontWeight:"700",color:v.status==="approved"?"#22c55e":v.status==="rejected"?"#ef4444":"#f59e0b"}}>
                      {v.status==="approved"?"✓ אושר":v.status==="rejected"?"✗ נדחה":"⏳ ממתין"}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:6,marginBottom:8}}>
              {["יום בודד","טווח תאריכים"].map(t=>(
                <button key={t} style={{...S.chip(vacType===t),flex:1,textAlign:"center"}} onClick={()=>setVacType(t)}>{t}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:120}}>
                <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>{vacType==="יום בודד"?"תאריך":"מתאריך"} (DD/MM/YY)</div>
                <input
                  type="text"
                  placeholder="01/06/25"
                  maxLength={8}
                  style={{...S.input,width:"100%",boxSizing:"border-box"}}
                  value={vacStart}
                  onChange={e=>{
                    let v=e.target.value.replace(/[^0-9/]/g,"");
                    if(v.length===2&&!v.includes("/")) v=v+"/";
                    if(v.length===5&&v.split("/").length===2) v=v+"/";
                    setVacStart(v);
                  }}
                />
              </div>
              {vacType==="טווח תאריכים" && (
                <div style={{flex:1,minWidth:120}}>
                  <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>עד תאריך (DD/MM/YY)</div>
                  <input
                    type="text"
                    placeholder="07/06/25"
                    maxLength={8}
                    style={{...S.input,width:"100%",boxSizing:"border-box"}}
                    value={vacEnd}
                    onChange={e=>{
                      let v=e.target.value.replace(/[^0-9/]/g,"");
                      if(v.length===2&&!v.includes("/")) v=v+"/";
                      if(v.length===5&&v.split("/").length===2) v=v+"/";
                      setVacEnd(v);
                    }}
                  />
                </div>
              )}
            </div>
            <input style={{...S.input,width:"100%",marginBottom:8,boxSizing:"border-box"}} placeholder="הערה (אופציונלי)" value={vacNote} onChange={e=>setVacNote(e.target.value)} />
            <button style={{...S.btn("#0ea5e9"),width:"100%"}} onClick={()=>{
              if(!vacStart){showToast("נא לבחור תאריך","err");return;}
              const end = vacType==="יום בודד"?vacStart:vacEnd||vacStart;
              addVacationRequest(currentUser.id,vacStart,end,vacType,vacNote);
              setVacStart("");setVacEnd("");setVacNote("");
            }}>שלח בקשת חופשה</button>
          </div>

          {/* Note to manager */}
          <div style={S.card}>
            <div style={S.sTitle}>📝 הערה למנהל/ת (אופציונלי)</div>
            <textarea style={{...S.input,width:"100%",minHeight:70,resize:"vertical",marginBottom:8}} placeholder="כתוב/י כאן הערה למנהל/ת..." value={empNoteInput} onChange={e=>setEmpNoteInput(e.target.value)} />
            <button style={S.btn()} onClick={saveEmpNote}>שמור הערה</button>
          </div>

          {/* Feedback */}
          <div style={S.card}>
            <div style={S.sTitle}>💡 רעיונות ומשוב על האפליקציה</div>
            <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>מה דעתך? יש רעיון לשיפור? נשמח לשמוע!</div>
            <textarea
              style={{...S.input,width:"100%",minHeight:80,resize:"vertical",marginBottom:8}}
              placeholder="כתוב/י כאן את המשוב שלך..."
              id="emp-feedback-input"
              defaultValue={empNotes[`feedback_${currentUser.id}`]||""}
            />
            <button style={S.btn("#7e22ce")} onClick={()=>{
              const val = document.getElementById("emp-feedback-input").value.trim();
              if(!val) return;
              setEmpNotes(prev=>({...prev,[`feedback_${currentUser.id}`]:val}));
              showToast("משוב נשלח, תודה! 💜");
            }}>שלח משוב</button>
          </div>

          {/* Phone number update */}
          <div style={S.card}>
            <div style={S.sTitle}>📱 מספר טלפון</div>
            <div style={{fontSize:12,color:"#64748b",marginBottom:8}}>
              {currentUser.phone ? `מספר נוכחי: ${currentUser.phone}` : "לא הוזן מספר טלפון עדיין"}
            </div>
            <div style={{display:"flex",gap:8}}>
              <input
                style={{...S.input,flex:1}}
                type="tel"
                placeholder="05XXXXXXXX"
                maxLength={10}
                defaultValue={currentUser.phone||""}
                id="emp-phone-input"
                onInput={e=>{e.target.value=e.target.value.replace(/[^0-9]/g,"");}}
              />
              <button style={S.btn()} onClick={()=>{
                const val = document.getElementById("emp-phone-input").value.trim();
                if(!/^05\d{8}$/.test(val)) { showToast("מספר לא תקין — נא להזין 05XXXXXXXX","err"); return; }
                setEmployees(prev=>prev.map(e=>e.id===currentUser.id?{...e,phone:val}:e));
                setCurrentUser(prev=>({...prev,phone:val}));
                showToast("מספר טלפון עודכן ✓");
              }}>שמור</button>
            </div>
            <div style={{fontSize:11,color:"#94a3b8",marginTop:5}}>פורמט: 05XXXXXXXX (10 ספרות, ללא מקפים)</div>
          </div>

          {/* Calendar export — only shown when schedule is published */}
          {published && (()=>{
            const mySlots=[];
            weekDates.forEach(date=>{
              (DAY_SHIFTS[date.getDay()]||[]).forEach(sh=>{
                if(getAssigned(date,sh.id,myRole).includes(currentUser.id)) mySlots.push({date,sh});
              });
            });
            if(!mySlots.length) return null;

            function exportICS() {
              const pad = n => String(n).padStart(2,"0");
              function toICSDate(d, timeStr, offsetMins=0) {
                const [h,m] = timeStr.split(":").map(Number);
                const dt = new Date(d);
                dt.setHours(h, m + offsetMins, 0, 0);
                return `${dt.getFullYear()}${pad(dt.getMonth()+1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
              }
              let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//pharmacy-schedule//HE\nCALSCALE:GREGORIAN\n";
              mySlots.forEach(({date, sh},i)=>{
                const [startT, endT] = sh.time.split("-");
                // Handle overnight shifts (end < start means next day)
                const [sh_end_h] = endT.split(":").map(Number);
                const [sh_start_h] = startT.split(":").map(Number);
                const endDate = sh_end_h < sh_start_h ? new Date(date.getTime()+86400000) : date;
                ics += `BEGIN:VEVENT\n`;
                ics += `UID:shift-${currentUser.id}-${i}@pharmacy-harish\n`;
                ics += `DTSTART:${toICSDate(date, startT)}\n`;
                ics += `DTEND:${toICSDate(endDate, endT)}\n`;
                ics += `SUMMARY:משמרת ${sh.label} — ${APP_NAME}\n`;
                ics += `DESCRIPTION:${sh.label} (${sh.time})\n`;
                ics += `END:VEVENT\n`;
              });
              ics += "END:VCALENDAR";
              const blob = new Blob([ics], {type:"text/calendar;charset=utf-8"});
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = "משמרות.ics"; a.click();
              URL.revokeObjectURL(url);
              showToast("קובץ יומן הורד ✓");
            }

            return (
              <div style={{...S.card,background:"#f0fdf4",border:"1px solid #86efac"}}>
                <div style={S.sTitle}>📅 הוסף משמרות ליומן</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:10}}>
                  הורד קובץ .ics — פתח אותו בנייד כדי להוסיף לגוגל קלנדר, אאוטלוק, או יומן אפל
                </div>
                <button style={{...S.btn("#22c55e"),width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={exportICS}>
                  📥 הורד למכשיר ({mySlots.length} משמרות)
                </button>
              </div>
            );
          })()}

          <div style={{textAlign:"center",color:"#94a3b8",fontSize:11,marginTop:4}}>נשמר אוטומטית</div>
        </div>
        {changePwModal && <ChangePwModal />}
        {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
      </div>
    );
  }

  // ════════════ MANAGER ════════════
  const missing = getMissingSlots();
  const tabs = [["simulation","📊 סימולציה"],["assign","✏️ שיבוץ"],["publish","📤 פרסום"],["notes","📝 הערות"],["feedback","💡 משוב"],["vacations","🌴 חופשות"],["settings","⚙️ הגדרות"]];

  return (
    <div style={S.app}>
      <div style={S.header}>
        <div style={S.logo}>{APP_NAME} — מנהל/ת</div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {/* Week navigation */}
          <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.1)",borderRadius:"8px",padding:"3px 8px"}}>
            <button style={{background:"none",border:"none",color:"#f8fafc",cursor:"pointer",fontSize:16,padding:"0 4px"}} onClick={()=>setWeekOffset(w=>w-1)}>◀</button>
            <span style={{fontSize:11,color:"#94a3b8",minWidth:90,textAlign:"center"}}>
              {weekOffset===0?"שבוע נוכחי":weekOffset===1?"שבוע הבא":`+${weekOffset} שבועות`}
            </span>
            <button style={{background:"none",border:"none",color:"#f8fafc",cursor:"pointer",fontSize:16,padding:"0 4px"}} onClick={()=>setWeekOffset(w=>w+1)}>▶</button>
          </div>
          {missing.length>0 && <span style={{background:"#ef4444",color:"#fff",borderRadius:"20px",padding:"2px 10px",fontSize:12,fontWeight:"700"}}>⚠️ {missing.length} חסרים</span>}
          {pendingVacations.length>0 && <span style={{background:"#f59e0b",color:"#000",borderRadius:"20px",padding:"2px 10px",fontSize:12,fontWeight:"700"}}>🌴 {pendingVacations.length} חופשות</span>}
          <button style={S.btnSm("#0ea5e9")} onClick={()=>{
            getDoc(doc(db,"pharmacy","schedule")).then(snap=>{
              if(!snap.exists()) return;
              const d=snap.data();
              if(d.availability) setAvailability(d.availability);
              if(d.assigned) setAssigned(d.assigned);
              if(d.empNotes) setEmpNotes(d.empNotes);
              if(d.vacations) setVacations(d.vacations);
              showToast("נתונים עודכנו ✓");
            });
          }}>🔄</button>
          <button style={S.btnSm("#475569")} onClick={openChangePw}>🔑 סיסמה</button>
          <button style={S.btnSm()} onClick={logout}>יציאה</button>
        </div>
      </div>

      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"6px 12px",display:"flex",gap:3,position:"sticky",top:46,zIndex:90,flexWrap:"wrap"}}>
        {tabs.map(([id,label])=>(
          <button key={id} style={S.tab(managerTab===id)} onClick={()=>setManagerTab(id)}>{label}</button>
        ))}
      </div>

      <div style={S.main}>

        {/* ── SIMULATION TAB ── */}
        {managerTab==="simulation" && (
          <div>
            {/* Vacation alerts — employees currently on vacation */}
            {(() => {
              const today = new Date();
              const todayKey = dateKey(today);
              const onVacNow = employees.filter(emp =>
                (vacations[emp.id]||[]).some(v => {
                  if(v.status!=="approved") return false;
                  const start = parseDDMMYY(v.start) || v.start;
                  const end = parseDDMMYY(v.end) || v.end;
                  return todayKey >= start && todayKey <= end;
                })
              );
              const returning = employees.filter(emp =>
                (vacations[emp.id]||[]).some(v => {
                  if(v.status!=="approved") return false;
                  const end = parseDDMMYY(v.end) || v.end;
                  return end >= todayKey;
                })
              );
              if(!returning.length) return null;
              return (
                <div style={{...S.card, background:"#f0fdf4", border:"1px solid #86efac", marginBottom:14}}>
                  <div style={{fontWeight:"800",color:"#15803d",marginBottom:8}}>🌴 עובדים בחופשה</div>
                  {returning.map(emp=>{
                    const vac = (vacations[emp.id]||[]).find(v=>{
                      if(v.status!=="approved") return false;
                      const end = parseDDMMYY(v.end) || v.end;
                      return end >= todayKey;
                    });
                    if(!vac) return null;
                    return (
                      <div key={emp.id} style={{fontSize:13,color:"#166534",marginBottom:4,display:"flex",justifyContent:"space-between"}}>
                        <span><strong>{emp.name}</strong> בחופשה {vac.start !== vac.end ? `${vac.start} עד ${vac.end}` : vac.end}</span>
                        <span style={{fontSize:11,color:"#15803d"}}>חוזר/ת {vac.end}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            {/* Missing alerts */}
            {missing.length>0 && (
              <div style={S.alertCard}>
                <div style={{fontWeight:"800",color:"#dc2626",marginBottom:8,fontSize:14}}>⚠️ משמרות חסרות ({missing.length})</div>
                {missing.map((m,i)=>(
                  <div key={i} style={{fontSize:13,color:"#7f1d1d",marginBottom:3}}>
                    • {formatDate(m.date)} — {m.shift.label} — {m.role}: {m.filled}/{m.needed}
                  </div>
                ))}
              </div>
            )}

            {/* Weekly table */}
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.08)"}}>
                <thead>
                  <tr style={{background:"#1e293b",color:"#f8fafc"}}>
                    <th style={{padding:"10px 8px",textAlign:"right",fontWeight:"700",minWidth:80}}>משמרת</th>
                    {weekDates.map(date=>(
                      <th key={dateKey(date)} style={{padding:"10px 8px",textAlign:"center",fontWeight:"700",minWidth:90}}>
                        <div>{date.toLocaleDateString("he-IL",{weekday:"short"})}</div>
                        <div style={{fontSize:10,opacity:0.7}}>{formatDateShort(date)}</div>
                        {isFirstOfMonth(date) && <div style={{fontSize:9,color:"#fbbf24"}}>סגירת סמים</div>}
                        {getRemarks(date).map(r=>(
                          <div key={r} style={{fontSize:9,color:"#f59e0b",fontWeight:"700"}}>📌 {r}</div>
                        ))}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Rows: 2 display rows × 2 roles = 4 rows total */}
                  {(() => {
                    // Map each day's shift to a display row: "morning" row or "evening" row
                    const ROW_GROUPS = [
                      { rowId: "morning", label: "בוקר", matchIds: ["morning", "open"] },
                      { rowId: "evening", label: "ערב",  matchIds: ["evening", "close"] },
                    ];
                    const rows = [];
                    ROW_GROUPS.forEach((group, gi) => {
                      ROLES.forEach((role, ri) => {
                        rows.push(
                          <tr key={`${group.rowId}_${role}`} style={{background:(gi*2+ri)%2===0?"#f8fafc":"#fff",borderBottom:"1px solid #e2e8f0"}}>
                            <td style={{padding:"8px",fontWeight:"700",color:ROLE_COLORS[role]?.dark,whiteSpace:"nowrap"}}>
                              {group.label}&nbsp;<span style={S.badge(role)}>{role}</span>
                            </td>
                            {weekDates.map(date=>{
                              const dayShifts = DAY_SHIFTS[date.getDay()] || [];
                              // Find the shift for this day that belongs to this row group
                              const shift = dayShifts.find(s => group.matchIds.includes(s.id));
                              if (!shift) return <td key={dateKey(date)} style={{padding:"6px 4px",textAlign:"center",color:"#e2e8f0",fontSize:10}}>—</td>;
                              const needed = shift.slots[role] || 0;
                              if (needed === 0) return <td key={dateKey(date)} style={{padding:"6px 4px",textAlign:"center",color:"#e2e8f0",fontSize:10}}>—</td>;
                              const empIds = getAssigned(date, shift.id, role);
                              const filled = empIds.length;
                              const isMissing = filled < needed;
                              const names = empIds.map(id => employees.find(e => e.id === id)?.name || "?");
                              const isDrugClosing = isFirstOfMonth(date) && group.rowId === "morning" && role === "רוקח";
                              // Show shift time hint for friday/saturday where it differs
                              const dow = date.getDay();
                              const showTime = (dow === 5 || dow === 6);
                              return (
                                <td key={dateKey(date)} style={{padding:"6px 4px",textAlign:"center",background:isMissing?"#fef2f2":isDrugClosing?"#fefce8":"inherit"}}>
                                  {showTime && <div style={{fontSize:9,color:"#94a3b8",marginBottom:2}}>{shift.time}</div>}
                                  {isMissing && <div style={{color:"#ef4444",fontWeight:"800",fontSize:10}}>⚠️ חסר</div>}
                                  {names.map((n,ni)=>(
                                    <div key={ni} style={{fontSize:11,fontWeight:"600",color:isMissing?"#dc2626":"#1e293b"}}>
                                      {n}{isDrugClosing && ni===names.length-1 ? " 🔒" : ""}
                                    </div>
                                  ))}
                                  {names.length===0 && <div style={{color:"#ef4444",fontSize:10,fontWeight:"700"}}>—</div>}
                                  {getShiftNote(date,shift.id) && <div style={{fontSize:9,color:"#92400e",marginTop:2,background:"#fef3c7",borderRadius:4,padding:"1px 4px"}}>💬 {getShiftNote(date,shift.id)}</div>}
                                  {/* Show vacations */}
                                  {employees.filter(e=>e.role===role&&isOnVacation(e.id,date)).map(e=>(
                                    <div key={e.id} style={{fontSize:9,color:"#065f46",background:"#d1fae5",borderRadius:4,padding:"1px 4px",marginTop:1}}>🌴 {e.name}</div>
                                  ))}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      });
                    });
                    return rows;
                  })()}
                </tbody>
              </table>
            </div>

            {/* Stats summary */}
            <div style={{...S.card,marginTop:14}}>
              <div style={S.sTitle}>📈 סיכום משמרות לפי עובד</div>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{borderBottom:"2px solid #e2e8f0"}}>
                      <th style={{textAlign:"right",padding:"6px 8px",fontWeight:"700"}}>עובד/ת</th>
                      <th style={{textAlign:"center",padding:"6px",fontWeight:"700"}}>תפקיד</th>
                      <th style={{textAlign:"center",padding:"6px",fontWeight:"700",color:"#0369a1"}}>בוקר</th>
                      <th style={{textAlign:"center",padding:"6px",fontWeight:"700",color:"#7e22ce"}}>ערב</th>
                      <th style={{textAlign:"center",padding:"6px",fontWeight:"700"}}>סה״כ</th>
                      <th style={{textAlign:"center",padding:"6px",fontWeight:"700",color:"#64748b"}}>תקציב</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp=>{
                      const stats=getEmpStats(emp.id);
                      const bud=BUDGET.find(b=>b.name===emp.name);
                      const ok=!bud||(stats.total>=bud.min&&stats.total<=bud.max);
                      return (
                        <tr key={emp.id} style={{borderBottom:"1px solid #f1f5f9",background:!ok&&bud?"#fef2f2":"inherit"}}>
                          <td style={{padding:"6px 8px",fontWeight:"700"}}>{emp.name}</td>
                          <td style={{padding:"6px",textAlign:"center"}}><span style={S.badge(emp.role)}>{emp.role}</span></td>
                          <td style={{padding:"6px",textAlign:"center",color:"#0369a1",fontWeight:"700"}}>{stats.morning}</td>
                          <td style={{padding:"6px",textAlign:"center",color:"#7e22ce",fontWeight:"700"}}>{stats.evening}</td>
                          <td style={{padding:"6px",textAlign:"center",fontWeight:"800"}}>{stats.total}</td>
                          <td style={{padding:"6px",textAlign:"center",color:ok?"#22c55e":"#ef4444",fontSize:11}}>
                            {bud ? `${bud.min}${bud.max!==bud.min?`-${bud.max===99?"∞":bud.max}`:""}${ok?" ✓":" ⚠️"}` : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── ASSIGN TAB ── */}
        {managerTab==="assign" && (
          <div>
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <button style={S.btn("#7e22ce")} onClick={()=>setShowAutoConfirm(true)}>⚡ שיבוץ אוטומטי</button>
              <button style={S.btnOut("#ef4444")} onClick={()=>{if(window.confirm("לאפס את כל השיבוצים?")) setAssigned({});}}>🗑️ אפס שיבוץ</button>
              <span style={{fontSize:12,color:"#64748b"}}>שיבוץ ידני: לחץ/י על שם</span>
            </div>

            {showAutoConfirm && (
              <div style={{...S.card,background:"#f0fdf4",border:"1px solid #86efac",marginBottom:14}}>
                <div style={{fontWeight:"700",marginBottom:8}}>⚡ שיבוץ אוטומטי — לפי כל הכללים</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:10}}>תורנויות שישי, תקציבים, איזון בוקר/ערב, ללא כפל יומי</div>
                <div style={{display:"flex",gap:8}}>
                  <button style={S.btn("#22c55e")} onClick={runAutoAssign}>✓ אשר ושבץ</button>
                  <button style={S.btn("#64748b")} onClick={()=>setShowAutoConfirm(false)}>ביטול</button>
                </div>
              </div>
            )}

            {weekDates.map(date=>{
              const dayShifts=DAY_SHIFTS[date.getDay()]||[];
              return (
                <div key={dateKey(date)} style={S.card}>
                  <div style={{fontWeight:"800",fontSize:13,marginBottom:10,display:"flex",justifyContent:"space-between"}}>
                    {formatDate(date)}
                    {isFirstOfMonth(date)&&<span style={{fontSize:11,color:"#b45309",fontWeight:"700"}}>🔒 סגירת סמים</span>}
                  </div>
                  {/* Manager remarks for this day */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
                    {REMARK_OPTIONS.map(remark=>{
                      const active = getRemarks(date).includes(remark);
                      return (
                        <button key={remark}
                          style={{border:`2px solid ${active?"#f59e0b":"#e2e8f0"}`,background:active?"#fef3c7":"#f8fafc",color:active?"#92400e":"#94a3b8",borderRadius:"8px",padding:"4px 10px",fontWeight:"700",fontSize:11,cursor:"pointer",userSelect:"none"}}
                          onClick={()=>toggleRemark(date,remark)}>
                          {active?"📌 ":"+ "}{remark}
                        </button>
                      );
                    })}
                  </div>
                  {dayShifts.map(shift=>(
                    <div key={shift.id} style={{marginBottom:12,paddingBottom:10,borderBottom:"1px solid #f1f5f9"}}>
                      <div style={{fontWeight:"700",fontSize:12,color:"#475569",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span>🕐 {shift.label} <span style={{fontWeight:"400",color:"#94a3b8"}}>{shift.time}</span></span>
                      </div>
                      {/* Free-text note for this shift */}
                      <div style={{marginBottom:8}}>
                        <input
                          style={{...S.input,width:"100%",fontSize:12,padding:"6px 10px",boxSizing:"border-box",border:`1px solid ${getShiftNote(date,shift.id)?"#f59e0b":"#e2e8f0"}`,background:getShiftNote(date,shift.id)?"#fefce8":"#f8fafc"}}
                          placeholder={`💬 הוסף הערה למשמרת ${shift.label}...`}
                          value={getShiftNote(date,shift.id)}
                          onChange={e=>setShiftNote(date,shift.id,e.target.value)}
                        />
                      </div>
                      {ROLES.map(role=>{
                        const needed=shift.slots[role]||0;
                        if(!needed) return null;
                        const assignedIds=getAssigned(date,shift.id,role);
                        const avail=employees.filter(e=>e.role===role&&isAv(e.id,date,shift.id));
                        const allShown=[...new Set([...avail.map(e=>e.id),...assignedIds])];
                        const filled=assignedIds.length;
                        return (
                          <div key={role} style={{marginBottom:7,paddingRight:8,borderRight:`3px solid ${ROLE_COLORS[role]?.bg}`}}>
                            <div style={{fontSize:11,display:"flex",alignItems:"center",gap:5,marginBottom:5}}>
                              <span style={{fontWeight:"700",color:ROLE_COLORS[role]?.dark}}>{role}</span>
                              <span style={{background:filled>=needed?"#dcfce7":"#fef3c7",color:filled>=needed?"#15803d":"#92400e",borderRadius:"20px",padding:"1px 7px",fontSize:10,fontWeight:"700"}}>{filled}/{needed}</span>
                            </div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                              {allShown.map(empId=>{
                                const emp=employees.find(e=>e.id===empId);
                                if(!emp) return null;
                                const isAss=assignedIds.includes(empId);
                                return <button key={empId} style={S.empChip(isAss)} onClick={()=>toggleAssign(date,shift.id,role,empId)}>{isAss?"✓ ":"+ "}{emp.name}</button>;
                              })}
                              {allShown.length===0&&<span style={{color:"#94a3b8",fontSize:11}}>אין פנויים</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ── PUBLISH TAB ── */}
        {managerTab==="publish" && (
          <div>
            {/* Not submitted list */}
            {notSubmitted().length>0 && (
              <div style={S.alertCard}>
                <div style={{fontWeight:"800",color:"#dc2626",marginBottom:8}}>⚠️ טרם השתבצו ({notSubmitted().length})</div>
                {notSubmitted().map(emp=>(
                  <div key={emp.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:13,color:"#7f1d1d",fontWeight:"600"}}>{emp.name} <span style={S.badge(emp.role)}>{emp.role}</span></span>
                    {emp.phone && <button style={S.btnSm("#25D366")} onClick={()=>openWhatsApp(emp.phone,buildReminderText())}>📱 תזכורת</button>}
                  </div>
                ))}
                <button style={{...S.btn("#25D366"),marginTop:10,width:"100%"}} onClick={sendGroupReminder}>📱 שלח תזכורת קבוצתית</button>
              </div>
            )}

            <div style={S.card}>
              <div style={S.sTitle}>📤 שלח סידור</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {/* Publish in app */}
                <button style={{...S.btn(published?"#22c55e":"#0ea5e9"),padding:12,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={()=>{setPublished(true);showToast("פורסם ✓");}}>
                  {published?"✓ פורסם באפליקציה":"✅ פרסם באפליקציה לעובדים"}
                </button>
                {/* Full schedule whatsapp */}
                <button style={{...S.btn("#25D366"),padding:12,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={()=>window.open(`https://wa.me/?text=${encodeURIComponent(buildScheduleText())}`,"_blank")}>📱 שלח סידור מלא בווצאפ</button>
                <button style={{...S.btnOut(),padding:10,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={()=>navigator.clipboard.writeText(buildScheduleText()).then(()=>showToast("הועתק"))}>📋 העתק סידור מלא</button>
              </div>
            </div>

            {/* Per-employee whatsapp */}
            <div style={S.card}>
              <div style={S.sTitle}>📱 שלח לכל עובד בנפרד</div>
              {/* Send mode toggle */}
              <div style={{display:"flex",gap:6,marginBottom:12,background:"#f1f5f9",borderRadius:8,padding:4}}>
                <button style={{...S.tab(sendMode==="personal"),flex:1,borderRadius:6}} onClick={()=>setSendMode("personal")}>משמרות שלו בלבד</button>
                <button style={{...S.tab(sendMode==="full"),flex:1,borderRadius:6}} onClick={()=>setSendMode("full")}>סידור מלא</button>
              </div>
              <button style={{...S.btn("#25D366"),width:"100%",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}
                onClick={()=>{
                  employees.forEach((emp,i)=>{
                    const txt = sendMode==="personal" ? buildPersonalText(emp) : buildScheduleText();
                    if(emp.phone) setTimeout(()=>openWhatsApp(emp.phone,txt),i*800);
                  });
                  showToast("פותח ווצאפ לכל עובד...");
                }}>
                📤 שלח לכולם בנפרד
              </button>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {employees.map(emp=>{
                  const stats=getEmpStats(emp.id);
                  const txt = sendMode==="personal" ? buildPersonalText(emp) : buildScheduleText();
                  return (
                    <div key={emp.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #f8fafc"}}>
                      <div>
                        <span style={{fontSize:13,fontWeight:"700"}}>{emp.name}</span>
                        <span style={{...S.badge(emp.role),marginRight:6}}>{emp.role}</span>
                        {stats.total>0
                          ? <span style={{fontSize:11,color:"#22c55e",fontWeight:"700"}}>{stats.morning} בוקר • {stats.evening} ערב</span>
                          : <span style={{fontSize:11,color:"#94a3b8"}}>לא שובץ</span>}
                      </div>
                      <button
                        style={S.btnSm(emp.phone?"#25D366":"#94a3b8")}
                        onClick={()=>emp.phone?openWhatsApp(emp.phone,txt):showToast("אין מספר טלפון","err")}
                        title={emp.phone?"שלח ווצאפ":"הוסף מספר בהגדרות"}>
                        📱
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── NOTES TAB ── */}
        {managerTab==="notes" && (
          <div>
            <div style={{color:"#64748b",fontSize:12,marginBottom:12}}>הערות שהוכנסו על ידי העובדים:</div>
            {employees.map(emp=>{
              const note=empNotes[emp.id];
              if(!note) return null;
              return (
                <div key={emp.id} style={{...S.card,borderRight:`4px solid ${ROLE_COLORS[emp.role]?.bg}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontWeight:"800"}}>{emp.name}</span>
                    <span style={S.badge(emp.role)}>{emp.role}</span>
                  </div>
                  <div style={{fontSize:13,color:"#334155",background:"#f8fafc",borderRadius:"8px",padding:"8px 12px"}}>{note}</div>
                </div>
              );
            })}
            {Object.keys(empNotes).length===0 && <div style={{textAlign:"center",color:"#94a3b8",padding:30}}>אין הערות עדיין</div>}
          </div>
        )}

        {/* ── FEEDBACK TAB ── */}
        {managerTab==="feedback" && (
          <div>
            <div style={{color:"#64748b",fontSize:13,marginBottom:14}}>משובים שהתקבלו מהעובדים:</div>
            {employees.map(emp=>{
              const feedback = empNotes[`feedback_${emp.id}`];
              if(!feedback) return null;
              return (
                <div key={emp.id} style={{...S.card,borderRight:`4px solid #7e22ce`}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontWeight:"800"}}>{emp.name}</span>
                    <span style={S.badge(emp.role)}>{emp.role}</span>
                  </div>
                  <div style={{fontSize:13,color:"#334155",background:"#f5f3ff",borderRadius:"8px",padding:"8px 12px"}}>{feedback}</div>
                  <button style={{...S.btnSm("#ef4444"),marginTop:8}} onClick={()=>{
                    if(window.confirm("למחוק משוב זה?")) {
                      setEmpNotes(prev=>{const n={...prev};delete n[`feedback_${emp.id}`];return n;});
                      showToast("משוב נמחק");
                    }
                  }}>מחק</button>
                </div>
              );
            })}
            {employees.every(emp=>!empNotes[`feedback_${emp.id}`]) && (
              <div style={{textAlign:"center",color:"#94a3b8",padding:40}}>אין משובים עדיין</div>
            )}
          </div>
        )}

        {/* ── VACATIONS TAB ── */}
        {managerTab==="vacations" && (
          <div>
            {/* Pending requests */}
            <div style={{fontWeight:"800",fontSize:14,marginBottom:10}}>⏳ בקשות ממתינות ({pendingVacations.length})</div>
            {pendingVacations.length===0 && <div style={{...S.card,color:"#94a3b8",textAlign:"center",padding:30}}>אין בקשות ממתינות</div>}
            {pendingVacations.map(req=>{
              const emp = employees.find(e=>e.id===req.empId);
              return (
                <div key={req.id} style={{...S.card,borderRight:"4px solid #f59e0b"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <span style={{fontWeight:"800"}}>{emp?.name}</span>
                      <span style={{...S.badge(emp?.role||"רוקח"),marginRight:8}}>{emp?.role}</span>
                    </div>
                    <span style={{fontSize:11,background:req.type==="יום בודד"?"#e0f2fe":"#f3e8ff",color:req.type==="יום בודד"?"#0369a1":"#7e22ce",padding:"2px 8px",borderRadius:"20px",fontWeight:"700"}}>{req.type}</span>
                  </div>
                  <div style={{fontSize:13,color:"#475569",marginBottom:4}}>
                    {req.type==="יום בודד" ? `📅 ${req.start}` : `📅 ${req.start} עד ${req.end}`}
                  </div>
                  {req.note && <div style={{fontSize:12,color:"#64748b",background:"#f8fafc",borderRadius:"6px",padding:"4px 8px",marginBottom:8}}>💬 {req.note}</div>}
                  <div style={{display:"flex",gap:8}}>
                    <button style={S.btnSm("#22c55e")} onClick={()=>approveVacation(req.empId,req.id)}>✓ אשר</button>
                    <button style={S.btnSm("#ef4444")} onClick={()=>rejectVacation(req.empId,req.id)}>✗ דחה</button>
                  </div>
                </div>
              );
            })}

            {/* Approved vacations */}
            <div style={{fontWeight:"800",fontSize:14,margin:"16px 0 10px"}}>✅ חופשות מאושרות</div>
            {employees.map(emp=>{
              const approved = (vacations[emp.id]||[]).filter(v=>v.status==="approved");
              if(!approved.length) return null;
              return (
                <div key={emp.id} style={S.card}>
                  <div style={{fontWeight:"700",marginBottom:6}}>{emp.name} <span style={S.badge(emp.role)}>{emp.role}</span></div>
                  {approved.map(v=>(
                    <div key={v.id} style={{fontSize:13,color:"#166534",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"3px 0",borderBottom:"1px solid #f0fdf4"}}>
                      <span>{v.type==="יום בודד"?v.start:`${v.start} – ${v.end}`} ({v.type})</span>
                      <button style={S.btnSm("#ef4444")} onClick={()=>setVacations(prev=>({...prev,[emp.id]:(prev[emp.id]||[]).filter(x=>x.id!==v.id)}))}>✕</button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ── SETTINGS TAB ── */}
        {managerTab==="settings" && (
          <div>
            {/* Friday rota - manual entry */}
            <div style={S.card}>
              <div style={S.sTitle}>📅 תורנויות שישי</div>
              {fridayRota.length>0 && (
                <div style={{marginBottom:12}}>
                  {fridayRota.map((r,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #f1f5f9",fontSize:13}}>
                      <span><strong>{r.date}</strong> — פתיחה: {r.open||"—"} | סגירה: {r.close||"—"}</span>
                      <button style={S.btnSm("#ef4444")} onClick={()=>setFridayRota(prev=>prev.filter((_,j)=>j!==i))}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                <div style={{fontSize:12,color:"#64748b",fontWeight:"700"}}>הוסף תורנות שישי:</div>
                <input style={{...S.input,width:"100%",boxSizing:"border-box"}} type="date" value={newRotaDate} onChange={e=>setNewRotaDate(e.target.value)} />
                <div style={{display:"flex",gap:7}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>פתיחה (08:00-14:00)</div>
                    <select style={{...S.input,width:"100%",boxSizing:"border-box"}} value={newRotaOpen} onChange={e=>setNewRotaOpen(e.target.value)}>
                      <option value="">— בחר/י —</option>
                      {employees.filter(e=>e.role==="רוקח").map(emp=><option key={emp.id} value={emp.name}>{emp.name}</option>)}
                    </select>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>סגירה (14:00-20:00)</div>
                    <select style={{...S.input,width:"100%",boxSizing:"border-box"}} value={newRotaClose} onChange={e=>setNewRotaClose(e.target.value)}>
                      <option value="">— בחר/י —</option>
                      {employees.filter(e=>e.role==="רוקח").map(emp=><option key={emp.id} value={emp.name}>{emp.name}</option>)}
                    </select>
                  </div>
                </div>
                <button style={{...S.btn(),width:"100%"}} onClick={()=>{
                  if(!newRotaDate||(!newRotaOpen&&!newRotaClose)) return;
                  const d = new Date(newRotaDate);
                  const label = d.toLocaleDateString("he-IL",{day:"numeric",month:"numeric",year:"numeric"});
                  setFridayRota(prev=>[...prev.filter(r=>r.date!==label), {date:label, open:newRotaOpen, close:newRotaClose}].sort((a,b)=>a.date.localeCompare(b.date)));
                  setNewRotaDate(""); setNewRotaOpen(""); setNewRotaClose("");
                  showToast("תורנות נוספה ✓");
                }}>+ הוסף תורנות</button>
                {fridayRota.length>0 && <button style={{...S.btn("#ef4444"),width:"100%"}} onClick={()=>{if(window.confirm("למחוק את כל התורנויות?")) setFridayRota([]);}}>מחק הכל</button>}
              </div>
            </div>

            {/* Employees */}
            <div style={S.card}>
              <div style={S.sTitle}>👥 עובדים</div>
              {ROLES.map(role=>(
                <div key={role} style={{marginBottom:12}}>
                  <div style={{...S.badge(role),marginBottom:7}}>{role}</div>
                  {employees.filter(e=>e.role===role).map(emp=>(
                    <div key={emp.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:"1px solid #f8fafc",gap:8}}>
                      <span style={{fontWeight:"700",fontSize:13}}>{emp.name}</span>
                      <div style={{display:"flex",gap:5,alignItems:"center"}}>
                        <input style={{...S.input,width:110,fontSize:12}} placeholder="טלפון" value={emp.phone||""} onChange={e=>setEmployees(prev=>prev.map(em=>em.id===emp.id?{...em,phone:e.target.value}:em))} />
                        {empPasswords[emp.id] && (
                          <button style={S.btnSm("#f59e0b","#1e293b")} title="אפס סיסמה" onClick={()=>{
                            if(window.confirm(`לאפס סיסמה של ${emp.name}?`)) {
                              setEmpPasswords(prev=>{const n={...prev};delete n[emp.id];return n;});
                              showToast(`סיסמת ${emp.name} אופסה ✓`);
                            }
                          }}>🔓 אפס</button>
                        )}
                        <button style={S.btnSm("#ef4444")} onClick={()=>setEmployees(prev=>prev.filter(e=>e.id!==emp.id))}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
                <input style={{...S.input,flex:2,minWidth:120}} placeholder="שם" value={newEmpName} onChange={e=>setNewEmpName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&newEmpName.trim()&&(setEmployees(prev=>[...prev,{id:Date.now(),name:newEmpName.trim(),role:newEmpRole,phone:""}]),setNewEmpName(""))} />
                <select style={{...S.input,flex:1,minWidth:90}} value={newEmpRole} onChange={e=>setNewEmpRole(e.target.value)}>
                  {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
                <input style={{...S.input,flex:1,minWidth:100}} placeholder="טלפון" value={newEmpPhone} onChange={e=>setNewEmpPhone(e.target.value)} />
                <button style={S.btn()} onClick={()=>{if(!newEmpName.trim())return;setEmployees(prev=>[...prev,{id:Date.now(),name:newEmpName.trim(),role:newEmpRole,phone:newEmpPhone}]);setNewEmpName("");setNewEmpPhone("");}}>+ הוסף</button>
              </div>
            </div>

            {/* Deadline info */}
            <div style={S.card}>
              <div style={S.sTitle}>⏰ נעילת שיבוץ</div>
              <div style={{fontSize:13,color:"#64748b"}}>
                העובדים יכולים להשתבץ עד <strong>יום שלישי 12:00</strong>.<br/>
                לאחר מכן — רק מנהל/ת יכול/ה לשנות.<br/>
                מועד נעילה הקרוב: <strong>{getDeadline().toLocaleString("he-IL")}</strong>
              </div>
              <div style={{marginTop:8, fontSize:12, color:"#94a3b8"}}>
                סטטוס: {isPastDeadline() ? <span style={{color:"#ef4444",fontWeight:"700"}}>נעול</span> : <span style={{color:"#22c55e",fontWeight:"700"}}>פתוח</span>}
              </div>
            </div>

            {/* Reset */}
            <div style={S.card}>
              <div style={S.sTitle}>⚠️ איפוס</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button style={S.btn("#ef4444")} onClick={()=>{if(window.confirm("לאפס זמינויות ושיבוצים?")) {setAvailability({});setAssigned({});setPublished(false);showToast("אופס ✓");}}}>מחק זמינויות + שיבוצים</button>
                <button style={S.btn("#94a3b8")} onClick={()=>{if(window.confirm("לאפס הערות עובדים?")) {setEmpNotes({});showToast("הערות נמחקו");}  }}>מחק הערות</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {changePwModal && <ChangePwModal />}
      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );

  function ChangePwModal() {
    const isManager = changePwModal === "manager";
    const emp = !isManager ? employees.find(e => e.id === changePwModal) : null;
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
        <div style={{background:"#fff",borderRadius:16,padding:24,width:"100%",maxWidth:340,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
          <div style={{fontWeight:"800",fontSize:15,marginBottom:4}}>🔑 שינוי סיסמה</div>
          <div style={{fontSize:12,color:"#64748b",marginBottom:14}}>{isManager ? "מנהל/ת" : emp?.name}</div>
          <input
            style={{...S.input,width:"100%",marginBottom:8,boxSizing:"border-box",letterSpacing:"0.05em"}}
            type="password" placeholder="סיסמה נוכחית"
            value={changePwOld}
            onChange={e=>{setChangePwOld(e.target.value);setChangePwErr("");}}
          />
          <input
            style={{...S.input,width:"100%",marginBottom:8,boxSizing:"border-box",letterSpacing:"0.05em"}}
            type="password" placeholder="סיסמה חדשה (לפחות 4 תווים)"
            value={changePwNew}
            onChange={e=>{setChangePwNew(e.target.value);setChangePwErr("");}}
          />
          <input
            style={{...S.input,width:"100%",marginBottom:8,boxSizing:"border-box",letterSpacing:"0.05em"}}
            type="password" placeholder="אימות סיסמה חדשה"
            value={changePwNew2}
            onChange={e=>{setChangePwNew2(e.target.value);setChangePwErr("");}}
            onKeyDown={e=>e.key==="Enter"&&submitChangePw()}
          />
          {changePwErr && <div style={{color:"#ef4444",fontSize:12,fontWeight:"700",marginBottom:8}}>❌ {changePwErr}</div>}
          <div style={{display:"flex",gap:8}}>
            <button style={{...S.btn("#0ea5e9"),flex:1}} onClick={submitChangePw}>עדכן סיסמה</button>
            <button style={{...S.btn("#94a3b8"),flex:1}} onClick={()=>{setChangePwModal(null);setChangePwErr("");}}>ביטול</button>
          </div>
        </div>
      </div>
    );
  }
}
