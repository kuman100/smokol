import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// === Firebase Config ===
const firebaseConfig = {
  apiKey: "AIzaSyAk1TrW4UmxyrJVTldVsQggDtzuYCmMOWI",
  authDomain: "smokol-60028.firebaseapp.com",
  projectId: "smokol-60028",
  storageBucket: "smokol-60028.appspot.com",
  messagingSenderId: "567509469589",
  appId: "1:567509469589:web:1c21610b990de007984e9c",
  measurementId: "G-M2ZWRKFKXW"
};

// === Inisialisasi Firebase ===
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const tentangRef = doc(db, "pengaturan", "tentang");

const tentangDiv = document.querySelector("#tentang-kami");
const visiDiv = document.querySelector("#visi");
const misiList = document.querySelector("#misi");

getDoc(tentangRef).then((docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();
    tentangDiv.textContent = data.tentang || "";
    visiDiv.textContent = data.visi || "";
    misiList.innerHTML = "";
    (data.misi || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      misiList.appendChild(li);
    });
  }
}).catch((error) => {
  console.error("Gagal memuat data tentang:", error);
});
