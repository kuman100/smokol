// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk1TrW4UmxyrJVTldVsQggDtzuYCmMOWI",
  authDomain: "smokol-60028.firebaseapp.com",
  projectId: "smokol-60028",
  storageBucket: "smokol-60028.appspot.com",
  messagingSenderId: "567509469589",
  appId: "1:567509469589:web:1c21610b990de007984e9c",
  measurementId: "G-M2ZWRKFKXW"
};

// Initialize Firebase
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

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeMenuApp();
});

function initializeMenuApp() {
  // Initialize mobile menu
  initializeMobileMenu();
  
  // Initialize category navigation
  initializeCategoryNavigation();
  
  // Initialize modal functionality
  initializeModal();
  
  // Load menu data from Firebase
  loadMenuData();
}

// Mobile menu functionality
function initializeMobileMenu() {
  const menuButton = document.getElementById('menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuButton.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add('hidden');
      }
    });
  }
}

// Category navigation functionality
function initializeCategoryNavigation() {
  const categoryButtons = document.querySelectorAll('.category-btn');
  const sections = {
    'all': document.getElementById('all-section'),
    'makanan': document.getElementById('makanan-section'),
    'minuman': document.getElementById('minuman-section'),
    'lainnya': document.getElementById('lainnya-section')
  };

  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      
      // Update active button
      categoryButtons.forEach(btn => {
        btn.classList.remove('bg-red-600', 'text-white', 'shadow-lg');
        btn.classList.add('text-gray-600', 'hover:text-red-600', 'bg-white', 'shadow-md');
      });
      button.classList.add('bg-red-600', 'text-white', 'shadow-lg');
      button.classList.remove('text-gray-600', 'hover:text-red-600', 'bg-white', 'shadow-md');
      
      // Show/hide sections
      Object.keys(sections).forEach(key => {
        if (key === category) {
          sections[key]?.classList.remove('hidden');
        } else {
          sections[key]?.classList.add('hidden');
        }
      });
    });
  });
}

// Modal functionality
function initializeModal() {
  const closeModalBtn = document.getElementById('close-modal');
  const modal = document.getElementById('menu-modal');
  
  // Close modal when clicking close button
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hideMenuDetail);
  }
  
  // Close modal when clicking overlay (not the content)
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        hideMenuDetail();
      }
    });
  }
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      hideMenuDetail();
    }
  });

  // Handle detail button clicks with event delegation
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('detail-btn')) {
      e.preventDefault();
      const menuId = e.target.dataset.menuId;
      showMenuDetail(menuId);
    }
  });
}

// Load menu data from Firebase
function loadMenuData() {
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
      handleLoadingError();
    }
  }, (error) => {
    console.error("Firestore listener error:", error);
    toggleLoading(false);
    handleLoadingError();
  });
}

// Handle loading errors
function handleLoadingError() {
  if (menuGrid) {
    menuGrid.innerHTML = `
      <div class="col-span-full text-center py-12 text-red-500">
        <div class="text-6xl mb-4">⚠️</div>
        <h3 class="text-xl font-bold mb-2">Terjadi Kesalahan</h3>
        <p class="mb-4">Tidak dapat memuat menu saat ini.</p>
        <button onclick="location.reload()" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold">
          Coba Lagi
        </button>
      </div>
    `;
  }
}

// Function to create menu card HTML
function createMenuCard(data) {
  const defaultImage = "https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=No+Image";
  const imageUrl = data.image || defaultImage;
  
  return `
    <div class="menu-card bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div class="relative group">
        <img 
          src="${imageUrl}" 
          alt="${data.nama}" 
          class="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
          onerror="this.src='${defaultImage}'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="absolute top-4 right-4">
          <span class="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-full text-xs font-semibold shadow-lg">
            ${getCategoryIcon(data.kategori)} ${formatCategory(data.kategori)}
          </span>
        </div>
      </div>
      <div class="p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-3 line-clamp-2">${data.nama}</h3>
        <p class="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">${data.deskripsi}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-full font-medium">
            ${formatCategory(data.kategori)}
          </span>
          <button class="detail-btn bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 shadow-lg" data-menu-id="${data.id}">
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
    gridElement.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500 text-lg">Tidak ada menu dalam kategori ini</div>';
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
        class="w-full h-72 md:h-96 object-cover rounded-t-3xl"
        onerror="this.src='${defaultImage}'"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent rounded-t-3xl"></div>
      <div class="absolute bottom-6 left-6">
        <span class="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
          ${getCategoryIcon(menuItem.kategori)} ${formatCategory(menuItem.kategori)}
        </span>
      </div>
    </div>
    
    <div class="p-6 md:p-8">
      <h2 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6">${menuItem.nama}</h2>
      
      <div class="mb-8">
        <h3 class="text-lg md:text-xl font-bold text-gray-700 mb-4 flex items-center">
          <span class="mr-2">📝</span> Deskripsi
        </h3>
        <p class="text-gray-600 leading-relaxed text-base md:text-lg">${menuItem.deskripsi}</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 rounded-2xl border border-gray-200">
          <h4 class="font-bold text-gray-700 mb-3 flex items-center text-sm md:text-base">
            <span class="mr-2">🏷️</span> Kategori
          </h4>
          <p class="text-gray-600 text-base md:text-lg">${getCategoryIcon(menuItem.kategori)} ${formatCategory(menuItem.kategori)}</p>
        </div>
        <div class="bg-gradient-to-br from-green-50 to-emerald-100 p-4 md:p-6 rounded-2xl border border-green-200">
          <h4 class="font-bold text-gray-700 mb-3 flex items-center text-sm md:text-base">
            <span class="mr-2">📊</span> Status
          </h4>
          <span class="inline-flex items-center px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
            ✅ Tersedia
          </span>
        </div>
      </div>
      
      <div class="border-t border-gray-200 pt-6 md:pt-8">
        <h4 class="text-lg md:text-xl font-bold text-gray-700 mb-4 md:mb-6 text-center">Pesan Sekarang Melalui:</h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4">
          <button onclick="orderViaWhatsApp('${menuItem.nama}')" class="service-btn whatsapp-btn text-white py-3 md:py-4 px-4 md:px-6 rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base">
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            WhatsApp
          </button>
          
          <button onclick="orderViaGrabFood('${menuItem.nama}')" class="service-btn grabfood-btn text-white py-3 md:py-4 px-4 md:px-6 rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base">
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            GrabFood
          </button>
          
          <button onclick="orderViaGoFood('${menuItem.nama}')" class="service-btn gofood-btn text-white py-3 md:py-4 px-4 md:px-6 rounded-2xl font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base">
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            GoFood
          </button>
        </div>
        
        <div class="text-center">
          <p class="text-gray-500 text-xs md:text-sm">
            💡 Pilih platform pesanan favorit Anda untuk menikmati ${menuItem.nama}
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Show modal
  modal.classList.remove('hidden');
  
  // Reset scroll position to top
  const modalContainer = modal.querySelector('.bg-white');
  if (modalContainer) {
    modalContainer.scrollTop = 0;
  }
  
  // Prevent body scroll but allow modal scroll
  document.body.style.overflow = 'hidden';
}

// Function to hide menu detail modal
function hideMenuDetail() {
  const modal = document.getElementById('menu-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore body scroll
  }
}

// Order functions
window.orderViaWhatsApp = function(menuName) {
  const message = `Halo! Saya tertarik untuk memesan ${menuName} dari Smokol. Bisa bantu saya untuk informasi lebih lanjut?`;
  const whatsappUrl = `https://wa.me/6282346048297?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  hideMenuDetail(); // Close modal after ordering
};

window.orderViaGrabFood = function(menuName) {
  // Replace with actual GrabFood restaurant link
  const grabfoodUrl = 'https://food.grab.com/id/en/restaurant/smokol-airmadidi-atas-link-xvii-kamblak-delivery/6-C7EFTXAKPAUTHE?';
  window.open(grabfoodUrl, '_blank');
  
  // Show notification
  showNotification(`Membuka GrabFood untuk memesan ${menuName}`, 'success');
  hideMenuDetail(); // Close modal after ordering
};

window.orderViaGoFood = function(menuName) {
  // Replace with actual GoFood restaurant link
  const gofoodUrl = 'https://gofood.co.id/manado/restaurant/smokol-dd4ce589-1714-4f51-bc01-0aca419c3565';
  window.open(gofoodUrl, '_blank');
  
  // Show notification
  showNotification(`Membuka GoFood untuk memesan ${menuName}`, 'success');
  hideMenuDetail(); // Close modal after ordering
};

// Notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `fixed top-20 right-4 z-50 px-4 md:px-6 py-3 md:py-4 rounded-lg shadow-lg text-white font-medium transform translate-x-full transition-transform duration-300 text-sm md:text-base ${
    type === 'success' ? 'bg-green-500' : 'bg-blue-500'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}