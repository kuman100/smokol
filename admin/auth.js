import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Redirect to dashboard if user is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

// Login functionality
const loginForm = document.getElementById("login-form");
const submitButton = loginForm.querySelector('button[type="submit"]');
const errorMsg = document.getElementById("error-msg");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const email = loginForm.email.value.trim();
  const password = loginForm.password.value;
  
  // Show loading state
  submitButton.textContent = "Memproses...";
  submitButton.disabled = true;
  submitButton.classList.add("loading");
  
  // Hide previous error messages
  errorMsg.style.display = "none";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Success - redirect will be handled by onAuthStateChanged
  } catch (error) {
    // Handle different error types
    let errorMessage = "Login gagal. Silakan coba lagi.";
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = "Email tidak terdaftar dalam sistem.";
        break;
      case 'auth/wrong-password':
        errorMessage = "Password yang Anda masukkan salah.";
        break;
      case 'auth/invalid-email':
        errorMessage = "Format email tidak valid.";
        break;
      case 'auth/user-disabled':
        errorMessage = "Akun Anda telah dinonaktifkan.";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Terlalu banyak percobaan login. Coba lagi nanti.";
        break;
      case 'auth/network-request-failed':
        errorMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
        break;
      default:
        errorMessage = `Login gagal: ${error.message}`;
    }
    
    errorMsg.textContent = errorMessage;
    errorMsg.style.display = "block";
    
    // Add shake animation to form
    loginForm.style.animation = "shake 0.5s ease-in-out";
    setTimeout(() => {
      loginForm.style.animation = "";
    }, 500);
  } finally {
    // Reset button state
    submitButton.textContent = "Masuk ke Dashboard";
    submitButton.disabled = false;
    submitButton.classList.remove("loading");
  }
});

// Add input validation
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

emailInput.addEventListener("input", () => {
  const email = emailInput.value.trim();
  if (email && !isValidEmail(email)) {
    emailInput.style.borderColor = "#ef4444";
  } else {
    emailInput.style.borderColor = "#e1e5e9";
  }
});

passwordInput.addEventListener("input", () => {
  const password = passwordInput.value;
  if (password && password.length < 6) {
    passwordInput.style.borderColor = "#f59e0b";
  } else {
    passwordInput.style.borderColor = "#e1e5e9";
  }
});

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);