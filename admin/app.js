  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
  import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyAk1TrW4UmxyrJVTldVsQggDtzuYCmMOWI",
    authDomain: "smokol-60028.firebaseapp.com",
    projectId: "smokol-60028",
    storageBucket: "smokol-60028.firebasestorage.app",
    messagingSenderId: "567509469589",
    appId: "1:567509469589:web:1c21610b990de007984e9c",
    measurementId: "G-M2ZWRKFKXW"
  };

  // Initialize Firebase

  const analytics = getAnalytics(app);
  const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const menuCollection = collection(db, "menu");

// Form Tambah Makanan
document.getElementById("menu-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nama = document.getElementById("nama").value;
  const deskripsi = document.getElementById("deskripsi").value;
  const harga = parseInt(document.getElementById("harga").value);

  try {
    await addDoc(menuCollection, { nama, deskripsi, harga });
    e.target.reset();
  } catch (err) {
    console.error("Gagal tambah menu:", err);
  }
});

// Tampilkan Daftar Menu
const menuList = document.getElementById("menu-list");

onSnapshot(menuCollection, (snapshot) => {
  menuList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${data.nama}</strong> - ${data.deskripsi} (Rp ${data.harga})</span>
      <button class="hapus" data-id="${docSnap.id}">Hapus</button>
    `;
    menuList.appendChild(li);
  });
});

// Hapus Menu
menuList.addEventListener("click", async (e) => {
  if (e.target.classList.contains("hapus")) {
    const id = e.target.getAttribute("data-id");
    await deleteDoc(doc(db, "menu", id));
  }
});