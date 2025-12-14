// js/activity-log.js
// ملف واحد مسؤول عن تسجيل وقراءة سجل النشاط من Firestore

// نستخدم نفس إصدار Firebase اللي في index.html (11.0.1)
// ونعيد استخدام الـ app لو كانت متعرّفة قبل كده
import {
  initializeApp,
  getApps,
  getApp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// إعدادات Firebase لمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyDXQW3_6iFkb8Ec2aaVtFMJZYxLN-FmI54",
  authDomain: "ptw-najran-sharurah.firebaseapp.com",
  projectId: "ptw-najran-sharurah",
  storageBucket: "ptw-najran-sharurah.firebasestorage.app",
  messagingSenderId: "848619550286",
  appId: "1:848619550286:web:fe5c470f67236b2519751f",
  measurementId: "G-PQED2DCRL1"
};

// ✅ لو فيه app متعرّف قبل كده (مثلاً من index.html) نستخدمه
// لو مافيش، نعمل initializeApp عادي
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
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

// ✅ دالة لقراءة كل السجل (تُستخدم في activity.html)
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
