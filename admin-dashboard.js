/********************
 * FIREBASE CONFIG
 ********************/
const firebaseConfig = {
  apiKey: "AIzaSyCyB7BnO7aN_Qc1-twh01iKsqUGRhRJYWc",
  authDomain: "harry-shellywedding.firebaseapp.com",
  projectId: "harry-shellywedding",
  storageBucket: "harry-shellywedding.firebasestorage.app"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

/********************
 * AUTH GUARD + INIT
 ********************/
auth.onAuthStateChanged(user => {
  console.log("Auth state changed:", user);
  if (!user) {
    console.log("No user logged in, redirecting to login page.");
    window.location.href = "admin.html";
    return;
  }

  console.log("Logged in as:", user.email);

  const adminEmialEl = document.getElementById("adminEmail");
  if (adminEmialEl) {
    adminEmialEl.textContent = user.email;
  }

  initDashboard();
});

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await firebase.auth().signOut();
    window.location.href = "admin.html";
  };
}

/********************
 * DASHBOARD INIT
 ********************/
function initDashboard() {
  const addGiftForm = document.getElementById("addGiftForm");
  const giftListAdmin = document.getElementById("giftListAdmin");

  if (!addGiftForm || !giftListAdmin) {
    console.error("Dashboard elements not found.");
    return;
  }

  // ====================
  // ADD NEW GIFT
  // ====================
  addGiftForm.addEventListener("submit", async e => {
    e.preventDefault();

    const name = document.getElementById("giftName").value.trim();
    const fileInput = document.getElementById("giftImageFile");

    if (!name) return alert("Please enter a gift name.");

    let imageUrl = "";

    try {
      // Upload image if file selected
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        if (file.size > 3 * 1024 * 1024) return alert("Image must be under 3MB");

        const imageRef = storage.ref(`gifts/${Date.now()}_${file.name}`);
        const uploadTask = await imageRef.put(file);
        imageUrl = await uploadTask.ref.getDownloadURL();
        console.log("Image uploaded:", imageUrl);
      }

      // Add gift to Firestore
      await db.collection("gifts").add({
        name,
        imageUrl,
        purchased: false,
      });

      console.log("Gift added to Firestore:", name);
      addGiftForm.reset();

      const successMessage = document.getElementById("adminSuccessMessage");

      if (successMessage) {
        successMessage.textContent = "Gift added successfully ✓";
        successMessage.classList.add("show");

        setTimeout(() => {
          successMessage.classList.remove("show");
        }, 3000);
      }


    } catch (err) {
      console.error("Failed to add gift:", err);
      alert("Failed to add gift. See console.");
    }
  });

  // ====================
  // ADMIN PREVIEW
  // ====================
  db.collection("gifts").onSnapshot(snapshot => {
      console.log("Snapshot received:", snapshot.size, "gifts");
      giftListAdmin.innerHTML = "";

      snapshot.forEach(doc => {
        const gift = doc.data();
        const card = document.createElement("div");
        card.className = "admin-gift-card";

        // Image
        if (gift.imageUrl) {
          const img = document.createElement("img");
          img.src = gift.imageUrl;
          img.alt = gift.name;
          card.appendChild(img);
        }

        // Name
        const title = document.createElement("h3");
        title.textContent = gift.name;
        card.appendChild(title);

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "admin-delete";

        deleteBtn.onclick = async () => {
          if (!confirm(`Delete "${gift.name}"?`)) return;

          try {
            // Delete Firestore document
            await db.collection("gifts").doc(doc.id).delete();

            // Delete Storage image if exists
            if (gift.imageUrl) {
              const imageRef = storage.refFromURL(gift.imageUrl);
              await imageRef.delete();
              console.log("Image deleted:", gift.imageUrl);
            }

            console.log("Gift deleted:", gift.name);
          } catch (err) {
            console.error("Failed to delete gift:", err);
            alert("Failed to delete gift. See console.");
          }
        };

        card.appendChild(deleteBtn);
        giftListAdmin.appendChild(card);
      });
    }, err => {
      console.error("Snapshot listener failed:", err);
    });
}
