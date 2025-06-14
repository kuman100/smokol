import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
    import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyAk1TrW4UmxyrJVTldVsQggDtzuYCmMOWI",
      authDomain: "smokol-60028.firebaseapp.com",
      projectId: "smokol-60028",
      storageBucket: "smokol-60028.appspot.com",
      messagingSenderId: "567509469589",
      appId: "1:567509469589:web:1c21610b990de007984e9c"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const kontakRef = doc(db, "pengaturan", "kontak");

    async function loadKontak() {
      try {
        const snap = await getDoc(kontakRef);
        if (snap.exists()) {
          const data = snap.data();
          document.getElementById("alamat").innerText = data.alamat || "-";
          document.getElementById("telepon").innerText = data.telepon || "-";
          document.getElementById("telepon").href = `https://wa.me/${data.telepon?.replace(/\D/g, '') || ''}`;
          document.getElementById("email").innerText = data.email || "-";
          document.getElementById("email").href = `mailto:${data.email}`;
          document.getElementById("jam").innerText = data.jam || "-";
          document.getElementById("maps").src = data.maps || "";
        } else {
          console.warn("Data kontak belum tersedia.");
        }
      } catch (error) {
        console.error("Gagal memuat kontak:", error);
      }
    }

    loadKontak();