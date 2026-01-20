// ==============================
// FIREBASE CONFIG
// ==============================
const firebaseConfig = {
  apiKey: "AIzaSyCyB7BnO7aN_Qc1-twh01iKsqUGRhRJYWc",
  authDomain: "harry-shellywedding.firebaseapp.com",
  projectId: "harry-shellywedding",
  storageBucket: "harry-shellywedding.firebaseapp.com",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

// ==============================
// ADMIN LOGIN
// ==============================
const loginForm = document.getElementById("adminLoginForm");
const adminMessage = document.getElementById("adminMessage");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    adminMessage.textContent = "Login successful! Redirecting…";
    adminMessage.style.color = "green";

    // Redirect to admin-dashboard.html
    window.location.href = "admin-dashboard.html";

  } catch (err) {
    console.error("Login failed:", err);
    adminMessage.textContent = "Login failed: " + err.message;
    adminMessage.style.color = "red";
  }
});



