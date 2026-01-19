const adminLoginForm = document.getElementById("adminLoginForm");
const adminMessage = document.getElementById("adminMessage");

const firebaseConfig = {
  apiKey: "AIzaSyCyB7BnO7aN_Qc1-twh01iKsqUGRhRJYWc",
  authDomain: "harry-shellywedding.firebaseapp.com",
  projectId: "harry-shellywedding",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      adminMessage.textContent = "Login successful! Redirecting...";
      // Redirect to admin dashboard or gift management page
      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 1000);
    } catch (err) {
      console.error(err);
      adminMessage.textContent = "Login failed. Check email/password.";
    }
  });
}
