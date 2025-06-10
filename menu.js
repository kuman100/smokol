import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Konfigurasi Firebase
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
const menuRef = collection(db, "menu");

// DOM Elements
const loadingElement = document.getElementById("loading");
const emptyState = document.getElementById("empty-state");
const menuGrid = document.getElementById("menu-grid");
const makananGrid = document.getElementById("makanan-grid");
const minumanGrid = document.getElementById("minuman-grid");
const lainnyaGrid = document.getElementById("lainnya-grid");

// Global data storage
let allMenuData = [];

// Function to create menu card HTML
function createMenuCard(data) {
  const defaultImage = "https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image";
  const imageUrl = data.image || defaultImage;
  
  return `
    <div class="menu-card bg-white rounded-xl shadow-lg overflow-hidden">
      <div class="relative">
        <img 
          src="${imageUrl}" 
          alt="${data.nama}" 
          class="w-full h-48 object-cover"
          onerror="this.src='${defaultImage}'"
        />
        <div class="absolute top-3 right-3">
          <span class="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            ${getCategoryIcon(data.kategori)} ${formatCategory(data.kategori)}
          </span>
        </div>
      </div>
      <div class="p-4">
        <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">${data.nama}</h3>
        <p class="text-gray-600 text-sm mb-4 line-clamp-3">${data.deskripsi}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            ${formatCategory(data.kategori)}
          </span>
          <button class="detail-btn bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors" data-menu-id="${data.id}">
            Lihat Detail
          </button>
        </div>
      </div>
    </div>
  `;
}

// Function to get category icon
function getCategoryIcon(kategori) {
  const icons = {
    'makanan': '🍽️',
    'minuman': '🥤',
    'lainnya': '🍰'
  };
  return icons[kategori] || '🍽️';
}

// Function to format category name
function formatCategory(kategori) {
  const categoryNames = {
    'makanan': 'Makanan',
    'minuman': 'Minuman',
    'lainnya': 'Lainnya'
  };
  return categoryNames[kategori] || 'Lainnya';
}

// Function to render menu items to specific grid
function renderMenuItems(items, gridElement) {
  if (!gridElement) return;
  
  if (items.length === 0) {
    gridElement.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">Tidak ada menu dalam kategori ini</div>';
    return;
  }
  
  gridElement.innerHTML = items.map(item => createMenuCard(item)).join('');
}

// Function to show/hide loading state
function toggleLoading(show) {
  if (loadingElement) {
    loadingElement.style.display = show ? 'block' : 'none';
  }
}

// Function to categorize menu items
function categorizeMenuItems(menuData) {
  return {
    all: menuData,
    makanan: menuData.filter(item => item.kategori === 'makanan'),
    minuman: menuData.filter(item => item.kategori === 'minuman'),
    lainnya: menuData.filter(item => item.kategori === 'lainnya')
  };
}

// Function to show menu detail modal
function showMenuDetail(menuId) {
  const menuItem = allMenuData.find(item => item.id === menuId);
  if (!menuItem) return;
  
  const modal = document.getElementById('menu-modal');
  const modalContent = document.getElementById('modal-content');
  const defaultImage = "https://via.placeholder.com/600x400/f3f4f6/9ca3af?text=No+Image";
  const imageUrl = menuItem.image || defaultImage;
  
  modalContent.innerHTML = `
    <div class="relative">
      <img 
        src="${imageUrl}" 
        alt="${menuItem.nama}" 
        class="w-full h-64 md:h-80 object-cover rounded-t-2xl"
        onerror="this.src='${defaultImage}'"
      />
      <div class="absolute bottom-4 left-4">
        <span class="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          ${getCategoryIcon(menuItem.kategori)} ${formatCategory(menuItem.kategori)}
        </span>
      </div>
    </div>
    
    <div class="p-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">${menuItem.nama}</h2>
      
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Deskripsi</h3>
        <p class="text-gray-600 leading-relaxed">${menuItem.deskripsi}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-700 mb-2">Kategori</h4>
          <p class="text-gray-600">${getCategoryIcon(menuItem.kategori)} ${formatCategory(menuItem.kategori)}</p>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="font-semibold text-gray-700 mb-2">Status</h4>
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Tersedia
          </span>
        </div>
      </div>
      
      <div class="border-t pt-6">
        <div class="flex flex-col sm:flex-row gap-3">
          <button class="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
            </svg>
            Hubungi Kami
          </button>
          <button class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
            </svg>
            Bagikan
          </button>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Function to hide menu detail modal
function hideMenuDetail() {
  const modal = document.getElementById('menu-modal');
  modal.classList.add('hidden');
  document.body.style.overflow = 'auto'; // Restore scrolling
}

// Main function to load and display menu
onSnapshot(menuRef, (snapshot) => {
  toggleLoading(true);
  
  try {
    // Clear previous data
    allMenuData = [];
    
    // Process each document
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.nama && data.deskripsi) { // Basic validation
        allMenuData.push({
          id: docSnap.id,
          ...data
        });
      }
    });
    
    // Categorize menu items
    const categorizedItems = categorizeMenuItems(allMenuData);
    
    // Render all categories
    renderMenuItems(categorizedItems.all, menuGrid);
    renderMenuItems(categorizedItems.makanan, makananGrid);
    renderMenuItems(categorizedItems.minuman, minumanGrid);
    renderMenuItems(categorizedItems.lainnya, lainnyaGrid);
    
    // Add event listeners for detail buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('detail-btn')) {
        const menuId = e.target.dataset.menuId;
        showMenuDetail(menuId);
      }
    });
    
    // Show empty state if no data
    if (allMenuData.length === 0 && emptyState) {
      emptyState.classList.remove('hidden');
    } else if (emptyState) {
      emptyState.classList.add('hidden');
    }
    
    toggleLoading(false);
    
    console.log(`Loaded ${allMenuData.length} menu items`);
    
  } catch (error) {
    console.error("Error loading menu data:", error);
    toggleLoading(false);
    
    // Show error message
    if (menuGrid) {
      menuGrid.innerHTML = `
        <div class="col-span-full text-center py-8 text-red-500">
          <div class="text-4xl mb-2">⚠️</div>
          <p>Terjadi kesalahan saat memuat menu.</p>
          <button onclick="location.reload()" class="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Coba Lagi
          </button>
        </div>
      `;
    }
  }
}, (error) => {
  console.error("Firestore listener error:", error);
  toggleLoading(false);
});

// Modal event listeners
document.addEventListener('DOMContentLoaded', () => {
  const closeModalBtn = document.getElementById('close-modal');
  const modal = document.getElementById('menu-modal');
  
  // Close modal when clicking close button
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideMenuDetail);
  }
  
  // Close modal when clicking outside
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideMenuDetail();
      }
    });
  }
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      hideMenuDetail();
    }
  });
});

// Add some utility CSS for text clamping
const style = document.createElement('style');
style.textContent = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`;
document.head.appendChild(style);