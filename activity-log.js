// js/activity-log.js
// ملف واحد مسؤول عن تسجيل وقراءة سجل النشاط من Firestore

// نستعمل CDN لمكتبة Firebase (أنسب لحالتك مع GitHub Pages / Cloudflare)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ✅ إعدادات Firebase لمشروعك (نفس اللي نسختها من الـ console)
const firebaseConfig = {
  apiKey: "AIzaSyDXQW3_6iFkb8Ec2aaVtFMJZYxLN-FmI54",
  authDomain: "ptw-najran-sharurah.firebaseapp.com",
  projectId: "ptw-najran-sharurah",
  storageBucket: "ptw-najran-sharurah.firebasestorage.app",
  messagingSenderId: "848619550286",
  appId: "1:848619550286:web:fe5c470f67236b2519751f",
  measurementId: "G-PQED2DCRL1"
};

// ✅ تهيئة Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ✅ دالة لتسجيل حدث جديد
async function logActivity(type, details = {}) {
  try {
    const raw = localStorage.getItem("aln_session");
    let session = null;
    try {
      session = raw ? JSON.parse(raw) : null;
    } catch (e) {
      session = null;
    }

    const payload = {
      time: new Date().toISOString(),
      user: session?.username || "unknown",
      role: session?.role || "unknown",
      type,
      details
    };

    await addDoc(collection(db, "activity_log"), payload);
  } catch (err) {
    console.error("logActivity error:", err);
  }
}

// ✅ دالة لقراءة كل السجل (هتستخدمها صفحة activity.html)
async function fetchActivityLog() {
  const q = query(
    collection(db, "activity_log"),
    orderBy("time", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ✅ دالة لمسح كل السجل
async function clearActivityLog() {
  const q = query(collection(db, "activity_log"));
  const snap = await getDocs(q);
  const jobs = snap.docs.map(d => deleteDoc(doc(db, "activity_log", d.id)));
  await Promise.all(jobs);
}

// ✅ نطلع الدوال على window عشان نستخدمها من أي صفحة HTML
window.logActivity      = logActivity;
window.fetchActivityLog = fetchActivityLog;
window.clearActivityLog = clearActivityLog;
