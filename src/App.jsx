import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

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
  0: [ { id:"morning", label:"בוקר", time:"08:30-16:00", timeFrach:"09:30-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"evening", label:"ערב",   time:"16:00-23:00", timeFrach:"16:00-22:00", slots:{"רוקח":1,"פרח":1} } ],
  1: [ { id:"morning", label:"בוקר", time:"08:30-16:00", timeFrach:"09:30-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"evening", label:"ערב",   time:"16:00-23:00", timeFrach:"16:00-22:00", slots:{"רוקח":1,"פרח":1} } ],
  2: [ { id:"morning", label:"בוקר", time:"08:30-16:00", timeFrach:"09:30-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"evening", label:"ערב",   time:"16:00-23:00", timeFrach:"16:00-22:00", slots:{"רוקח":1,"פרח":1} } ],
  3: [ { id:"morning", label:"בוקר", time:"08:30-16:00", timeFrach:"09:30-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"evening", label:"ערב",   time:"16:00-23:00", timeFrach:"16:00-22:00", slots:{"רוקח":1,"פרח":1} } ],
  4: [ { id:"morning", label:"בוקר", time:"08:30-16:00", timeFrach:"09:30-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"evening", label:"ערב",   time:"16:00-23:00", timeFrach:"16:00-22:00", slots:{"רוקח":1,"פרח":1} } ],
  5: [ { id:"open",    label:"פתיחה", time:"08:00-14:00", timeFrach:"09:30-16:00", slots:{"רוקח":1,"פרח":1} }, { id:"close",  label:"סגירה", time:"11:00-16:00", timeFrach:"11:00-16:00", slots:{"רוקח":1,"פרח":0} } ],
  6: [ { id:"morning", label:"בוקר שבת", time:"10:00-16:30", timeFrach:"10:00-16:30", slots:{"רוקח":1,"פרח":0} }, { id:"evening", label:"ערב שבת",  time:"16:30-23:00", timeFrach:"18:00-23:00", slots:{"רוקח":1,"פרח":1} } ],
};
const SESSION_KEY = "pharmacy_session_v1";
// Returns correct shift time based on role, with optional חריש בעיר override
function getShiftTime(sh, role, customTime) {
  if (customTime) return customTime;
  return role === "פרח" && sh.timeFrach ? sh.timeFrach : sh.time;
}
function saveSession(user) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(user)); } catch {} }
function loadSession() { try { const r = localStorage.getItem(SESSION_KEY); return r ? JSON.parse(r) : null; } catch { return null; } }
function clearSession() { try { localStorage.removeItem(SESSION_KEY); } catch {} }
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
function getSchedulingWeekStart(offsetWeeks = 0) {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - day); // current week's Sunday
  sunday.setHours(0, 0, 0, 0);
  sunday.setDate(sunday.getDate() + offsetWeeks * 7);
  return sunday;
}

function getWeekDates(offsetWeeks = 0) {
  const sunday = getSchedulingWeekStart(offsetWeeks);
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
function autoAssign(employees, availability, fridayRota, assigned, weekDates) {
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
    // emp1 and emp2 are both assigned — open/close decided later in weekly schedule
    [fridayEntry.emp1, fridayEntry.emp2, fridayEntry.open, fridayEntry.close].filter(Boolean).forEach(name => {
      const emp = employees.find(e => e.name === name && e.role === "רוקח");
      if (emp) {
        const cur = getA(friday,"open","רוקח");
        if(!cur.includes(emp.id)) setA(friday,"open","רוקח",[...cur,emp.id]);
      }
    });
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
          // Balance morning/evening FIRST — most important rule
          const ratioA = isMorning ? cA.morning - cA.evening : cA.evening - cA.morning;
          const ratioB = isMorning ? cB.morning - cB.evening : cB.evening - cB.morning;
          if (ratioA !== ratioB) return ratioA - ratioB;
          // Then prioritize those who need more shifts
          const needA = bA.min - cA.total;
          const needB = bB.min - cB.total;
          if (needB !== needA) return needB - needA;
          // Finally balance total shifts
          return cA.total - cB.total;
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
          // Balance morning/evening first
          const ratioA = isMorning ? cA.morning - cA.evening : cA.evening - cA.morning;
          const ratioB = isMorning ? cB.morning - cB.evening : cB.evening - cB.morning;
          if (ratioA !== ratioB) return ratioA - ratioB;
          // Then balance total
          return cA.total - cB.total;
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
  const [view, setView]               = useState("loading");
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
  const [publishedWeekStart, setPublishedWeekStart] = useState(null); // dateKey of published week's Sunday
  const [toast, setToast]             = useState(null);
  const [managerTab, setManagerTab]   = useState("assign");
  const [newEmpName, setNewEmpName]   = useState("");
  const [newEmpRole, setNewEmpRole]   = useState("רוקח");
  const [newEmpPhone, setNewEmpPhone] = useState("");
  const [empNoteInput, setEmpNoteInput] = useState("");
  const [fbLoaded, setFbLoaded] = useState(false);
  const [showAutoConfirm, setShowAutoConfirm] = useState(false);
  const [sendMode, setSendMode] = useState("personal");
  // ברירת מחדל: offset 0 = שבוע נוכחי
  // אם הסידור פורסם לשבוע הבא — מתחיל ב-offset 0 (עובד יראה שבוע נוכחי + אפשרות לשבוע הבא)
  // ברירת מחדל: ראשון–שלישי = שבוע נוכחי (0), רביעי–שבת = שבוע הבא (1)
  const [weekOffset, setWeekOffset] = useState(new Date().getDay() >= 4 ? 1 : 0);
  const [vacations, setVacations] = useState({});
  // Friday rota form state
  const [newRotaDate, setNewRotaDate] = useState("");
  const [newRotaOpen, setNewRotaOpen] = useState("");
  const [newRotaClose, setNewRotaClose] = useState("");
  const [empTab, setEmpTab] = useState("schedule");
  const [showNextWeek, setShowNextWeek] = useState(false);
  const [schedView, setSchedView] = useState("list"); // unused — kept for compatibility
  const [shiftModal, setShiftModal] = useState(null); // {title, date, shiftNote, emps[]}
  // Vacation request form state (employee)
  const [vacType, setVacType] = useState("יום בודד");
  const [vacStart, setVacStart] = useState("");
  const [vacEnd, setVacEnd] = useState("");
  const [vacNote, setVacNote] = useState("");
  const [manualVacEmp, setManualVacEmp] = useState("");
  const [manualVacType, setManualVacType] = useState("יום בודד");
  const [manualVacStart, setManualVacStart] = useState("");
  const [manualVacEnd, setManualVacEnd] = useState("");
  const [manualVacNote, setManualVacNote] = useState("");
  const weekDates = getWeekDates(weekOffset);
  const currentRealWeekDates = getWeekDates(0);
  const nextWeekDates = getWeekDates(1);
  const nextWeekPublished = published;
  const [dayRemarks, setDayRemarks] = useState({}); // dateKey -> ["הורדת מבצע", ...]
  const [shiftNotes, setShiftNotes] = useState({}); // dateKey_shiftId -> string
  const [empShiftNotes, setEmpShiftNotes] = useState({}); // empId_dateKey_shiftId -> string
  const [changePwModal, setChangePwModal] = useState(null); // null | "manager" | empId
  const [changePwOld, setChangePwOld]     = useState("");
  const [changePwNew, setChangePwNew]     = useState("");
  const [changePwNew2, setChangePwNew2]   = useState("");
  const [changePwErr, setChangePwErr]     = useState("");
  const [hoveredEmp, setHoveredEmp] = useState(null);
  const dragRef = useRef(null);
  const lastEmpClickRef = useRef({id:null, time:0, date:null, sh:null});
  const [scheduleChanged, setScheduleChanged] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  // ── Friday Duty System ──
  const [dutyPeriod, setDutyPeriod] = useState(null);     // {start:"DD/MM/YYYY", end:"DD/MM/YYYY", quotas:{empId:n}}
  const [dutyAvail, setDutyAvail] = useState({});          // {empId: {dateStr: true/false}}
  const [dutyAssign, setDutyAssign] = useState([]);        // [{date, emp1, emp2}] — approved
  const [dutyPublished, setDutyPublished] = useState(false);
  const [dutyAvailOpen, setDutyAvailOpen] = useState(false); // employee sees availability form
  const [dutySetupStep, setDutySetupStep] = useState(1);   // 1=setup 2=awaiting 3=assign 4=publish
  const [dutyDraft, setDutyDraft] = useState([]);          // auto-assign draft before approval

  // Enable pinch-to-zoom on the whole page
  useEffect(() => {
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
  }, []);

  useEffect(() => {
    // Load from localStorage as fast fallback while Firebase loads
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
      if (local.publishedWeekStart) setPublishedWeekStart(local.publishedWeekStart);
      if (local.dayRemarks)   setDayRemarks(local.dayRemarks);
      if (local.shiftNotes)   setShiftNotes(local.shiftNotes);
    }
    // Real-time sync with Firebase
    let firstSnapshot = true;
    const unsub = onSnapshot(doc(db, "pharmacy", "schedule"), (snap) => {
      if (!snap.exists()) { setFbLoaded(true); return; }
      const d = snap.data();
      if (d.employees) {
        const hasOldNames = d.employees.some(e => ["פרח 1","פרח 2","פרח 3"].includes(e.name));
        if (!hasOldNames) setEmployees(d.employees);
      }
      if (firstSnapshot) {
        // On first load, merge local availability with Firebase
        const mergedAv = { ...(d.availability||{}), ...(local?.availability||{}) };
        setAvailability(mergedAv);
        firstSnapshot = false;
      } else {
        if (d.availability) setAvailability(d.availability);
      }
      if (d.assigned)     setAssigned(d.assigned);
      if (d.notes)        setNotes(d.notes);
      if (d.empNotes)     setEmpNotes(d.empNotes);
      if (d.empPasswords) setEmpPasswords(d.empPasswords);
      if (d.managerPassword && d.managerPassword !== "harishpharm2025") setManagerPassword(d.managerPassword);
      if (d.fridayRota && d.fridayRota.length > 0) {
        setFridayRota(d.fridayRota);
      } else {
        // Initialize with current friday rota data
        const initialRota = [
          { date:"5.6.2026",  emp1:"ליאן",  emp2:"סלאם" },
          { date:"12.6.2026", emp1:"ליאן",  emp2:"סג'א" },
          { date:"19.6.2026", emp1:"סלאם",  emp2:"סמר"  },
          { date:"26.6.2026", emp1:"סג'א",  emp2:"ליעד" },
          { date:"3.7.2026",  emp1:"סלאם",  emp2:"סמר"  },
          { date:"10.7.2026", emp1:"ליאן",  emp2:"סג'א" },
          { date:"17.7.2026", emp1:"סלאם",  emp2:"סמר"  },
          { date:"24.7.2026", emp1:"ליעד",  emp2:"ליאן" },
          { date:"31.7.2026", emp1:"סמר",   emp2:"סג'א" },
        ];
        setFridayRota(initialRota);
        fbSave({ employees:d.employees||[], availability:d.availability||{}, assigned:d.assigned||{}, notes:d.notes||{}, empNotes:d.empNotes||{}, empPasswords:d.empPasswords||{}, managerPassword:d.managerPassword||MANAGER_PASSWORD_DEFAULT, fridayRota:initialRota, published:d.published||false, dayRemarks:d.dayRemarks||{}, shiftNotes:d.shiftNotes||{}, vacations:d.vacations||[], empShiftNotes:d.empShiftNotes||{} });
      }
      if (d.published)    setPublished(d.published);
      if (d.publishedWeekStart) setPublishedWeekStart(d.publishedWeekStart);
      if (d.dayRemarks)   setDayRemarks(d.dayRemarks);
      if (d.shiftNotes)   setShiftNotes(d.shiftNotes);
      if (d.vacations)    setVacations(d.vacations);
      if (d.empShiftNotes) setEmpShiftNotes(d.empShiftNotes);
      if (d.dutyPeriod)   setDutyPeriod(d.dutyPeriod);
      if (d.dutyAvail)    setDutyAvail(d.dutyAvail);
      if (d.dutyAssign)   setDutyAssign(d.dutyAssign);
      if (d.dutyPublished) setDutyPublished(d.dutyPublished);
      if (d.dutyAvailOpen !== undefined) setDutyAvailOpen(d.dutyAvailOpen);
      if (d.dutySetupStep) setDutySetupStep(d.dutySetupStep);
      setFbLoaded(true);
      // Detect schedule changes since last visit (for employee alert)
      if (d.assigned) {
        const CHANGE_KEY = "pharmacy_last_assigned";
        const lastSeen = localStorage.getItem(CHANGE_KEY);
        const currentHash = JSON.stringify(d.assigned);
        if (lastSeen && lastSeen !== currentHash) {
          setScheduleChanged(true);
        }
        localStorage.setItem(CHANGE_KEY, currentHash);
      }
      // Restore session
      const session = loadSession();
      if (session) {
        if (session.isManager) {
          setCurrentUser(session);
          setView("manager");
        } else {
          // Verify employee still exists
          const emp = (d.employees||INITIAL_EMPLOYEES).find(e=>e.id===session.id);
          if (emp && d.empPasswords?.[emp.id]) {
            setCurrentUser({...emp,...session});
            setEmpNoteInput((d.empNotes||{})[emp.id]||"");
            setView("employee");
          } else {
            setView("login");
          }
        }
      } else {
        setView("login");
      }
    }, () => setFbLoaded(true));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!fbLoaded) return; // Don't save before Firebase data is loaded
    saveData({ employees, availability, assigned, notes, empNotes, empPasswords, managerPassword, fridayRota, published, dayRemarks, shiftNotes, vacations, empShiftNotes, dutyPeriod, dutyAvail, dutyAssign, dutyPublished, dutyAvailOpen, dutySetupStep });
  }, [employees, availability, assigned, notes, empNotes, empPasswords, managerPassword, fridayRota, published, dayRemarks, shiftNotes, vacations, empShiftNotes, dutyPeriod, dutyAvail, dutyAssign, dutyPublished, dutyAvailOpen, dutySetupStep]);

  function showToast(msg, type="ok") { setToast({msg,type}); setTimeout(()=>setToast(null),3000); }

  // ── AUTH ──
  function loginManager() {
    if (pwInput === managerPassword) {
      setCurrentUser({isManager:true});
      saveSession({isManager:true});
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
      saveSession(selectedEmp);
      setEmpNoteInput(empNotes[selectedEmp.id] || "");
      setView("employee");
      setSelectedEmp(null);
    } else {
      if (empPwInput !== empPasswords[selectedEmp.id]) { setEmpPwError("סיסמה שגויה"); return; }
      setCurrentUser(selectedEmp);
      saveSession(selectedEmp);
      setEmpNoteInput(empNotes[selectedEmp.id] || "");
      setView("employee");
      setSelectedEmp(null);
    }
  }

  function loginEmp(emp)  { setCurrentUser(emp); setEmpNoteInput(empNotes[emp.id]||""); setView("employee"); }
  function logout() { clearSession(); setCurrentUser(null); setView("login"); }

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
    const year = yy.length === 2 ? `20${yy}` : yy;
    return `${year}-${mm.padStart(2,"0")}-${dd.padStart(2,"0")}`;
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
  const esnKey = (empId, date, shiftId) => `${empId}_${dateKey(date)}_${shiftId}`;
  function getEmpShiftNote(empId, date, shiftId) { return empShiftNotes[esnKey(empId,date,shiftId)] || ""; }
  function setEmpShiftNote(empId, date, shiftId, val) { setEmpShiftNotes(prev=>({...prev,[esnKey(empId,date,shiftId)]:val})); }

  // ── Friday Duty Helpers ──
  function parseDMY(str) {
    if(!str) return null;
    const sep = str.includes("/") ? "/" : str.includes(".") ? "." : null;
    if(!sep) return null;
    const [d,m,y] = str.split(sep).map(s=>parseInt(s,10));
    return new Date(y<100?y+2000:y, m-1, d);
  }
  function getFridaysInRange(start, end) {
    const fridays = [];
    const d = new Date(start); d.setHours(0,0,0,0);
    while(d <= end) {
      if(d.getDay()===5) fridays.push(new Date(d));
      d.setDate(d.getDate()+1);
    }
    return fridays;
  }
  function dutyDateKey(date) { return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`; }
  function autoAssignDuty(fridays, quotas, avail) {
    const draft = [];
    const counts = {};
    Object.keys(quotas).forEach(id => counts[id]=0);
    const pharmacists = employees.filter(e=>e.role==="רוקח");
    let lastTwo = []; // last two assigned emp ids
    for(const fri of fridays) {
      const dk = dutyDateKey(fri);
      const eligible = pharmacists.filter(e=>{
        const q = quotas[e.id]||0;
        if(counts[e.id]>=q) return false;
        const avl = (avail[e.id]||{})[dk];
        return avl !== false; // default true if not set
      });
      // prefer not consecutive
      const pref = eligible.filter(e=>!lastTwo.includes(e.id));
      const pool = pref.length>=2 ? pref : eligible;
      // pick 2
      const picked = pool.slice(0,2);
      if(picked.length<2 && eligible.length>=2) picked.push(...eligible.filter(e=>!picked.includes(e)).slice(0,2-picked.length));
      const warn = picked.some(e=>lastTwo.includes(e.id));
      draft.push({date:dk, emp1:picked[0]?.name||"?", emp2:picked[1]?.name||"?", warn});
      picked.forEach(e=>{ if(e) counts[e.id]=(counts[e.id]||0)+1; });
      lastTwo = picked.map(e=>e?.id).filter(Boolean);
    }
    return draft;
  }

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

  // empDisplayDates — show next week if nextWeekPublished and showNextWeek, else weekDates
  const empDisplayDates = showNextWeek && nextWeekPublished ? nextWeekDates : weekDates;

  function toggleAssign(date,shiftId,role,empId) {
    const k = aKey(date,shiftId,role);
    const cur = assigned[k]||[];
    const isAdding = !cur.includes(empId);

    if (isAdding) {
      // Remove from other shifts on same day
      const dayShifts = DAY_SHIFTS[date.getDay()]||[];
      const newAssigned = {...assigned};
      dayShifts.forEach(sh => {
        if (sh.id === shiftId) return;
        const otherKey = aKey(date,sh.id,role);
        const otherCur = newAssigned[otherKey]||[];
        if (otherCur.includes(empId)) {
          newAssigned[otherKey] = otherCur.filter(id=>id!==empId);
        }
      });
      newAssigned[k] = [...cur, empId];
      setAssigned(newAssigned);
    } else {
      setAssigned(prev=>({...prev,[k]:cur.filter(id=>id!==empId)}));
    }
  }

  function openShiftModal(title, date, shift, roles) {
    const emps = [];
    roles.forEach(role => {
      const ids = getAssigned(date, shift.id, role);
      ids.forEach(id => {
        const emp = employees.find(e => e.id === id);
        if (!emp) return;
        emps.push({
          id, name: emp.name, role,
          time: getShiftTime(shift, role, getEmpShiftTime(id, date, shift.id)),
          label: shift.id==="open"?"פתיחה":shift.id==="close"?"סגירה":"",
          isMe: id === currentUser?.id,
          note: getEmpShiftNote(id, date, shift.id),
        });
      });
    });
    setShiftModal({ title, date: formatDate(date), shiftNote: getShiftNote(date, shift.id), emps });
  }

  function handleDrop(toDate, toShiftId, toRole, toEmpId) {
    const from = dragRef.current;
    if (!from) return;
    if (from.role !== toRole) return; // רק אותו תפקיד

    const fromKey = aKey(from.date, from.shiftId, from.role);
    const toKey   = aKey(toDate, toShiftId, toRole);
    const fromIds = [...(assigned[fromKey]||[])];
    const toIds   = [...(assigned[toKey]||[])];

    if (toEmpId && toEmpId !== from.empId) {
      // החלפה בין שני עובדים
      const newFrom = fromIds.map(id=>id===from.empId?toEmpId:id);
      const newTo   = toIds.map(id=>id===toEmpId?from.empId:id);
      setAssigned(prev=>({...prev,[fromKey]:newFrom,[toKey]:newTo}));
    } else if (!toEmpId) {
      // העברה לתא ריק
      setAssigned(prev=>({
        ...prev,
        [fromKey]: fromIds.filter(id=>id!==from.empId),
        [toKey]:   [...toIds, from.empId],
      }));
    }
    dragRef.current = null;
    showToast("שיבוץ עודכן ✓");
  }
  function runAutoAssign() {
    const result = autoAssign(employees, availability, fridayRota, assigned, weekDates);
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

  function buildImageHTML() {
    const days = weekDates.map(date=>({
      label: date.toLocaleDateString("he-IL",{weekday:"short"}),
      dateFull: formatDateShort(date),
      dayObj: date,
    }));
    const colW = Math.floor((1536-100)/7); // 1536px total, 100px for label col

    const empBlock = (emp) => {
      const noteHtml = emp.note ? `<div style="font-size:22px;color:#334155;font-style:italic;margin-top:4px;">${emp.note}</div>` : "";
      const labelHtml = emp.label ? ` <span style="font-size:19px;color:#64748b;font-weight:400;">${emp.label}</span>` : "";
      return `<div style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">
        <div style="font-size:30px;font-weight:800;color:#1e293b;">${emp.name}${labelHtml}</div>
        <div style="font-size:22px;color:#475569;margin-top:3px;">${emp.time}</div>
        ${noteHtml}
      </div>`;
    };

    const shiftCell = (emps, shiftNote) => {
      if (!emps.length) return `<td style="border:1px solid #e2e8f0;background:#f8fafc;text-align:center;color:#d1d5db;font-size:28px;vertical-align:middle;">—</td>`;
      let inner = emps.map(e => empBlock(e)).join('');
      if (shiftNote) inner += `<div style="font-size:18px;color:#92400e;background:#fef3c7;margin:4px 8px 6px;padding:5px 8px;border-radius:6px;">📋 ${shiftNote}</div>`;
      return `<td style="border:1px solid #e2e8f0;vertical-align:top;background:#fff;padding:0;">${inner}</td>`;
    };

    let html = `<div style="direction:rtl;font-family:Segoe UI,Tahoma,Arial,sans-serif;background:#fff;">`;

    // Table
    html += `<table style="border-collapse:collapse;width:100%;table-layout:fixed;background:#fff;">`;

    // Header
    html += `<thead><tr>`;
    html += `<th style="width:100px;background:#1D9E75;border:0.5px solid #0F6E56;"></th>`;
    days.forEach(d => {
      html += `<th style="width:${colW}px;background:#1D9E75;color:#fff;border:0.5px solid #0F6E56;padding:16px 8px;text-align:center;">
        <div style="font-size:28px;font-weight:800;">${d.label}</div>
        <div style="font-size:24px;font-weight:700;color:#E1F5EE;margin-top:5px;">${d.dateFull}</div>
      </th>`;
    });
    html += `</tr></thead><tbody>`;

    // Morning row
    html += `<tr>`;
    html += `<td style="background:#f0fdf4;border-right:5px solid #22c55e;border:0.5px solid #e2e8f0;text-align:center;vertical-align:middle;padding:12px 4px;">
      <div style="font-size:36px;">☀️</div>
      <div style="font-size:18px;font-weight:800;color:#15803d;margin-top:6px;">בוקר</div>
    </td>`;
    days.forEach(({dayObj}) => {
      const ds = DAY_SHIFTS[dayObj.getDay()]||[];
      const ms = ds.find(s=>["morning","open"].includes(s.id));
      const cs = ds.find(s=>s.id==="close");
      if (!ms && !cs) { html += `<td style="border:0.5px solid #e2e8f0;background:#f8fafc;text-align:center;color:#d1d5db;font-size:28px;vertical-align:middle;">—</td>`; return; }
      const emps = [
        ...(ms ? getAssigned(dayObj,ms.id,"רוקח").map(id=>({name:employees.find(e=>e.id===id)?.name||"?",time:ms.time,note:getEmpShiftNote(id,dayObj,ms.id)})) : []),
        ...(cs ? getAssigned(dayObj,cs.id,"רוקח").map(id=>({name:employees.find(e=>e.id===id)?.name||"?",time:cs.time,label:"סגירה",note:getEmpShiftNote(id,dayObj,cs.id)})) : []),
        ...(ms ? getAssigned(dayObj,ms.id,"פרח").map(id=>({name:employees.find(e=>e.id===id)?.name||"?",time:getShiftTime(ms,"פרח"),note:getEmpShiftNote(id,dayObj,ms.id)})) : []),
      ];
      html += shiftCell(emps, ms ? getShiftNote(dayObj,ms.id) : "");
    });
    html += `</tr>`;

    // Divider
    html += `<tr><td colspan="8" style="background:#1e293b;height:6px;padding:0;border:none;"></td></tr>`;

    // Evening row
    html += `<tr>`;
    html += `<td style="background:#f5f3ff;border-right:5px solid #6366f1;border:0.5px solid #e2e8f0;text-align:center;vertical-align:middle;padding:12px 4px;">
      <div style="font-size:36px;">🌙</div>
      <div style="font-size:18px;font-weight:800;color:#4338ca;margin-top:6px;">ערב</div>
    </td>`;
    days.forEach(({dayObj}) => {
      const ds = DAY_SHIFTS[dayObj.getDay()]||[];
      const es = ds.find(s=>s.id==="evening");
      if (!es) { html += `<td style="border:0.5px solid #e2e8f0;background:#f8fafc;text-align:center;color:#d1d5db;font-size:28px;vertical-align:middle;">—</td>`; return; }
      const emps = [
        ...getAssigned(dayObj,es.id,"רוקח").map(id=>({name:employees.find(e=>e.id===id)?.name||"?",time:es.time,note:getEmpShiftNote(id,dayObj,es.id)})),
        ...getAssigned(dayObj,es.id,"פרח").map(id=>({name:employees.find(e=>e.id===id)?.name||"?",time:getShiftTime(es,"פרח"),note:getEmpShiftNote(id,dayObj,es.id)})),
      ];
      html += shiftCell(emps, getShiftNote(dayObj,es.id));
    });
    html += `</tr></tbody></table></div>`;
    return html;
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
    const phoneNum = num.startsWith("0") ? `972${num.slice(1)}` : num;
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(text)}`,"_blank");
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
    header: { background:"#1e293b", padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 10px rgba(0,0,0,0.2)" },
    logo:   { fontSize:"16px", fontWeight:"800", color:"#38bdf8", lineHeight:1.3 },
    main:   { maxWidth:900, margin:"0 auto", padding:"16px 12px 80px" },
    card:   { background:"#fff", border:"1px solid #e2e8f0", borderRadius:"14px", padding:"16px", marginBottom:"12px", boxShadow:"0 1px 3px rgba(0,0,0,0.06)" },
    alertCard: { background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:"14px", padding:"14px", marginBottom:"12px" },
    btn:    (bg,fg)=>({ background:bg||"#0ea5e9", color:fg||"#fff", border:"none", borderRadius:"10px", padding:"11px 18px", fontWeight:"700", fontSize:"15px", cursor:"pointer" }),
    btnSm:  (bg,fg)=>({ background:bg||"#64748b", color:fg||"#fff", border:"none", borderRadius:"8px", padding:"5px 12px", fontWeight:"700", fontSize:"13px", cursor:"pointer" }),
    btnOut: (c)=>({ background:"transparent", color:c||"#1e293b", border:`2px solid ${c||"#1e293b"}`, borderRadius:"10px", padding:"10px 16px", fontWeight:"700", fontSize:"14px", cursor:"pointer" }),
    input:  { background:"#f8fafc", border:"1.5px solid #e2e8f0", borderRadius:"10px", padding:"10px 14px", fontSize:"15px", color:"#1e293b", direction:"rtl", boxSizing:"border-box" },
    tab:    (a)=>({ background:a?"#1e293b":"transparent", color:a?"#f8fafc":"#64748b", border:"none", borderRadius:"8px", padding:"8px 10px", fontWeight:"700", fontSize:"14px", cursor:"pointer" }),
    badge:  (role)=>({ background:ROLE_COLORS[role]?.light||"#f1f5f9", color:ROLE_COLORS[role]?.dark||"#334155", border:`1px solid ${ROLE_COLORS[role]?.bg||"#cbd5e1"}`, borderRadius:"20px", padding:"3px 10px", fontSize:"13px", fontWeight:"700", display:"inline-block" }),
    chip:   (a)=>({ border:`2px solid ${a?"#0ea5e9":"#e2e8f0"}`, background:a?"#e0f2fe":"#f8fafc", color:a?"#0369a1":"#64748b", borderRadius:"9px", padding:"8px 14px", fontWeight:"700", fontSize:"13px", cursor:"pointer", userSelect:"none" }),
    empChip:(a,dim)=>({ border:`2px solid ${a?"#22c55e":"#0ea5e9"}`, background:a?"#dcfce7":"#eff6ff", color:a?"#15803d":"#1d4ed8", borderRadius:"9px", padding:"6px 12px", fontWeight:"700", fontSize:"13px", cursor:"pointer", userSelect:"none", opacity:dim?0.35:1 }),
    toast:  (type)=>({ position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)", background:type==="err"?"#ef4444":"#22c55e", color:"#fff", padding:"12px 24px", borderRadius:"12px", fontWeight:"700", fontSize:"15px", zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,0.2)", whiteSpace:"nowrap" }),
    sTitle: { fontWeight:"800", fontSize:"15px", color:"#334155", marginBottom:10 },
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
              <div style={{fontWeight:"800",fontSize:16}}>📅 שבוע {formatDateShort(empDisplayDates[0])} – {formatDateShort(empDisplayDates[6])}</div>
              <div style={{display:"flex",alignItems:"center",gap:4,background:"#f1f5f9",borderRadius:"8px",padding:"3px 6px"}}>
                <button style={{background:"none",border:"none",color:"#1e293b",cursor:"pointer",fontSize:13,fontWeight:"600",padding:"0 4px"}} onClick={()=>setWeekOffset(w=>Math.max(0,w-1))}>הקודם</button>
                <span style={{fontSize:11,color:"#cbd5e1"}}>|</span>
                <button style={{background:"none",border:"none",color:"#1e293b",cursor:"pointer",fontSize:13,fontWeight:"600",padding:"0 4px"}} onClick={()=>setWeekOffset(w=>w+1)}>הבא</button>
              </div>
            </div>
            <div style={{color:"#64748b",fontSize:12,marginTop:3}}>
              {locked
                ? <span style={{color:"#ef4444",fontWeight:"700"}}>⏰ שבוע זה נעול — עבר יום שלישי 12:00</span>
                : <>סמן/י זמינות • <span style={{color:"#0ea5e9",fontWeight:"700"}}>{totalSel} נבחרו</span></>}
            </div>
          </div>

          {/* Tab bar */}
          <div style={{display:"flex",background:"#f1f5f9",borderRadius:"10px",padding:3,gap:3,marginBottom:12}}>
            {published && <button style={{...S.tab(empTab==="schedule"),flex:1,borderRadius:7,fontSize:14}} onClick={()=>setEmpTab("schedule")}>📋 סידור</button>}
            <button style={{...S.tab(empTab==="avail"),flex:1,borderRadius:7,fontSize:14}} onClick={()=>setEmpTab("avail")}>✏️ זמינות</button>
            <button style={{...S.tab(empTab==="vac"),flex:1,borderRadius:7,fontSize:14}} onClick={()=>setEmpTab("vac")}>🌴 חופשה</button>
            {myRole==="רוקח" && (dutyAvailOpen||dutyPublished) && <button style={{...S.tab(empTab==="duty"),flex:1,borderRadius:7,fontSize:14}} onClick={()=>setEmpTab("duty")}>⭐ תורנות</button>}
            <button style={{...S.tab(empTab==="note"),flex:1,borderRadius:7,fontSize:14}} onClick={()=>setEmpTab("note")}>📝 הערה</button>
          </div>


          {/* Mobile schedule — single scrollable table */}
          {empTab==="schedule" && published && (
            <div style={{marginTop:4}}>
              {!showNextWeek && (
                <div style={{fontSize:12,color:"#64748b",marginBottom:8,fontWeight:"500"}}>
                  📅 מציג: {formatDateShort(weekDates[0])} – {formatDateShort(weekDates[6])}
                </div>
              )}
              {/* Change alert banner */}
              {scheduleChanged && !showChangeModal && (
                <div style={{background:"#fffbeb",border:"1.5px solid #fcd34d",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10,cursor:"pointer"}} onClick={()=>{setShowChangeModal(true);setScheduleChanged(false);}}>
                  <div>
                    <div style={{fontSize:15,fontWeight:"700",color:"#92400e"}}>🔔 עדכון לסידור!</div>
                    <div style={{fontSize:13,color:"#b45309",fontWeight:"500",marginTop:2}}>השיבוץ השתנה מאז כניסתך האחרונה</div>
                  </div>
                  <button style={{fontSize:12,color:"#fff",background:"#f59e0b",border:"none",borderRadius:6,padding:"6px 12px",cursor:"pointer",fontWeight:"700",flexShrink:0}}>הצג שינוי</button>
                </div>
              )}

              {weekOffset === 0 && !showNextWeek && nextWeekPublished && (
                <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:10,cursor:"pointer"}} onClick={()=>setShowNextWeek(true)}>
                  <div>
                    <div style={{fontSize:15,fontWeight:"700",color:"#15803d"}}>🎉 הסידור לשבוע הבא מוכן!</div>
                    <div style={{fontSize:13,color:"#16a34a",fontWeight:"500",marginTop:3}}>{formatDateShort(nextWeekDates[0])} – {formatDateShort(nextWeekDates[6])}</div>
                  </div>
                  <button style={{fontSize:12,color:"#15803d",background:"#bbf7d0",border:"1.5px solid #86efac",borderRadius:6,padding:"5px 12px",cursor:"pointer",fontWeight:"600",flexShrink:0}}>הצג ›</button>
                </div>
              )}
              {weekOffset === 0 && !showNextWeek && !nextWeekPublished && (
                <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:8,padding:"10px 14px",marginBottom:10}}>
                  <div style={{fontSize:15,fontWeight:"700",color:"#dc2626",display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                    <span>🙄 הסידור לשבוע הבא עוד לא מוכן —</span>
                    <span style={{fontWeight:"600",fontSize:14,color:"#ef4444"}}>אני על זה!</span>
                  </div>
                </div>
              )}
              {showNextWeek && (
                <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"8px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <span style={{fontSize:13,fontWeight:"600",color:"#15803d"}}>📅 {formatDateShort(nextWeekDates[0])} – {formatDateShort(nextWeekDates[6])}</span>
                  <button style={{fontSize:13,border:"none",background:"none",color:"#64748b",cursor:"pointer",textDecoration:"underline"}} onClick={()=>setShowNextWeek(false)}>‹ חזור ל-{formatDateShort(weekDates[0])}</button>
                </div>
              )}
              <style>{`
                .sched-scroll-wrap { overflow-x:auto; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.08); touch-action:pan-x pan-y pinch-zoom; direction:ltr; }
                @media (orientation: landscape) {
                  .sched-scroll-wrap { overflow-x:visible; }
                  .sched-scroll-wrap table { min-width:unset !important; width:100%; }
                }
              `}</style>
              <div className="sched-scroll-wrap" style={{direction:"ltr"}}>
                <table style={{borderCollapse:"collapse",fontSize:13,minWidth:840,background:"#fff",direction:"rtl",width:"100%"}}>
                  <thead>
                    <tr style={{background:"#1D9E75",color:"#fff"}}>
                      <th style={{padding:"9px 6px",border:"0.5px solid #0F6E56",width:46,textAlign:"center",fontSize:10,fontWeight:"500",position:"sticky",left:0,background:"#1D9E75",zIndex:2}}></th>
                      {empDisplayDates.map(date=>{
                        const midnight=new Date(date); midnight.setHours(23,59,59,0);
                        const isPast=midnight<new Date();
                        return (
                          <th key={dateKey(date)} style={{padding:"9px 6px",border:"0.5px solid #0F6E56",textAlign:"center",opacity:isPast?0.5:1}}>
                            <div style={{fontSize:15,fontWeight:"800"}}>{date.toLocaleDateString("he-IL",{weekday:"short"})}</div>
                            <div style={{fontSize:14,fontWeight:"800",color:"#E1F5EE",marginTop:2}}>{formatDateShort(date)}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {/* הערות יום */}
                    <tr>
                      <td style={{background:"#f8fafc",padding:"3px 6px",borderLeft:"3px solid #1e293b",border:"0.5px solid #e2e8f0",fontSize:9,color:"#475569",textAlign:"center",position:"sticky",left:0,zIndex:1}}>📌</td>
                      {empDisplayDates.map(date=>{
                        const remarks=getRemarks(date);
                        return <td key={dateKey(date)} style={{border:"0.5px solid #e2e8f0",padding:3,background:"#fff",textAlign:"center"}}>
                          {remarks.length>0&&<span style={{display:"inline-block",border:"1.5px solid #7c3aed",borderRadius:4,padding:"1px 4px",fontSize:9,fontWeight:"600",color:"#6d28d9",background:"#ede9fe",width:"100%"}}>{remarks.join(" | ")}</span>}
                        </td>;
                      })}
                    </tr>
                    {/* בוקר */}
                    <tr>
                      <td style={{background:"#f0fdf4",padding:"6px 3px",borderLeft:"3px solid #22c55e",border:"0.5px solid #e2e8f0",textAlign:"center",verticalAlign:"middle",position:"sticky",left:0,zIndex:1}}>
                        <span style={{fontSize:16}}>☀️</span>
                        <span style={{display:"block",fontSize:11,fontWeight:"700",color:"#15803d",marginTop:2}}>בוקר</span>
                      </td>
                      {empDisplayDates.map(date=>{
                        const ds=DAY_SHIFTS[date.getDay()]||[];
                        const ms=ds.find(s=>["morning","open"].includes(s.id));
                        const cs=ds.find(s=>s.id==="close");
                        const midnight=new Date(date); midnight.setHours(23,59,59,0);
                        const isPast=midnight<new Date();
                        if(!ms&&!cs) return <td key={dateKey(date)} style={{border:"0.5px solid #e2e8f0",background:isPast?"#edf0f4":"#f8fafc",textAlign:"center",color:"#d1d5db",fontSize:10}}>—</td>;
                        const allEmps=[
                          ...(ms?getAssigned(date,ms.id,"רוקח").map(id=>({id,sh:ms,role:"רוקח"})):[]),
                          ...(cs?getAssigned(date,cs.id,"רוקח").map(id=>({id,sh:cs,label:"סגירה",role:"רוקח"})):[]),
                          ...(ms?getAssigned(date,ms.id,"פרח").map(id=>({id,sh:ms,role:"פרח"})):[]),
                        ];
                        const shiftNote=ms?getShiftNote(date,ms.id):"";
                        return (
                          <td key={dateKey(date)} style={{border:"0.5px solid #e2e8f0",padding:4,verticalAlign:"top",background:isPast?"#edf0f4":"#fff",cursor:allEmps.length?"pointer":"default"}}
                            onClick={()=>allEmps.length&&ms&&openShiftModal("☀️ משמרת בוקר",date,ms,["רוקח","פרח"])}>
                            {allEmps.map(({id,sh,label,role})=>{
                              const emp=employees.find(e=>e.id===id);
                              const isMe=id===currentUser.id;
                              const n=getEmpShiftNote(id,date,sh.id);
                              const st=getEmpShiftNote(id,date,sh.id+"|st");
                              const en=getEmpShiftNote(id,date,sh.id+"|en");
                              const customTime=st&&en?`${st}-${en}`:null;
                              const isHarish=n&&n.includes("חריש בעיר");
                              return <div key={id} style={{padding:"2px 3px",borderRadius:4,background:isMe?(isPast?"#bfdbfe":"#dbeafe"):isHarish?"#fdf2f4":"transparent",marginBottom:2,opacity:isPast?0.7:1}}>
                                <span style={{fontSize:14,fontWeight:isMe?"800":"700",color:isMe?"#1d4ed8":isHarish?"#8b2a3a":"#1e293b",display:"block"}}>{emp?.name}{isMe?" ⭐":""}</span>
                                <span style={{fontSize:11,color:isHarish?"#8b2a3a":"#334155",fontWeight:isHarish?"700":"600",display:"block",whiteSpace:"nowrap"}}>{customTime||getShiftTime(sh,role)}{label?` ${label}`:""}</span>
                                {n&&<span style={{fontSize:11,color:isHarish?"#8b2a3a":"#334155",fontStyle:"italic",fontWeight:"600",display:"block",borderTop:`0.5px solid ${isHarish?"#f0b8c0":"#e2e8f0"}`,marginTop:1,paddingTop:1,whiteSpace:"nowrap"}}>{n}</span>}
                              </div>;
                            })}
                            {!allEmps.length&&<span style={{color:"#e2e8f0",fontSize:10,display:"block",textAlign:"center"}}>—</span>}
                            {shiftNote&&allEmps.length>0&&<div style={{fontSize:11,color:"#92400e",fontWeight:"600",background:"#fef3c7",borderRadius:3,padding:"1px 3px",marginTop:2}}>{shiftNote}</div>}
                          </td>
                        );
                      })}
                    </tr>
                    {/* פס */}
                    <tr><td colSpan={empDisplayDates.length+1} style={{background:"#1e293b",height:4,padding:0,border:"none"}}></td></tr>
                    {/* ערב */}
                    <tr>
                      <td style={{background:"#f5f3ff",padding:"6px 3px",borderLeft:"3px solid #6366f1",border:"0.5px solid #e2e8f0",textAlign:"center",verticalAlign:"middle",position:"sticky",left:0,zIndex:1}}>
                        <span style={{fontSize:16}}>🌙</span>
                        <span style={{display:"block",fontSize:11,fontWeight:"700",color:"#4338ca",marginTop:2}}>ערב</span>
                      </td>
                      {empDisplayDates.map(date=>{
                        const ds=DAY_SHIFTS[date.getDay()]||[];
                        const es=ds.find(s=>s.id==="evening");
                        const midnight=new Date(date); midnight.setHours(23,59,59,0);
                        const isPast=midnight<new Date();
                        if(!es) return <td key={dateKey(date)} style={{border:"0.5px solid #e2e8f0",background:isPast?"#edf0f4":"#f8fafc",textAlign:"center",color:"#d1d5db",fontSize:10}}>—</td>;
                        const allEmps=[
                          ...getAssigned(date,es.id,"רוקח").map(id=>({id,sh:es,role:"רוקח"})),
                          ...getAssigned(date,es.id,"פרח").map(id=>({id,sh:es,role:"פרח"})),
                        ];
                        const shiftNote=getShiftNote(date,es.id);
                        return (
                          <td key={dateKey(date)} style={{border:"0.5px solid #e2e8f0",padding:4,verticalAlign:"top",background:isPast?"#edf0f4":"#fff",cursor:allEmps.length?"pointer":"default"}}
                            onClick={()=>allEmps.length&&openShiftModal("🌙 משמרת ערב",date,es,["רוקח","פרח"])}>
                            {allEmps.map(({id,sh,role})=>{
                              const emp=employees.find(e=>e.id===id);
                              const isMe=id===currentUser.id;
                              const n=getEmpShiftNote(id,date,sh.id);
                              const st=getEmpShiftNote(id,date,sh.id+"|st");
                              const en=getEmpShiftNote(id,date,sh.id+"|en");
                              const customTime=st&&en?`${st}-${en}`:null;
                              const isHarish=n&&n.includes("חריש בעיר");
                              return <div key={id} style={{padding:"2px 3px",borderRadius:4,background:isMe?(isPast?"#bfdbfe":"#dbeafe"):isHarish?"#fdf2f4":"transparent",marginBottom:2,opacity:isPast?0.7:1}}>
                                <span style={{fontSize:14,fontWeight:isMe?"800":"700",color:isMe?"#1d4ed8":isHarish?"#8b2a3a":"#1e293b",display:"block"}}>{emp?.name}{isMe?" ⭐":""}</span>
                                <span style={{fontSize:11,color:isHarish?"#8b2a3a":"#334155",fontWeight:isHarish?"700":"600",display:"block",whiteSpace:"nowrap"}}>{customTime||getShiftTime(sh,role)}</span>
                                {n&&<span style={{fontSize:11,color:isHarish?"#8b2a3a":"#334155",fontStyle:"italic",fontWeight:"600",display:"block",borderTop:`0.5px solid ${isHarish?"#f0b8c0":"#e2e8f0"}`,marginTop:1,paddingTop:1}}>{n}</span>}
                              </div>;
                            })}
                            {!allEmps.length&&<span style={{color:"#e2e8f0",fontSize:10,display:"block",textAlign:"center"}}>—</span>}
                            {shiftNote&&allEmps.length>0&&<div style={{fontSize:11,color:"#92400e",fontWeight:"600",background:"#fef3c7",borderRadius:3,padding:"1px 3px",marginTop:2}}>{shiftNote}</div>}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
              <div style={{fontSize:12,color:"#64748b",textAlign:"center",marginTop:8}}>לחצי על משמרת לפרטים • סובב לתצוגה מלאה</div>

              {/* Download & Share buttons */}
              <div style={{display:"flex",gap:8,marginTop:10}}>
                <button style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:11,borderRadius:10,border:"none",fontSize:13,fontWeight:"500",cursor:"pointer",background:"#E1F5EE",color:"#085041"}}
                  onClick={async()=>{
                    const {default:h2c} = await import("https://esm.sh/html2canvas@1.4.1");
                    const container = document.createElement("div");
                    container.style.cssText="position:absolute;top:0;left:-9999px;width:1584px;background:#f8fafc;font-family:Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;padding:24px 48px;";
                    container.innerHTML = buildImageHTML();
                    document.body.appendChild(container);
                    await new Promise(r=>setTimeout(r,200));
                    const canvas = await h2c(container,{scale:2,useCORS:true,backgroundColor:"#fff",width:1584,windowWidth:1584});
                    document.body.removeChild(container);
                    const link = document.createElement("a");
                    link.download = `סידור ${formatDateShort(empDisplayDates[0])}-${formatDateShort(empDisplayDates[6])}.png`;
                    link.href = canvas.toDataURL("image/png");
                    link.click();
                    showToast("הסידור נשמר ✓");
                  }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  הורד סידור
                </button>
                <button style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:11,borderRadius:10,border:"none",fontSize:13,fontWeight:"500",cursor:"pointer",background:"#25D366",color:"#fff"}}
                  onClick={async()=>{
                    const {default:h2c} = await import("https://esm.sh/html2canvas@1.4.1");
                    const container = document.createElement("div");
                    container.style.cssText="position:absolute;top:0;left:-9999px;width:1584px;background:#f8fafc;font-family:Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;padding:24px 48px;";
                    container.innerHTML = buildImageHTML();
                    document.body.appendChild(container);
                    await new Promise(r=>setTimeout(r,200));
                    const canvas = await h2c(container,{scale:2,useCORS:true,backgroundColor:"#fff",width:1584,windowWidth:1584});
                    document.body.removeChild(container);
                    canvas.toBlob(async blob=>{
                      const file=new File([blob],"סידור.png",{type:"image/png"});
                      if(navigator.share&&navigator.canShare({files:[file]})){
                        await navigator.share({files:[file],title:"סידור עבודה"});
                      } else {
                        window.open(`https://wa.me/?text=${encodeURIComponent("סידור עבודה "+formatDateShort(empDisplayDates[0])+" - "+formatDateShort(empDisplayDates[6]))}`,"_blank");
                      }
                    });
                  }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.139.564 4.147 1.547 5.889L.057 23.456a.5.5 0 0 0 .614.614l5.694-1.49A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.374l-.36-.213-3.723.975.993-3.63-.234-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
                  שתף
                </button>
              </div>

              {/* ── רשימת המשמרות שלי ── */}
              {(()=>{
                const MOOD_EMOJIS = ["😏","😌","☺️","😃","😇","🤩","🥳"];
                const myShiftList = [];
                weekDates.forEach(date=>{
                  (DAY_SHIFTS[date.getDay()]||[]).forEach(sh=>{
                    if(getAssigned(date,sh.id,myRole).includes(currentUser.id)){
                      const shiftLabel = ["morning","open"].includes(sh.id)?"בוקר":sh.id==="close"?"סגירה":"ערב";
                      const shiftIcon  = ["morning","open"].includes(sh.id)?"☀️":"🌙";
                      myShiftList.push({date,sh,shiftLabel,shiftIcon});
                    }
                  });
                });
                const total = myShiftList.length;
                const now = new Date();
                const doneSoFar = myShiftList.filter(({date,sh})=>{
                  const endH=(sh.time.split("-")[1]?.split(":").map(Number)||[23])[0];
                  const endDate=new Date(date); endDate.setHours(endH,0,0,0);
                  return endDate<now;
                }).length;
                const ENCOURAGEMENTS = {
                  0:["השבוע עוד לא התחיל... הקפה מוכן? ☕"],
                  1:["משמרת אחת — כבר התחלת! הכי קשה זה להתחיל 💪"],
                  2:["שתיים מאחוריך — קדימה! 💨"],
                  3:["חצי דרך — את/ה עושה את זה! 💪","שלוש! הכי קשה מאחוריך 🙌","3 מ-5, לא רע בכלל 😎"],
                  4:["עוד אחת ואת/ה שם! 🏁","ארבע! המשמרת האחרונה מחכה לך 👊","אפשר לראות את הסוף","אחת נשארה — היא לא מפחידה אותך 😤"],
                  5:["סיימת! שבוע מושלם, כל הכבוד! 🎉","עשית את זה! אלופ/ה! 💊","שבוע שלם מאחוריך — מגיע/ה לך מנוחה 🛋️","5 מתוך 5 — מקצוען/ית! ⭐"],
                };
                const encPool=ENCOURAGEMENTS[Math.min(doneSoFar,5)]||ENCOURAGEMENTS[5];
                const weekSeed=weekDates[0]?.getDate()||0;
                const encourage=encPool[weekSeed%encPool.length];
                const moodIdx=total>0?Math.round((doneSoFar/total)*(MOOD_EMOJIS.length-1)):0;
                const moodEmoji=total>0?MOOD_EMOJIS[moodIdx]:"😏";
                if(!total) return null;
                return (
                  <div style={{marginTop:16}}>
                    {/* Shift cards */}
                    <div style={{fontWeight:"700",fontSize:16,color:"#334155",marginBottom:10}}>⭐ המשמרות שלי</div>
                    {myShiftList.map(({date,sh,shiftLabel,shiftIcon},i)=>{
                      const endDate=new Date(date); const [endH]=(sh.time.split("-")[1]?.split(":").map(Number)||[23]); endDate.setHours(endH,0,0,0);
                      const startDate=new Date(date); const [startH]=sh.time.split(":").map(Number); startDate.setHours(startH,0,0,0);
                      const isDone=endDate<now;
                      const isToday=now>=startDate&&now<=endDate;
                      const empNote=getEmpShiftNote(currentUser.id,date,sh.id);
                      return (
                        <div key={i} style={{...S.card,opacity:isDone?0.6:1,border:isDone?"1.5px solid #22c55e":isToday?"1.5px solid #378ADD":"1px solid #e2e8f0",marginBottom:8,display:"flex",alignItems:"center",gap:12,background:isDone?"#f0fdf4":"#fff"}}>
                          <div style={{width:42,height:42,borderRadius:10,background:isDone?"#dcfce7":["morning","open"].includes(sh.id)?"#FAEEDA":"#EEEDFE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:isDone?26:22,flexShrink:0}}>{isDone?"✓":shiftIcon}</div>
                          <div style={{flex:1}}>
                            <div style={{fontSize:15,fontWeight:"700",color:isDone?"#15803d":"#1e293b"}}>{date.toLocaleDateString("he-IL",{weekday:"long"})} — {shiftLabel}</div>
                            <div style={{fontSize:13,color:isDone?"#16a34a":"#475569",fontWeight:"500",marginTop:2}}>{getShiftTime(sh, myRole)}</div>
                            {empNote&&<div style={{fontSize:11,color:"#64748b",fontStyle:"italic",marginTop:2}}>{empNote}</div>}
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                            <span style={{fontSize:18}}>{MOOD_EMOJIS[Math.round((i/(Math.max(total-1,1)))*(MOOD_EMOJIS.length-1))]}</span>
                            <span style={{fontSize:12,padding:"3px 9px",borderRadius:20,fontWeight:"700",background:isDone?"#dcfce7":isToday?"#E6F1FB":"#f1f5f9",color:isDone?"#15803d":isToday?"#185FA5":"#94a3b8",border:isDone?"1.5px solid #22c55e":"none"}}>
                              {isDone?"✓ הסתיים":isToday?"היום":"בקרוב"}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Progress bar */}
                    <div style={{...S.card,background:"#f8fafc",marginTop:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
                        <div style={{fontSize:40,lineHeight:1,flexShrink:0}}>{moodEmoji}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:15,fontWeight:"600",color:"#1e293b",marginBottom:6}}>{encourage}</div>
                          <div style={{height:10,background:"#e2e8f0",borderRadius:5,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${(doneSoFar/total)*100}%`,background:"#1D9E75",borderRadius:4,transition:"width 0.5s ease"}}></div>
                          </div>
                          <div style={{fontSize:13,color:"#475569",fontWeight:"500",marginTop:4}}>{doneSoFar} מתוך {total} הושלמו</div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        {myShiftList.map(({date,sh},i)=>{
                          const endDate=new Date(date); const [endH]=(sh.time.split("-")[1]?.split(":").map(Number)||[23]); endDate.setHours(endH,0,0,0);
                          const startDate=new Date(date); const [startH]=sh.time.split(":").map(Number); startDate.setHours(startH,0,0,0);
                          const isDone=endDate<now;
                          const isToday=now>=startDate&&now<=endDate;
                          return [
                            <div key={`d${i}`} style={{width:28,height:28,borderRadius:"50%",background:isDone?"#1D9E75":isToday?"#378ADD":"#fff",border:`1.5px solid ${isDone?"#1D9E75":isToday?"#378ADD":"#e2e8f0"}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:isDone?11:10,color:isDone||isToday?"#fff":"#94a3b8"}}>
                              {isDone?"✓":isToday?"⏰":date.toLocaleDateString("he-IL",{weekday:"narrow"})}
                            </div>,
                            i<myShiftList.length-1&&<div key={`l${i}`} style={{flex:1,height:2,background:isDone?"#1D9E75":"#e2e8f0",borderRadius:1}}></div>
                          ];
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          {(empTab==="avail" || !published) && (
          <div>
          {/* Availability selection — weekly grid */}
          <div style={S.card}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:420,tableLayout:"fixed"}}>
                <thead>
                  <tr>
                    <th style={{background:"#f8fafc",padding:"8px 10px",border:"0.5px solid #e2e8f0",fontWeight:"600",textAlign:"right",width:90,color:"#475569",fontSize:12}}></th>
                    {weekDates.map(date=>{
                      const shifts=(DAY_SHIFTS[date.getDay()]||[]).filter(sh=>(sh.slots[myRole]||0)>0);
                      if(!shifts.length) return null;
                      return (
                        <th key={dateKey(date)} style={{background:"#f8fafc",padding:"8px 4px",border:"0.5px solid #e2e8f0",textAlign:"center",color:"#1e293b"}}>
                          <div style={{fontSize:15,fontWeight:"800"}}>{date.toLocaleDateString("he-IL",{weekday:"short"})}</div>
                          <div style={{fontSize:12,color:"#475569",fontWeight:"600",marginTop:1}}>{formatDateShort(date)}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {[{id:"morning",label:"בוקר"},{id:"evening",label:"ערב"},{id:"open",label:"פתיחה"},{id:"close",label:"סגירה"}].map(shType=>{
                    const hasShift = weekDates.some(date=>(DAY_SHIFTS[date.getDay()]||[]).some(sh=>sh.id===shType.id&&(sh.slots[myRole]||0)>0));
                    if(!hasShift) return null;
                    const timeStr = (()=>{
                      const d = weekDates.find(d=>(DAY_SHIFTS[d.getDay()]||[]).find(s=>s.id===shType.id&&(s.slots[myRole]||0)>0));
                      if(!d) return "";
                      return (DAY_SHIFTS[d.getDay()]||[]).find(s=>s.id===shType.id)?.time||"";
                    })();
                    return (
                      <tr key={shType.id}>
                        <td style={{padding:"8px 10px",border:"0.5px solid #e2e8f0",background:"#f8fafc",textAlign:"right"}}>
                          <div style={{fontWeight:"600",fontSize:13,color:"#334155"}}>{shType.label}</div>
                          <div style={{fontSize:10,color:"#94a3b8",marginTop:1}}>{timeStr}</div>
                        </td>
                        {weekDates.map(date=>{
                          const shift=(DAY_SHIFTS[date.getDay()]||[]).find(sh=>sh.id===shType.id&&(sh.slots[myRole]||0)>0);
                          if(!shift) return <td key={dateKey(date)} style={{padding:"6px 4px",border:"0.5px solid #e2e8f0",background:"#f8fafc",textAlign:"center",color:"#d1d5db",fontSize:12}}>—</td>;
                          const onVac=isOnVacation(currentUser.id,date);
                          if(onVac) return <td key={dateKey(date)} style={{padding:"6px 4px",border:"0.5px solid #e2e8f0",textAlign:"center",background:"#d1fae5",fontSize:13}}>🌴</td>;
                          const active=isAv(currentUser.id,date,shift.id);
                          const isBlue=shift.id==="morning"||shift.id==="open";
                          return (
                            <td key={dateKey(date)} style={{padding:"5px 4px",border:"0.5px solid #e2e8f0",textAlign:"center"}}>
                              <button
                                onClick={()=>!locked&&toggleAv(date,shift.id)}
                                disabled={locked&&!active}
                                style={{
                                  width:"100%",padding:"8px 4px",borderRadius:"8px",fontSize:13,fontWeight:"600",
                                  cursor:locked&&!active?"default":"pointer",
                                  border:`1.5px ${active?"solid":"dashed"} ${active?"#0ea5e9":"#cbd5e1"}`,
                                  background:active?"#0ea5e9":"transparent",
                                  color:active?"#fff":"#94a3b8",
                                  transition:"all 0.15s",
                                }}>
                                {active?"✓":"+"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          </div>)} {/* end avail tab */}

          {/* Vacation tab */}
          {empTab==="vac" && (
          <div>

          {/* Vacation board - all approved */}
          {(()=>{
            const today = new Date(); today.setHours(0,0,0,0);
            const parseDate = str => {
              if(!str) return null;
              const sep = str.includes("/") ? "/" : str.includes(".") ? "." : null;
              if(!sep) return null;
              const [d,m,y] = str.split(sep).map(s=>parseInt(s,10));
              return new Date(y<100?y+2000:y, m-1, d);
            };
            const all = [];
            employees.forEach(emp => {
              (vacations[emp.id]||[]).filter(v=>v.status==="approved").forEach(v => {
                const endDate = parseDate(v.type==="יום בודד" ? v.start : (v.end||v.start));
                if(endDate && endDate < today) return;
                const startDate = parseDate(v.start);
                all.push({emp, v, startDate});
              });
            });
            all.sort((a,b)=>(a.startDate||0)-(b.startDate||0));
            if(!all.length) return null;
            return <div style={S.card}>
              <div style={S.sTitle}>📅 לוח חופשות — כל הצוות</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {all.map(({emp,v,startDate})=>{
                  const isNow = startDate && startDate <= today;
                  const isMe = emp.id===currentUser.id;
                  return <div key={`${emp.id}_${v.id}`} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,background:isMe?"#eff6ff":isNow?"#f0fdf4":"#f8fafc",border:`1px solid ${isMe?"#93c5fd":isNow?"#86efac":"#e2e8f0"}`}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:"700",color:isMe?"#1d4ed8":"#1e293b"}}>{emp.name}{isMe?" (אני)":""}</div>
                      <div style={{fontSize:12,color:"#64748b",marginTop:2}}>{v.type==="יום בודד"?v.start:`${v.start} – ${v.end}`}</div>
                    </div>
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:12,fontWeight:"700",background:isNow?"#dcfce7":"#e0f2fe",color:isNow?"#15803d":"#0369a1"}}>{isNow?"⏳ עכשיו":"🔜 בקרוב"}</span>
                  </div>;
                })}
              </div>
            </div>;
          })()}

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
                <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>{vacType==="יום בודד"?"תאריך":"מתאריך"} (DD/MM/YYYY)</div>
                <input
                  type="text"
                  placeholder="05/07/2026"
                  maxLength={10}
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
                  <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>עד תאריך (DD/MM/YYYY)</div>
                  <input
                    type="text"
                    placeholder="08/07/2026"
                    maxLength={10}
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

          </div>)} {/* end vac tab */}

          {/* Duty tab - Friday availability and published schedule */}
          {empTab==="duty" && myRole==="רוקח" && (()=>{
            const fridays = dutyPeriod ? getFridaysInRange(parseDMY(dutyPeriod.start), parseDMY(dutyPeriod.end)) : [];
            const myDuties = dutyPublished ? dutyAssign.filter(r=>r.emp1===currentUser.name||r.emp2===currentUser.name) : [];
            return <div>
              {/* Availability form - open only when not published */}
              {dutyAvailOpen && !dutyPublished && <div style={S.card}>
                <div style={S.sTitle}>⭐ סמן/י זמינות לתורנות שישי</div>
                <div style={{fontSize:12,color:"#1D9E75",background:"#f0fdf4",border:"1px solid #86efac",borderRadius:7,padding:"7px 10px",marginBottom:12}}>
                  ✓ כברירת מחדל את/ה זמין/ה לכל ימי השישי — הורד/י סימון מתאריך שאינך פנוי/ה
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {fridays.map(f=>{
                    const dk=dutyDateKey(f);
                    const val=(dutyAvail[currentUser.id]||{})[dk];
                    const isAvail = val!==false;
                    return <div key={dk} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 12px",borderRadius:9,border:"1px solid #e2e8f0",background:"#f8fafc"}}>
                      <div style={{fontSize:14,fontWeight:"700",color:"#1e293b",flex:1}}>שישי {dk}</div>
                      <button onClick={()=>setDutyAvail(prev=>({...prev,[currentUser.id]:{...(prev[currentUser.id]||{}),[dk]:!isAvail}}))}
                        style={{width:42,height:42,borderRadius:9,border:`2px solid ${isAvail?"#22c55e":"#e2e8f0"}`,background:isAvail?"#dcfce7":"#f1f5f9",fontSize:20,cursor:"pointer",color:isAvail?"#15803d":"#cbd5e1"}}>
                        ✓
                      </button>
                    </div>;
                  })}
                </div>
                <button style={{...S.btn("#1D9E75"),width:"100%",marginTop:12}} onClick={()=>showToast("זמינות נשמרה ✓")}>שמור זמינות</button>
              </div>}

              {/* Published duties list */}
              {dutyPublished && <div style={S.card}>
                <div style={S.sTitle}>⭐ תורנויות שישי — פורסם</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {dutyAssign.map((row,i)=>{
                    const isMe=row.emp1===currentUser.name||row.emp2===currentUser.name;
                    return <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:isMe?"#ede9fe":"#f8fafc",border:`${isMe?"1.5px solid #a78bfa":"1px solid #e2e8f0"}`}}>
                      <div style={{fontSize:14,fontWeight:"700",color:isMe?"#6d28d9":"#475569",minWidth:60}}>{row.date}</div>
                      <div style={{flex:1,fontSize:14}}>
                        {isMe?<><span style={{fontWeight:"800",color:"#6d28d9"}}>{currentUser.name} ⭐</span><span style={{color:"#475569"}}> • {row.emp1===currentUser.name?row.emp2:row.emp1}</span></>
                          :<span style={{color:"#475569"}}>{row.emp1} • {row.emp2}</span>}
                      </div>
                      {isMe && <span style={{fontSize:11,padding:"2px 8px",borderRadius:12,background:"#c4b5fd",color:"#4c1d95",fontWeight:"700"}}>אני בתורנות</span>}
                    </div>;
                  })}
                </div>
                <div style={{fontSize:11,color:"#7c3aed",textAlign:"center",padding:"6px",background:"#ede9fe",borderRadius:8,marginTop:10}}>🔒 נעול — לשינויים פנה/י למנהלת</div>
              </div>}

              {!dutyAvailOpen && !dutyPublished && <div style={{fontSize:13,color:"#94a3b8",textAlign:"center",padding:"30px 0"}}>תורנות שישי טרם נפתחה לסימון זמינות</div>}
            </div>;
          })()}

          {/* Note tab */}
          {empTab==="note" && (
          <div>
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

          </div>)} {/* end note tab */}

          <div style={{textAlign:"center",color:"#94a3b8",fontSize:11,marginTop:4}}>נשמר אוטומטית</div>
          {empTab !== "schedule" && (
            <button style={{...S.btn("#22c55e"),width:"100%",marginTop:12,padding:14,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
              onClick={()=>showToast("הזמינות נשלחה למנהלת ✓")}>
              ✅ שלח
            </button>
          )}
        </div>
        {changePwModal && <ChangePwModal />}
        {showChangeModal && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setShowChangeModal(false);}}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"20px 20px 36px",width:"100%",maxWidth:480}}>
              <div style={{width:40,height:4,background:"#e2e8f0",borderRadius:2,margin:"0 auto 16px"}}></div>
              <div style={{fontSize:18,fontWeight:"700",color:"#1e293b",marginBottom:4}}>🔔 עדכון לסידור</div>
              <div style={{fontSize:13,color:"#64748b",marginBottom:16}}>השיבוץ עודכן מאז כניסתך האחרונה</div>
              <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:10,padding:"12px 14px",marginBottom:10}}>
                <div style={{fontSize:14,fontWeight:"600",color:"#92400e",marginBottom:4}}>💡 מה השתנה?</div>
                <div style={{fontSize:13,color:"#78350f"}}>הסידור עודכן — עיין/י בטבלה לראות את השיבוץ הנוכחי.</div>
              </div>
              <button style={{width:"100%",padding:13,border:"none",borderRadius:12,background:"#1D9E75",color:"#fff",fontSize:15,fontWeight:"700",cursor:"pointer"}} onClick={()=>setShowChangeModal(false)}>הבנתי, הצג סידור</button>
            </div>
          </div>
        )}
        {shiftModal && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>{if(e.target===e.currentTarget)setShiftModal(null);}}>
            <div style={{background:"#fff",borderRadius:"20px 20px 0 0",padding:"20px 20px 36px",width:"100%",maxWidth:480,animation:"slideUp 0.22s ease"}}>
              <style>{`@keyframes slideUp{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
              <div style={{width:40,height:4,background:"#e2e8f0",borderRadius:2,margin:"0 auto 16px"}}></div>
              <div style={{fontSize:17,fontWeight:"700",color:"#1e293b",marginBottom:2}}>{shiftModal.title}</div>
              <div style={{fontSize:12,color:"#64748b",marginBottom:14}}>{shiftModal.date}</div>
              {shiftModal.shiftNote && (
                <div style={{background:"#fef3c7",border:"1px solid #f59e0b",borderRadius:8,padding:"8px 12px",marginBottom:14,fontSize:12,color:"#92400e",display:"flex",gap:8}}>
                  <span style={{fontSize:15,flexShrink:0}}>📋</span>
                  <div><div style={{fontSize:10,fontWeight:"600",color:"#b45309",marginBottom:2}}>הערה למשמרת</div>{shiftModal.shiftNote}</div>
                </div>
              )}
              {shiftModal.emps.map((emp,i)=>(
                <div key={i} style={{border:emp.isMe?"1.5px solid #3b82f6":"0.5px solid #e2e8f0",borderRadius:10,padding:"10px 12px",marginBottom:8,background:emp.isMe?"#f0f7ff":"#fff"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <span style={{fontSize:14,fontWeight:"600",color:emp.isMe?"#1d4ed8":"#1e293b"}}>{emp.name}{emp.isMe?" ⭐":""}</span>
                    <span style={{fontSize:11,padding:"2px 7px",borderRadius:20,fontWeight:"500",background:emp.role==="פרח"?"#f3e8ff":"#e0f2fe",color:emp.role==="פרח"?"#7e22ce":"#0369a1"}}>{emp.role}</span>
                  </div>
                  <div style={{fontSize:12,color:"#64748b",marginBottom:4}}>🕐 {emp.time}{emp.label?` (${emp.label})`:""}</div>
                  {emp.note && (
                    <div style={{background:"#eff6ff",borderRadius:6,padding:"5px 8px",fontSize:11,color:"#1d4ed8",display:"flex",gap:6}}>
                      <span style={{flexShrink:0}}>✏️</span>
                      <div><div style={{fontSize:10,fontWeight:"600",marginBottom:1}}>הערה אישית</div>{emp.note}</div>
                    </div>
                  )}
                </div>
              ))}
              <button style={{width:"100%",padding:13,border:"none",borderRadius:12,background:"#1e293b",color:"#fff",fontSize:14,fontWeight:"500",cursor:"pointer",marginTop:6}} onClick={()=>setShiftModal(null)}>סגור</button>
            </div>
          </div>
        )}        {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
      </div>
    );
  }

  // ════════════ MANAGER ════════════
  const missing = getMissingSlots();
  const tabs = [["simulation","📊 סימולציה"],["assign","✏️ שיבוץ"],["publish","📤 פרסום"],["notes","📝 הערות"],["feedback","💡 משוב"],["vacations","🌴 חופשות"],["duty","⭐ תורנות שישי"],["settings","⚙️ הגדרות"]];

  return (
    <div style={S.app}>
      <style>{`
        [data-empid].emp-hov button.emp-assigned { background: #16a34a !important; border-color: #14532d !important; color: #fff !important; font-weight: 800 !important; }
        [data-empid].emp-hov button.emp-avail { background: #2563eb !important; border-color: #1e3a8a !important; color: #fff !important; font-weight: 800 !important; }
        .emp-hovering [data-empid]:not(.emp-hov) button.emp-nonavail { display: none !important; }
      `}</style>
      <div style={S.header}>
        <div style={S.logo}>{APP_NAME} — מנהל/ת</div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {/* Week navigation */}
          <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.1)",borderRadius:"8px",padding:"3px 8px",direction:"rtl"}}>
            <button style={{background:"none",border:"none",color:"#f8fafc",cursor:"pointer",fontSize:16,padding:"0 4px"}} onClick={()=>setWeekOffset(w=>w-1)}>הקודם</button>
            <span style={{fontSize:11,color:"#94a3b8",minWidth:110,textAlign:"center"}}>
              {formatDateShort(weekDates[0])} – {formatDateShort(weekDates[6])}
            </span>
            <button style={{background:"none",border:"none",color:"#f8fafc",cursor:"pointer",fontSize:16,padding:"0 4px"}} onClick={()=>setWeekOffset(w=>w+1)}>הבא</button>
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
                    const vacEndKey = parseDDMMYY(vac.end) || vac.end;
                    const returnDate = (() => { try { const d = new Date(vacEndKey); d.setDate(d.getDate()+1); return d.toLocaleDateString("he-IL",{day:"numeric",month:"numeric"}); } catch { return vac.end; } })();
                    return (
                      <div key={emp.id} style={{fontSize:13,color:"#166534",marginBottom:4,display:"flex",justifyContent:"space-between"}}>
                        <span><strong>{emp.name}</strong> בחופשה {vac.start !== vac.end ? `${vac.start} עד ${vac.end}` : vac.end}</span>
                        <span style={{fontSize:11,color:"#15803d"}}>חוזר/ת {returnDate}</span>
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

            {/* Weekly table — scrollable with emp highlight */}
            <style>{`
              .sim-emp { padding:2px 3px; border-radius:4px; margin-bottom:2px; cursor:pointer; transition:all 0.12s; }
              .sim-emp.hov { background:#dbeafe !important; outline:1.5px solid #3b82f6; }
              .sim-emp.hov .sim-name { color:#1d4ed8 !important; font-weight:700 !important; }
              .sim-emp.dim { opacity:0.18; }
              .sim-scroll { overflow-x:auto; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.08); touch-action:pan-x pan-y pinch-zoom; direction:ltr; }
            `}</style>
            <div style={{fontSize:11,color:"#64748b",marginBottom:6,display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"0.5px solid #e2e8f0",borderRadius:8,padding:"6px 10px"}}>
              <span style={{fontSize:13}}>👆</span>
              <span>לחצי על שם להדגשת כל משמרותיו/ה</span>
              {hoveredEmp && <button style={{marginRight:"auto",padding:"2px 8px",border:"0.5px solid #e2e8f0",borderRadius:6,background:"#fff",fontSize:11,color:"#64748b",cursor:"pointer"}} onClick={()=>setHoveredEmp(null)}>ניקוי</button>}
            </div>
            <div className="sim-scroll" style={{direction:"ltr"}}>
              <table style={{borderCollapse:"collapse",fontSize:13,minWidth:520,background:"#fff",direction:"rtl"}}>
                <thead>
                  <tr style={{background:"#1D9E75",color:"#fff"}}>
                    <th style={{padding:"9px 6px",border:"0.5px solid #0F6E56",width:46,textAlign:"center",fontSize:10,fontWeight:"500",position:"sticky",left:0,background:"#1D9E75",zIndex:2}}></th>
                    {weekDates.map(date=>(
                      <th key={dateKey(date)} style={{padding:"9px 6px",border:"0.5px solid #0F6E56",textAlign:"center"}}>
                        <div style={{fontSize:15,fontWeight:"800"}}>{date.toLocaleDateString("he-IL",{weekday:"short"})}</div>
                        <div style={{fontSize:14,fontWeight:"800",color:"#E1F5EE",marginTop:2}}>{formatDateShort(date)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* הערות יום */}
                  <tr>
                    <td style={{background:"#f8fafc",padding:"3px 6px",borderLeft:"3px solid #1e293b",border:"0.5px solid #e2e8f0",fontSize:9,color:"#475569",textAlign:"center",position:"sticky",left:0,zIndex:1}}>📌</td>
                    {weekDates.map(date=>{
                      const remarks=getRemarks(date);
                      return <td key={dateKey(date)} style={{border:"0.5px solid #e2e8f0",padding:3,background:"#fff",textAlign:"center"}}>
                        {remarks.length>0&&<span style={{display:"inline-block",border:"1.5px solid #7c3aed",borderRadius:4,padding:"1px 4px",fontSize:9,fontWeight:"600",color:"#6d28d9",background:"#ede9fe",width:"100%"}}>{remarks.join(" | ")}</span>}
                      </td>;
                    })}
                  </tr>
                  {/* בוקר */}
                  <tr>
                    <td style={{background:"#f0fdf4",padding:"6px 3px",borderLeft:"3px solid #22c55e",border:"0.5px solid #e2e8f0",textAlign:"center",verticalAlign:"middle",position:"sticky",left:0,zIndex:1}}>
                      <span style={{fontSize:16}}>☀️</span>
                      <span style={{display:"block",fontSize:11,fontWeight:"700",color:"#15803d",marginTop:2}}>בוקר</span>
                    </td>
                    {weekDates.map(date=>{
                      const ds=DAY_SHIFTS[date.getDay()]||[];
                      const ms=ds.find(s=>["morning","open"].includes(s.id));
                      const cs=ds.find(s=>s.id==="close");
                      if(!ms&&!cs) return <td key={dateKey(date)} style={{border:"0.5px solid #e2e8f0",background:"#f8fafc",textAlign:"center",color:"#d1d5db",fontSize:10}}>—</td>;
                      const allEmps=[
                        ...(ms?getAssigned(date,ms.id,"רוקח").map(id=>({id,sh:ms})):[]),
                        ...(cs?getAssigned(date,cs.id,"רוקח").map(id=>({id,sh:cs,label:"סגירה"})):[]),
                        ...(ms?getAssigned(date,ms.id,"פרח").map(id=>({id,sh:ms})):[]),
                      ];
                      const note=ms?getShiftNote(date,ms.id):"";
                      return <td key={dateKey(date)} style={{border:"0.5px solid #e2e8f0",padding:4,verticalAlign:"top",background:"#fff",minWidth:100}}>
                        {allEmps.map(({id,sh,label},i)=>{
                          const emp=employees.find(e=>e.id===id);
                          const isHov=hoveredEmp===id;
                          const n=getEmpShiftNote(id,date,sh.id);
                          return <div key={id}>
                            {i>0&&allEmps[i-1].sh.id!==sh.id&&<div style={{height:1,background:"#e2e8f0",margin:"2px 0"}}></div>}
                            <div className={`sim-emp${isHov?" hov":hoveredEmp?" dim":""}`}
                              onClick={()=>{
                                const now=Date.now();
                                const last=lastEmpClickRef.current;
                                if(last.id===id && now-last.time<400) {
                                  // double click — open shift modal
                                  openShiftModal("☀️ משמרת בוקר",date,sh,["רוקח","פרח"]);
                                  lastEmpClickRef.current={id:null,time:0};
                                } else {
                                  // single click — highlight
                                  setHoveredEmp(hoveredEmp===id?null:id);
                                  lastEmpClickRef.current={id,time:now};
                                }
                              }}>
                              <span className="sim-name" style={{fontSize:14,fontWeight:"700",color:n&&n.includes("חריש בעיר")?"#8b2a3a":"#1e293b",display:"block"}}>{emp?.name}</span>
                              <span style={{fontSize:11,color:n&&n.includes("חריש בעיר")?"#8b2a3a":"#334155",fontWeight:n&&n.includes("חריש בעיר")?"700":"600",display:"block",whiteSpace:"nowrap"}}>{getShiftTime(sh,emp?.role||"רוקח")}{label?` ${label}`:""}</span>
                              {n&&<span style={{fontSize:11,color:n.includes("חריש בעיר")?"#8b2a3a":"#334155",fontStyle:"italic",fontWeight:"600",display:"block",borderTop:`0.5px solid ${n.includes("חריש בעיר")?"#f0b8c0":"#e2e8f0"}`,marginTop:1,paddingTop:1}}>{n}</span>}
                            </div>
                          </div>;
                        })}
                        {!allEmps.length&&<span style={{color:"#e2e8f0",fontSize:10,display:"block",textAlign:"center"}}>—</span>}
                        {note&&<div style={{fontSize:11,color:"#92400e",fontWeight:"600",background:"#fef3c7",borderRadius:3,padding:"1px 3px",marginTop:2}}>{note}</div>}
                      </td>;
                    })}
                  </tr>
                  {/* פס */}
                  <tr><td colSpan={weekDates.length+1} style={{background:"#1e293b",height:4,padding:0,border:"none"}}></td></tr>
                  {/* ערב */}
                  <tr>
                    <td style={{background:"#f5f3ff",padding:"6px 3px",borderLeft:"3px solid #6366f1",border:"0.5px solid #e2e8f0",textAlign:"center",verticalAlign:"middle",position:"sticky",left:0,zIndex:1}}>
                      <span style={{fontSize:16}}>🌙</span>
                      <span style={{display:"block",fontSize:11,fontWeight:"700",color:"#4338ca",marginTop:2}}>ערב</span>
                    </td>
                    {weekDates.map(date=>{
                      const ds=DAY_SHIFTS[date.getDay()]||[];
                      const es=ds.find(s=>s.id==="evening");
                      if(!es) return <td key={dateKey(date)} style={{border:"0.5px solid #e2e8f0",background:"#f8fafc",textAlign:"center",color:"#d1d5db",fontSize:10}}>—</td>;
                      const allEmps=[
                        ...getAssigned(date,es.id,"רוקח").map(id=>({id,sh:es})),
                        ...getAssigned(date,es.id,"פרח").map(id=>({id,sh:es})),
                      ];
                      const note=getShiftNote(date,es.id);
                      return <td key={dateKey(date)} style={{border:"0.5px solid #e2e8f0",padding:4,verticalAlign:"top",background:"#fff",minWidth:100}}>
                        {allEmps.map(({id,sh},i)=>{
                          const emp=employees.find(e=>e.id===id);
                          const isHov=hoveredEmp===id;
                          const n=getEmpShiftNote(id,date,sh.id);
                          return <div key={id}>
                            {i>0&&<div style={{height:1,background:"#e2e8f0",margin:"2px 0"}}></div>}
                            <div className={`sim-emp${isHov?" hov":hoveredEmp?" dim":""}`}
                              onClick={()=>{
                                const now=Date.now();
                                const last=lastEmpClickRef.current;
                                if(last.id===id && now-last.time<400) {
                                  openShiftModal("🌙 משמרת ערב",date,sh,["רוקח","פרח"]);
                                  lastEmpClickRef.current={id:null,time:0};
                                } else {
                                  setHoveredEmp(hoveredEmp===id?null:id);
                                  lastEmpClickRef.current={id,time:now};
                                }
                              }}>
                              <span className="sim-name" style={{fontSize:14,fontWeight:"700",color:n&&n.includes("חריש בעיר")?"#8b2a3a":"#1e293b",display:"block"}}>{emp?.name}</span>
                              <span style={{fontSize:11,color:n&&n.includes("חריש בעיר")?"#8b2a3a":"#334155",fontWeight:n&&n.includes("חריש בעיר")?"700":"600",display:"block",whiteSpace:"nowrap"}}>{getShiftTime(sh,emp?.role||"רוקח")}</span>
                              {n&&<span style={{fontSize:11,color:n.includes("חריש בעיר")?"#8b2a3a":"#334155",fontStyle:"italic",fontWeight:"600",display:"block",borderTop:`0.5px solid ${n.includes("חריש בעיר")?"#f0b8c0":"#e2e8f0"}`,marginTop:1,paddingTop:1}}>{n}</span>}
                            </div>
                          </div>;
                        })}
                        {!allEmps.length&&<span style={{color:"#e2e8f0",fontSize:10,display:"block",textAlign:"center"}}>—</span>}
                        {note&&<div style={{fontSize:11,color:"#92400e",fontWeight:"600",background:"#fef3c7",borderRadius:3,padding:"1px 3px",marginTop:2}}>{note}</div>}
                      </td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Download & Share */}
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:11,borderRadius:10,border:"none",fontSize:13,fontWeight:"500",cursor:"pointer",background:"#E1F5EE",color:"#085041"}}
                onClick={async()=>{
                  const {default:h2c} = await import("https://esm.sh/html2canvas@1.4.1");
                  const container = document.createElement("div");
                  container.style.cssText="position:absolute;top:0;left:-9999px;width:1584px;background:#f8fafc;font-family:Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;padding:24px 48px;";
                  container.innerHTML = buildImageHTML();
                  document.body.appendChild(container);
                  await new Promise(r=>setTimeout(r,200));
                  const canvas = await h2c(container,{scale:2,useCORS:true,backgroundColor:"#fff",width:1584,windowWidth:1584});
                  document.body.removeChild(container);
                  const link = document.createElement("a");
                  link.download = `סידור ${formatDateShort(weekDates[0])}-${formatDateShort(weekDates[6])}.png`;
                  link.href = canvas.toDataURL("image/png");
                  link.click();
                  showToast("הסידור נשמר ✓");
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                הורד סידור
              </button>
              <button style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:11,borderRadius:10,border:"none",fontSize:13,fontWeight:"500",cursor:"pointer",background:"#25D366",color:"#fff"}}
                onClick={async()=>{
                  const {default:h2c} = await import("https://esm.sh/html2canvas@1.4.1");
                  const container = document.createElement("div");
                  container.style.cssText="position:absolute;top:0;left:-9999px;width:1584px;background:#f8fafc;font-family:Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;padding:24px 48px;";
                  container.innerHTML = buildImageHTML();
                  document.body.appendChild(container);
                  await new Promise(r=>setTimeout(r,200));
                  const canvas = await h2c(container,{scale:2,useCORS:true,backgroundColor:"#fff",width:1584,windowWidth:1584});
                  document.body.removeChild(container);
                  canvas.toBlob(async blob=>{
                    const file=new File([blob],"סידור.png",{type:"image/png"});
                    if(navigator.share&&navigator.canShare({files:[file]})){
                      await navigator.share({files:[file],title:"סידור עבודה"});
                    } else {
                      window.open(`https://wa.me/?text=${encodeURIComponent("סידור עבודה "+formatDateShort(weekDates[0])+" - "+formatDateShort(weekDates[6]))}`,"_blank");
                    }
                  });
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.139.564 4.147 1.547 5.889L.057 23.456a.5.5 0 0 0 .614.614l5.694-1.49A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.374l-.36-.213-3.723.975.993-3.63-.234-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
                שתף
              </button>
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

            {/* Weekly assignment grid */}
            <div style={{overflowX:"auto",marginBottom:12}}>
              <table id="assign-table" style={{width:"100%",borderCollapse:"collapse",fontSize:12,background:"#fff",borderRadius:12,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.08)",minWidth:500}}>
                <thead>
                  <tr style={{background:"#1e293b",color:"#f8fafc"}}>
                    <th style={{padding:"8px",textAlign:"right",fontWeight:"600",minWidth:80,fontSize:11,border:"0.5px solid #0F6E56"}}>משמרת</th>
                    {weekDates.map(date=>(
                      <th key={dateKey(date)} style={{padding:"8px 4px",textAlign:"center",fontWeight:"600",minWidth:80}}>
                        <div style={{fontSize:11}}>{date.toLocaleDateString("he-IL",{weekday:"short"})}</div>
                        <div style={{fontSize:10,opacity:0.7}}>{formatDateShort(date)}</div>
                        {isFirstOfMonth(date)&&<div style={{fontSize:9,color:"#fbbf24"}}>🔒</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {rowId:"morning", label:"בוקר", matchIds:["morning","open"]},
                    {rowId:"evening", label:"ערב",  matchIds:["evening","close"]},
                  ].map((group,gi)=>(
                    ROLES.map((role,ri)=>(
                      <tr key={`${group.rowId}_${role}`} style={{background:(gi*2+ri)%2===0?"#f8fafc":"#fff",borderBottom:"1px solid #e2e8f0"}}>
                        <td style={{padding:"6px 8px",fontWeight:"700",color:ROLE_COLORS[role]?.dark,whiteSpace:"nowrap",fontSize:11,borderLeft:"3px solid "+ROLE_COLORS[role]?.bg}}>
                          {group.label}<br/><span style={S.badge(role)}>{role}</span>
                        </td>
                        {weekDates.map(date=>{
                          const shift=(DAY_SHIFTS[date.getDay()]||[]).find(s=>group.matchIds.includes(s.id)&&(s.slots[role]||0)>0);
                          if(!shift) return <td key={dateKey(date)} style={{padding:"6px 4px",textAlign:"center",color:"#e2e8f0",background:"#f8fafc"}}>—</td>;
                          const assignedIds=getAssigned(date,shift.id,role);
                          const avail=employees.filter(e=>e.role===role&&isAv(e.id,date,shift.id));
                          const nonAvail=employees.filter(e=>e.role===role&&!isAv(e.id,date,shift.id)&&!assignedIds.includes(e.id));
                          const filled=assignedIds.length;
                          const needed=shift.slots[role]||1;
                          const isMissing=filled<needed;
                          return (
                            <td key={dateKey(date)} style={{padding:"4px",textAlign:"center",background:isMissing?"#fef2f2":"inherit",verticalAlign:"top",minWidth:80}}>
                              {/* Shift note */}
                              {getShiftNote(date,shift.id)&&<div style={{fontSize:9,color:"#92400e",background:"#fef3c7",borderRadius:3,padding:"1px 3px",marginBottom:2}}>💬</div>}
                              {/* Missing indicator */}
                              {isMissing&&<div style={{fontSize:9,color:"#ef4444",fontWeight:"700",marginBottom:2}}>⚠️ חסר</div>}
                              {/* Assigned employees */}
                              <div style={{display:"flex",flexDirection:"column",gap:2,marginBottom:2}}>
                                {assignedIds.map(id=>{
                                  const emp=employees.find(e=>e.id===id);
                                  return (
                                    <div key={id} data-empid={id}
                                      onMouseEnter={()=>{
                                        document.querySelectorAll(`[data-empid="${id}"]`).forEach(el=>el.classList.add("emp-hov"));
                                        document.getElementById("assign-table")?.classList.add("emp-hovering");
                                      }}
                                      onMouseLeave={()=>{
                                        document.querySelectorAll(`[data-empid="${id}"]`).forEach(el=>el.classList.remove("emp-hov"));
                                        document.getElementById("assign-table")?.classList.remove("emp-hovering");
                                      }}>
                                      <button
                                        draggable
                                        onDragStart={()=>{ dragRef.current={empId:id,date,shiftId:shift.id,role}; }}
                                        onDragEnd={()=>{ dragRef.current=null; }}
                                        onDragOver={e=>e.preventDefault()}
                                        onDrop={e=>{ e.preventDefault(); handleDrop(date,shift.id,role,id); }}
                                        className="emp-btn emp-assigned"
                                        onClick={()=>toggleAssign(date,shift.id,role,id)}
                                        style={{borderRadius:"6px",padding:"3px 5px",fontSize:11,fontWeight:"700",color:"#14532d",cursor:"grab",width:"100%",transition:"all 0.15s",background:"#dcfce7",border:"2px solid #22c55e"}}>
                                        ✓ {emp?.name}
                                      </button>
                                      <input
                                        style={{width:"100%",fontSize:9,padding:"2px 4px",border:"1px solid #e2e8f0",borderRadius:4,color:"#475569",background:"#f8fafc",marginTop:1,boxSizing:"border-box"}}
                                        placeholder="הערה לעובד..."
                                        value={getEmpShiftNote(id,date,shift.id)}
                                        onChange={e=>setEmpShiftNote(id,date,shift.id,e.target.value)}
                                        onClick={e=>e.stopPropagation()}
                                      />
                                      {/* Time override - two inputs with auto HH:MM */}
                                      <div style={{display:"flex",alignItems:"center",gap:2,marginTop:2}} onClick={e=>e.stopPropagation()}>
                                        <input
                                          style={{flex:1,fontSize:9,padding:"2px 3px",border:"1px solid #c7d2fe",borderRadius:4,color:"#1e293b",background:"#eef2ff",textAlign:"center",fontWeight:"600",direction:"ltr",boxSizing:"border-box"}}
                                          placeholder="08:30"
                                          maxLength={5}
                                          value={(getEmpShiftNote(id,date,shift.id+"|st"))||""}
                                          onChange={e=>{
                                            let v=e.target.value.replace(/[^0-9:]/g,"");
                                            if(v.length===4&&!v.includes(":")) v=v.slice(0,2)+":"+v.slice(2);
                                            setEmpShiftNote(id,date,shift.id+"|st",v);
                                          }}
                                        />
                                        <span style={{fontSize:9,color:"#94a3b8"}}>—</span>
                                        <input
                                          style={{flex:1,fontSize:9,padding:"2px 3px",border:"1px solid #c7d2fe",borderRadius:4,color:"#1e293b",background:"#eef2ff",textAlign:"center",fontWeight:"600",direction:"ltr",boxSizing:"border-box"}}
                                          placeholder="16:00"
                                          maxLength={5}
                                          value={(getEmpShiftNote(id,date,shift.id+"|en"))||""}
                                          onChange={e=>{
                                            let v=e.target.value.replace(/[^0-9:]/g,"");
                                            if(v.length===4&&!v.includes(":")) v=v.slice(0,2)+":"+v.slice(2);
                                            setEmpShiftNote(id,date,shift.id+"|en",v);
                                          }}
                                        />
                                      </div>

                                    </div>
                                  );
                                })}
                              </div>
                              {/* Available to assign */}
                              <div style={{display:"flex",flexDirection:"column",gap:2}}
                                onDragOver={e=>e.preventDefault()}
                                onDrop={e=>{ e.preventDefault(); handleDrop(date,shift.id,role,null); }}>
                                {avail.filter(e=>!assignedIds.includes(e.id)).map(emp=>(
                                  <div key={emp.id} data-empid={emp.id}
                                    onMouseEnter={()=>{
                                      document.querySelectorAll(`[data-empid="${emp.id}"]`).forEach(el=>el.classList.add("emp-hov"));
                                      document.getElementById("assign-table")?.classList.add("emp-hovering");
                                    }}
                                    onMouseLeave={()=>{
                                      document.querySelectorAll(`[data-empid="${emp.id}"]`).forEach(el=>el.classList.remove("emp-hov"));
                                      document.getElementById("assign-table")?.classList.remove("emp-hovering");
                                    }}>
                                    <button
                                      onDragOver={e=>e.preventDefault()}
                                      onDrop={e=>{ e.preventDefault(); handleDrop(date,shift.id,role,emp.id); }}
                                      className="emp-btn emp-avail"
                                      onClick={()=>toggleAssign(date,shift.id,role,emp.id)}
                                      style={{borderRadius:"6px",padding:"3px 5px",fontSize:10,fontWeight:"500",color:"#1e40af",cursor:"pointer",width:"100%",transition:"all 0.15s",background:"#dbeafe",border:"1px dashed #3b82f6"}}>
                                      + {emp.name}
                                    </button>
                                  </div>
                                ))}
                                {nonAvail.map(emp=>(
                                  <div key={emp.id}
                                    onDragOver={e=>e.preventDefault()}
                                    onDrop={e=>{ e.preventDefault(); handleDrop(date,shift.id,role,emp.id); }}>
                                    <button
                                      className="emp-btn emp-nonavail"
                                      onClick={()=>{const k=avKey(emp.id,date,shift.id);setAvailability(prev=>({...prev,[k]:true}));showToast(`${emp.name} סומן/ה כזמינ/ה ✓`);}}
                                      style={{borderRadius:"6px",padding:"2px 4px",fontSize:10,color:"#94a3b8",cursor:"pointer",width:"100%",transition:"all 0.15s",background:"transparent",border:"1px dashed #cbd5e1",opacity:0.6}}>
                                      {emp.name}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>

            {/* Shift notes row */}
            <div style={S.card}>
              <div style={S.sTitle}>💬 הערות משמרת + סימונים יומיים</div>
              {weekDates.map(date=>(
                <div key={dateKey(date)} style={{marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:"700",color:"#475569",marginBottom:5}}>
                    {date.toLocaleDateString("he-IL",{weekday:"short",day:"numeric",month:"numeric"})}
                    {isFirstOfMonth(date)&&<span style={{color:"#b45309",marginRight:6}}>🔒 סגירת סמים</span>}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:5}}>
                    {REMARK_OPTIONS.map(remark=>{
                      const active=getRemarks(date).includes(remark);
                      return <button key={remark} style={{border:`1.5px solid ${active?"#f59e0b":"#e2e8f0"}`,background:active?"#fef3c7":"#f8fafc",color:active?"#92400e":"#94a3b8",borderRadius:"6px",padding:"3px 8px",fontSize:11,cursor:"pointer"}} onClick={()=>toggleRemark(date,remark)}>{active?"📌 ":"+ "}{remark}</button>;
                    })}
                  </div>
                  {(DAY_SHIFTS[date.getDay()]||[]).map(shift=>(
                    <input key={shift.id}
                      style={{...S.input,width:"100%",fontSize:11,padding:"5px 8px",boxSizing:"border-box",marginBottom:4,border:`1px solid ${getShiftNote(date,shift.id)?"#f59e0b":"#e2e8f0"}`}}
                      placeholder={`הערה למשמרת ${shift.label}...`}
                      value={getShiftNote(date,shift.id)}
                      onChange={e=>setShiftNote(date,shift.id,e.target.value)}
                    />
                  ))}
                </div>
              ))}
            </div>
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
                <button style={{...S.btn(published?"#22c55e":"#0ea5e9"),padding:12,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",gap:6}} onClick={()=>{
                  setPublished(true);
                  const pubWeekStart = dateKey(weekDates[0]);
                  setPublishedWeekStart(pubWeekStart);
                  getDoc(doc(db,"pharmacy","schedule")).then(snap=>{
                    const data = snap.exists() ? snap.data() : {};
                    setDoc(doc(db,"pharmacy","schedule"), {...data, published: true, publishedWeekStart: pubWeekStart}, {merge:true});
                  }).catch(()=>{});
                  showToast("פורסם ✓");
                }}>
                  {published?"✓ פורסם באפליקציה":"✅ פרסם באפליקציה לעובדים"}
                </button>
                {/* Download & Share image */}
                <div style={{display:"flex",gap:8}}>
                  <button style={{flex:1,...S.btn("#085041"),padding:12,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}
                    onClick={async()=>{
                      const {default:h2c} = await import("https://esm.sh/html2canvas@1.4.1");
                      const wrap = document.getElementById("mgr-sched-capture");
                      if(!wrap){showToast("גלול לסימולציה תחילה","err");return;}
                      const container = document.createElement("div");
                      container.style.cssText="position:absolute;top:0;left:-9999px;width:1584px;background:#f8fafc;font-family:Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;padding:24px 48px;";
                      container.innerHTML = buildImageHTML();
                      document.body.appendChild(container);
                      await new Promise(r=>setTimeout(r,200));
                      const canvas = await h2c(container,{scale:2,useCORS:true,backgroundColor:"#fff",width:1584,windowWidth:1584});
                      document.body.removeChild(container);
                      const link = document.createElement("a");
                      link.download = `סידור ${formatDateShort(weekDates[0])}-${formatDateShort(weekDates[6])}.png`;
                      link.href = canvas.toDataURL("image/png");
                      link.click();
                      showToast("הסידור נשמר כתמונה ✓");
                    }}>
                    ⬇️ הורד סידור
                  </button>
                  <button style={{flex:1,...S.btn("#25D366"),padding:12,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}
                    onClick={async()=>{
                      const {default:h2c} = await import("https://esm.sh/html2canvas@1.4.1");
                      const container = document.createElement("div");
                      container.style.cssText="position:absolute;top:0;left:-9999px;width:1584px;background:#f8fafc;font-family:Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;padding:24px 48px;";
                      container.innerHTML = buildImageHTML();
                      document.body.appendChild(container);
                      await new Promise(r=>setTimeout(r,200));
                      const canvas = await h2c(container,{scale:2,useCORS:true,backgroundColor:"#fff",width:1584,windowWidth:1584});
                      document.body.removeChild(container);
                      canvas.toBlob(async blob=>{
                        const file = new File([blob],"סידור.png",{type:"image/png"});
                        if(navigator.share&&navigator.canShare({files:[file]})){
                          await navigator.share({files:[file],title:"סידור עבודה"});
                        } else {
                          window.open(`https://wa.me/?text=${encodeURIComponent("סידור עבודה "+formatDateShort(weekDates[0])+" - "+formatDateShort(weekDates[6]))}`,"_blank");
                        }
                        showToast("נשלח לווצאפ ✓");
                      });
                    }}>
                    📲 שתף
                  </button>
                </div>
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
            {/* הוספה ידנית */}
            <div style={{...S.card, marginBottom:16}}>
              <div style={S.sTitle}>➕ הוסף חופשה ידנית</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <select style={{...S.input,width:"100%"}}
                  value={manualVacEmp} onChange={e=>setManualVacEmp(e.target.value)}>
                  <option value="">בחר/י עובד/ת</option>
                  {employees.map(emp=><option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>)}
                </select>
                <div style={{display:"flex",gap:8}}>
                  {["יום בודד","טווח תאריכים"].map(t=>(
                    <button key={t} style={{...S.chip(manualVacType===t),flex:1,textAlign:"center"}} onClick={()=>setManualVacType(t)}>{t}</button>
                  ))}
                </div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <div style={{flex:1,minWidth:120}}>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>{manualVacType==="יום בודד"?"תאריך":"מתאריך"} (DD/MM/YYYY)</div>
                    <input style={{...S.input,width:"100%",boxSizing:"border-box"}} placeholder="05/07/2026" maxLength={10}
                      value={manualVacStart} onChange={e=>{
                        let v=e.target.value.replace(/[^0-9/]/g,"");
                        if(v.length===2&&!v.includes("/")) v=v+"/";
                        if(v.length===5&&v.split("/").length===2) v=v+"/";
                        setManualVacStart(v);
                      }}/>
                  </div>
                  {manualVacType==="טווח תאריכים" && (
                    <div style={{flex:1,minWidth:120}}>
                      <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>עד תאריך (DD/MM/YYYY)</div>
                      <input style={{...S.input,width:"100%",boxSizing:"border-box"}} placeholder="08/07/2026" maxLength={10}
                        value={manualVacEnd} onChange={e=>{
                          let v=e.target.value.replace(/[^0-9/]/g,"");
                          if(v.length===2&&!v.includes("/")) v=v+"/";
                          if(v.length===5&&v.split("/").length===2) v=v+"/";
                          setManualVacEnd(v);
                        }}/>
                    </div>
                  )}
                </div>
                <input style={{...S.input,width:"100%",boxSizing:"border-box"}} placeholder="הערה (אופציונלי)"
                  value={manualVacNote} onChange={e=>setManualVacNote(e.target.value)}/>
                <button style={{...S.btn("#22c55e"),width:"100%"}} onClick={()=>{
                  if(!manualVacEmp||!manualVacStart){showToast("נא לבחור עובד ותאריך","err");return;}
                  const end = manualVacType==="יום בודד"?manualVacStart:manualVacEnd||manualVacStart;
                  const req = {id:Date.now(),start:manualVacStart,end,type:manualVacType,note:manualVacNote,status:"approved"};
                  const empId = Number(manualVacEmp);
                  const updated = {...vacations,[empId]:[...(vacations[empId]||[]),req]};
                  setVacations(updated);
                  fbSave({employees,availability,assigned,notes,empNotes,empPasswords,managerPassword,fridayRota,published,dayRemarks,shiftNotes,vacations:updated,empShiftNotes});
                  setManualVacEmp(""); setManualVacStart(""); setManualVacEnd(""); setManualVacNote("");
                  showToast("חופשה נוספה ✓");
                }}>+ הוסף חופשה מאושרת</button>
              </div>
            </div>

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

            {/* Approved vacations board - chronological, no past */}
            <div style={{fontWeight:"800",fontSize:14,margin:"16px 0 10px"}}>✅ לוח חופשות מאושרות</div>
            {(()=>{
              const today = new Date(); today.setHours(0,0,0,0);
              const parseDate = str => {
                if(!str) return null;
                // Try splitting by / or . — format: D/M/YYYY or D.M.YYYY
                const sep = str.includes("/") ? "/" : str.includes(".") ? "." : null;
                if(!sep) return null;
                const parts = str.split(sep).map(s=>parseInt(s,10));
                if(parts.length!==3 || parts.some(isNaN)) return null;
                const [d,m,y] = parts;
                const year = y < 100 ? y + 2000 : y;
                return new Date(year, m-1, d);
              };
              // Collect all approved vacations flat
              const all = [];
              employees.forEach(emp => {
                (vacations[emp.id]||[]).filter(v=>v.status==="approved").forEach(v => {
                  const endDate = parseDate(v.type==="יום בודד" ? v.start : (v.end||v.start));
                  if(endDate && endDate < today) return; // skip past
                  const startDate = parseDate(v.start);
                  all.push({emp, v, startDate, endDate});
                });
              });
              // Sort chronologically
              all.sort((a,b) => (a.startDate||0) - (b.startDate||0));
              if(!all.length) return <div style={{fontSize:13,color:"#94a3b8",padding:"12px 0"}}>אין חופשות מאושרות קרובות</div>;
              return all.map(({emp, v, startDate, endDate}) => {
                const isNow = startDate && startDate <= today;
                return (
                  <div key={`${emp.id}_${v.id}`} style={{...S.card, marginBottom:8, border:`1.5px solid ${isNow?"#86efac":"#e2e8f0"}`, background:isNow?"#f0fdf4":"#fff"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <span style={{fontWeight:"700",fontSize:14}}>{emp.name}</span>
                        <span style={{...S.badge(emp.role),marginRight:6,marginLeft:6}}>{emp.role}</span>
                        {isNow && <span style={{fontSize:11,background:"#dcfce7",color:"#15803d",padding:"2px 7px",borderRadius:12,fontWeight:"700"}}>⏳ עכשיו</span>}
                        {!isNow && <span style={{fontSize:11,background:"#e0f2fe",color:"#0369a1",padding:"2px 7px",borderRadius:12,fontWeight:"700"}}>🔜 בקרוב</span>}
                      </div>
                      <button style={S.btnSm("#ef4444")} onClick={()=>setVacations(prev=>({...prev,[emp.id]:(prev[emp.id]||[]).filter(x=>x.id!==v.id)}))}>✕</button>
                    </div>
                    <div style={{fontSize:13,color:"#475569",marginTop:6}}>
                      📅 {v.type==="יום בודד"?v.start:`${v.start} – ${v.end}`} <span style={{color:"#94a3b8"}}>({v.type})</span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ── FRIDAY DUTY TAB ── */}
        {managerTab==="duty" && (()=>{
          const fridays = dutyPeriod ? getFridaysInRange(parseDMY(dutyPeriod.start), parseDMY(dutyPeriod.end)) : [];
          const pharmacists = employees.filter(e=>e.role==="רוקח");

          return <div>
            {/* Step tabs */}
            <div style={{display:"flex",gap:4,marginBottom:14,overflowX:"auto"}}>
              {[["1","הגדרה"],["2","זמינויות"],["3","שיבוץ"],["4","פרסום"]].map(([n,label])=>(
                <button key={n} style={{...S.tab(dutySetupStep===parseInt(n)),flexShrink:0,padding:"8px 14px"}} onClick={()=>setDutySetupStep(parseInt(n))}>{n}. {label}</button>
              ))}
            </div>

            {/* Step 1: Setup */}
            {dutySetupStep===1 && <div>
              <div style={S.card}>
                <div style={S.sTitle}>📅 טווח תאריכים לתורנות שישי</div>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <input style={{...S.input,flex:1}} placeholder="התחלה DD/MM/YYYY" value={dutyPeriod?.start||""} onChange={e=>setDutyPeriod(p=>({...p||{},start:e.target.value}))}/>
                  <input style={{...S.input,flex:1}} placeholder="סיום DD/MM/YYYY" value={dutyPeriod?.end||""} onChange={e=>setDutyPeriod(p=>({...p||{},start:p?.start||"",end:e.target.value,quotas:p?.quotas||{}}))}/>
                </div>
                {fridays.length>0 && <div style={{fontSize:13,color:"#1D9E75",fontWeight:"600",marginBottom:14}}>✓ {fridays.length} ימי שישי • {fridays.length*2} משמרות סה"כ</div>}
              </div>
              {fridays.length>0 && <div style={S.card}>
                <div style={S.sTitle}>מכסה לכל רוקח (סה"כ נדרש: {fridays.length*2})</div>
                {pharmacists.map(emp=>(
                  <div key={emp.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:"0.5px solid #f1f5f9"}}>
                    <span style={{fontSize:14,fontWeight:"600"}}>{emp.name}</span>
                    <input type="number" min="0" max={fridays.length*2}
                      style={{width:60,fontSize:14,padding:"4px 8px",border:"1.5px solid #e2e8f0",borderRadius:8,textAlign:"center",fontWeight:"700"}}
                      value={(dutyPeriod?.quotas||{})[emp.id]||0}
                      onChange={e=>setDutyPeriod(p=>({...p,quotas:{...(p?.quotas||{}),[emp.id]:parseInt(e.target.value)||0}}))}
                    />
                  </div>
                ))}
                <div style={{fontSize:12,color:"#64748b",marginTop:8}}>
                  מוקצה: {Object.values(dutyPeriod?.quotas||{}).reduce((a,b)=>a+b,0)} / {fridays.length*2}
                </div>
                <button style={{...S.btn("#1D9E75"),width:"100%",marginTop:12}}
                  onClick={()=>{ setDutyAvailOpen(true); setDutySetupStep(2); fbSave({employees,availability,assigned,notes,empNotes,empPasswords,managerPassword,fridayRota,published,dayRemarks,shiftNotes,vacations,empShiftNotes,dutyPeriod,dutyAvail,dutyAssign,dutyPublished,dutyAvailOpen:true,dutySetupStep:2}); showToast("נשלח לרוקחים ✓"); }}>
                  ➤ שלח לרוקחים לסמן זמינות
                </button>
              </div>}
            </div>}

            {/* Step 2: View availabilities */}
            {dutySetupStep===2 && <div>
              <div style={S.card}>
                <div style={S.sTitle}>זמינויות שהתקבלו</div>
                {fridays.length===0 && <div style={{color:"#94a3b8",fontSize:13}}>הגדר תקופה קודם</div>}
                <div style={{overflowX:"auto"}}>
                  <table style={{borderCollapse:"collapse",fontSize:13,minWidth:400}}>
                    <thead>
                      <tr style={{background:"#1D9E75",color:"#fff"}}>
                        <th style={{padding:"8px 10px",border:"0.5px solid #0F6E56",textAlign:"right"}}>רוקח</th>
                        {fridays.map(f=><th key={dutyDateKey(f)} style={{padding:"8px 6px",border:"0.5px solid #0F6E56",textAlign:"center",fontSize:11}}>{dutyDateKey(f)}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {pharmacists.map(emp=>(
                        <tr key={emp.id}>
                          <td style={{padding:"7px 10px",fontWeight:"700",border:"0.5px solid #e2e8f0"}}>{emp.name}</td>
                          {fridays.map(f=>{
                            const dk=dutyDateKey(f);
                            const val=(dutyAvail[emp.id]||{})[dk];
                            return <td key={dk} style={{border:"0.5px solid #e2e8f0",textAlign:"center",background:val===false?"#fee2e2":val===true?"#dcfce7":"#f8fafc",fontSize:13,fontWeight:"600",color:val===false?"#dc2626":val===true?"#15803d":"#94a3b8"}}>
                              {val===false?"✗":val===true?"✓":"—"}
                            </td>;
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button style={{...S.btn("#7c3aed"),width:"100%",marginTop:12}}
                  onClick={()=>{ const draft=autoAssignDuty(fridays,dutyPeriod?.quotas||{},dutyAvail); setDutyDraft(draft); setDutySetupStep(3); }}>
                  ⚡ צור שיבוץ אוטומטי
                </button>
              </div>
            </div>}

            {/* Step 3: Review & approve */}
            {dutySetupStep===3 && <div>
              <div style={S.card}>
                <div style={S.sTitle}>שיבוץ לאישורך</div>
                <div style={{fontSize:12,color:"#64748b",marginBottom:12}}>לחצי על שם לבחירה • פתיחה/סגירה תיקבע בסידור השבועי</div>
                {(dutyDraft.length?dutyDraft:dutyAssign).map((row,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:`1px solid ${row.warn?"#fdba74":"#e2e8f0"}`,background:row.warn?"#fff7ed":"#fff",marginBottom:6}}>
                    <div style={{fontSize:14,fontWeight:"700",color:row.warn?"#92400e":"#475569",minWidth:60}}>{row.date}</div>
                    <span style={{fontSize:14,fontWeight:"700",color:"#1e293b",cursor:"pointer",padding:"2px 6px",borderRadius:5}} onClick={()=>{}}>{row.emp1||"—"}</span>
                    <span style={{color:"#cbd5e1",fontSize:12}}>•</span>
                    <span style={{fontSize:14,fontWeight:"700",color:"#1e293b",cursor:"pointer",padding:"2px 6px",borderRadius:5}} onClick={()=>{}}>{row.emp2||"—"}</span>
                    {row.warn && <span style={{marginRight:"auto",fontSize:13}}>⚠️</span>}
                  </div>
                ))}
                {(dutyDraft.length?dutyDraft:dutyAssign).some(r=>r.warn) && (
                  <div style={{fontSize:12,color:"#b45309",background:"#fff7ed",borderRadius:8,padding:"8px 10px",marginBottom:10}}>⚠️ שבועיים ברצף — לא ניתן למנוע בשל מגבלות זמינות</div>
                )}
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button style={{...S.btnOut("#64748b"),flex:1}} onClick={()=>setDutySetupStep(2)}>← חזרה</button>
                  <button style={{...S.btn("#1D9E75"),flex:2}}
                    onClick={()=>{ setDutyAssign(dutyDraft.length?dutyDraft:dutyAssign); setDutyDraft([]); setDutySetupStep(4); }}>
                    ✓ אשרי שיבוץ
                  </button>
                </div>
              </div>
            </div>}

            {/* Step 4: Publish */}
            {dutySetupStep===4 && <div>
              <div style={S.card}>
                <div style={S.sTitle}>פרסום תורנות שישי</div>
                {dutyPublished && <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:8,padding:"10px 12px",marginBottom:12,fontSize:14,fontWeight:"600",color:"#15803d"}}>✓ פורסם</div>}
                <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                  {dutyAssign.map((row,i)=>(
                    <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",borderRadius:8,background:"#f8fafc",border:"0.5px solid #e2e8f0"}}>
                      <span style={{fontWeight:"700",minWidth:60,fontSize:13}}>{row.date}</span>
                      <span style={{fontSize:13,color:"#1e293b"}}>{row.emp1} • {row.emp2}</span>
                    </div>
                  ))}
                </div>
                <button style={{...S.btn(dutyPublished?"#22c55e":"#1D9E75"),width:"100%"}}
                  onClick={()=>{
                    setDutyPublished(true);
                    fbSave({employees,availability,assigned,notes,empNotes,empPasswords,managerPassword,fridayRota,published,dayRemarks,shiftNotes,vacations,empShiftNotes,dutyPeriod,dutyAvail,dutyAssign,dutyPublished:true,dutyAvailOpen:false,dutySetupStep:4});
                    showToast("תורנות שישי פורסמה ✓");
                  }}>
                  {dutyPublished?"✓ פורסם":"📲 פרסם תורנות שישי לרוקחים"}
                </button>
              </div>
            </div>}
          </div>;
        })()}

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
                      <span><strong>{r.date}</strong> — {r.emp1||r.open||"—"} + {r.emp2||r.close||"—"}</span>
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
                <select style={{...S.input,flex:1,minWidth:100}} value={newEmpRole} onChange={e=>setNewEmpRole(e.target.value)}>
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
