// === Firebase Imports ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const menuRef = collection(db, "menu");
const kontakRef = doc(db, "pengaturan", "kontak");
const tentangRef = doc(db, "pengaturan", "tentang");

// === Proteksi Akses Halaman Admin ===
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

// === Tombol Logout ===
document.getElementById("logout-btn").addEventListener("click", () => signOut(auth));

// === Cloudinary Config ===
const cloudName = "dt4jh0ngn";
const uploadPreset = "smokol";

// === Variabel Global ===
let updateId = null;

// === Submit Form (Tambah / Update Menu) ===
document.getElementById("menu-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value.trim();
  const deskripsi = document.getElementById("deskripsi").value.trim();
  const imageFile = document.getElementById("image").files[0];
  const kategori = document.getElementById("kategori").value;
  let imageUrl = "";

  // Disable submit button
  const submitBtn = document.getElementById("submit-btn");
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...';
  submitBtn.disabled = true;

  try {
    // Upload Gambar (jika ada)
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "menu_uploads");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      imageUrl = data.secure_url;
    }

    // Update Data
    if (updateId) {
      const updateData = { nama, deskripsi, kategori };
      if (imageUrl) updateData.image = imageUrl;

      await updateDoc(doc(db, "menu", updateId), updateData);
      updateId = null;
      submitBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Tambah Menu';
      showNotification("Menu berhasil diupdate!", "success");
    } else {
      // Tambah Baru
      await addDoc(menuRef, {
        nama,
        deskripsi,
        image: imageUrl,
        kategori,
        createdAt: new Date()
      });
      showNotification("Menu berhasil ditambahkan!", "success");
    }

    e.target.reset();
  } catch (error) {
    console.error("Error saat menyimpan data:", error);
    showNotification("Terjadi kesalahan saat menyimpan data.", "error");
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

async function loadContactInfo() {
  try {
    const docSnap = await getDoc(kontakRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById("alamat").value = data.alamat || "";
      document.getElementById("telepon").value = data.telepon || "";
      document.getElementById("email").value = data.email || "";
      document.getElementById("jam").value = data.jam || "";
      document.getElementById("maps").value = data.maps || "";
    }
  } catch (error) {
    console.error("Gagal mengambil data kontak:", error);
  }
}
loadContactInfo();

// === Update Data Kontak ===
document.getElementById("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    alamat: document.getElementById("alamat").value.trim(),
    telepon: document.getElementById("telepon").value.trim(),
    email: document.getElementById("email").value.trim(),
    jam: document.getElementById("jam").value.trim(),
    maps: document.getElementById("maps").value.trim(),
  };

  try {
    await setDoc(kontakRef, data);
    showNotification("Kontak berhasil diperbarui!", "success");
  } catch (error) {
    console.error("Gagal update kontak:", error);
    showNotification("Terjadi kesalahan saat memperbarui kontak.", "error");
  }
});

// === Edit Tentang ===
async function loadTentangInfo() {
  try {
    const docSnap = await getDoc(tentangRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      document.getElementById("tentang").value = data.tentang || "";
      document.getElementById("visi").value = data.visi || "";
      document.getElementById("misi").value = (data.misi || []).join("; ");
    }
  } catch (error) {
    console.error("Gagal mengambil data tentang:", error);
  }
}
loadTentangInfo();

document.getElementById("tentang-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const tentang = document.getElementById("tentang").value.trim();
  const visi = document.getElementById("visi").value.trim();
  const misiText = document.getElementById("misi").value.trim();
  const misi = misiText.split(";").map(m => m.trim()).filter(m => m);

  try {
    await setDoc(tentangRef, { tentang, visi, misi });
    showNotification("Halaman Tentang berhasil diperbarui!", "success");
  } catch (error) {
    console.error("Gagal update tentang:", error);
    showNotification("Terjadi kesalahan saat memperbarui tentang.", "error");
  }
});


// === Menampilkan Data Menu ===
const menuMakanan = document.getElementById("menu-makanan");
const menuMinuman = document.getElementById("menu-minuman");
const menuLainnya = document.getElementById("menu-lainnya");
const countMakanan = document.getElementById("count-makanan");
const countMinuman = document.getElementById("count-minuman");
const countLainnya = document.getElementById("count-lainnya");

onSnapshot(menuRef, (snapshot) => {
  // Kosongkan semua container
  menuMakanan.innerHTML = "";
  menuMinuman.innerHTML = "";
  menuLainnya.innerHTML = "";

  let makananCount = 0;
  let minumanCount = 0;
  let lainnyaCount = 0;

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const menuCard = createMenuCard(docSnap.id, data);

    // Distribusi ke kategori yang sesuai
    if (data.kategori === "makanan") {
      menuMakanan.appendChild(menuCard);
      makananCount++;
    } else if (data.kategori === "minuman") {
      menuMinuman.appendChild(menuCard);
      minumanCount++;
    } else {
      menuLainnya.appendChild(menuCard);
      lainnyaCount++;
    }
  });

  // Update counters
  countMakanan.textContent = makananCount;
  countMinuman.textContent = minumanCount;
  countLainnya.textContent = lainnyaCount;

  // Show empty state if no items
  showEmptyState(menuMakanan, "makanan", makananCount);
  showEmptyState(menuMinuman, "minuman", minumanCount);
  showEmptyState(menuLainnya, "lainnya", lainnyaCount);
});

// === Membuat Card Menu ===
function createMenuCard(id, data) {
  const card = document.createElement("div");
  card.className = "bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group";
  
  card.innerHTML = `
    <div class="relative">
      <img src="${data.image || '/api/placeholder/300/200'}" 
           alt="${data.nama}" 
           class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
      <div class="absolute top-2 right-2">
        <span class="bg-white bg-opacity-90 text-xs font-semibold px-2 py-1 rounded-full text-gray-700">
          ${getCategoryIcon(data.kategori)} ${data.kategori}
        </span>
      </div>
    </div>
    
    <div class="p-4">
      <h3 class="font-bold text-lg text-gray-900 mb-2 line-clamp-1">${data.nama}</h3>
      <p class="text-gray-600 text-sm mb-4 line-clamp-2">${data.deskripsi}</p>
      
      <div class="flex space-x-2">
        <button class="edit-btn flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center space-x-1" 
                data-id="${id}">
          <i class="fas fa-edit text-xs"></i>
          <span>Edit</span>
        </button>
        <button class="delete-btn flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center space-x-1" 
                data-id="${id}">
          <i class="fas fa-trash text-xs"></i>
          <span>Hapus</span>
        </button>
      </div>
    </div>
  `;

  return card;
}

// === Helper Functions ===
function getCategoryIcon(kategori) {
  switch(kategori) {
    case 'makanan': return '🍽️';
    case 'minuman': return '🥤';
    case 'lainnya': return '🎯';
    default: return '📦';
  }
}

function showEmptyState(container, kategori, count) {
  if (count === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "col-span-full text-center py-12";
    emptyState.innerHTML = `
      <div class="text-gray-400 mb-4">
        <i class="fas fa-inbox text-6xl"></i>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Belum ada ${kategori}</h3>
      <p class="text-gray-500">Tambahkan ${kategori} pertama Anda dengan mengisi form di atas.</p>
    `;
    container.appendChild(emptyState);
  }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
    type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
  }`;
  notification.innerHTML = `
    <div class="flex items-center space-x-2">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// === Event Delegation untuk Edit dan Hapus ===
document.addEventListener("click", async (e) => {
  const id = e.target.closest('button')?.dataset.id;
  if (!id) return;

  if (e.target.closest('.delete-btn')) {
    if (confirm("Yakin ingin menghapus menu ini?")) {
      try {
        await deleteDoc(doc(db, "menu", id));
        showNotification("Menu berhasil dihapus!", "success");
      } catch (error) {
        console.error("Gagal menghapus:", error);
        showNotification("Gagal menghapus menu.", "error");
      }
    }
  }

  if (e.target.closest('.edit-btn')) {
    try {
      const docData = await getDoc(doc(db, "menu", id));
      const data = docData.data();

      document.getElementById("nama").value = data.nama;
      document.getElementById("deskripsi").value = data.deskripsi;
      document.getElementById("kategori").value = data.kategori;
      updateId = id;
      
      const submitBtn = document.getElementById("submit-btn");
      submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Menu';
      
      // Scroll to form
      document.querySelector('.bg-white.rounded-xl.shadow-lg').scrollIntoView({ 
        behavior: 'smooth' 
      });
      
      showNotification("Data dimuat untuk diedit", "success");
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      showNotification("Gagal mengambil data untuk diedit.", "error");
    }
  }
});

// === File Input Preview ===
document.getElementById("image").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.createElement('img');
      preview.src = e.target.result;
      preview.className = 'w-full h-32 object-cover rounded mt-2';
      
      const label = document.querySelector('label[for="image"]');
      const existingPreview = label.querySelector('img');
      if (existingPreview) {
        existingPreview.remove();
      }
      label.appendChild(preview);
    };
    reader.readAsDataURL(file);
  }
});