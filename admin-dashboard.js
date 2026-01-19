/********************
 * FIREBASE CONFIG
 ********************/
const firebaseConfig = {
  apiKey: "AIzaSyCyB7BnO7aN_Qc1-twh01iKsqUGRhRJYWc",
  authDomain: "harry-shellywedding.firebaseapp.com",
  projectId: "harry-shellywedding",
  storageBucket: "harry-shellywedding.appspot.com"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

/********************
 * AUTH GUARD
 ********************/
auth.onAuthStateChanged(user => {
  if (!user) {
    // Not logged in → redirect to login
    window.location.href = "admin-login.html";
  } else {
    // Logged in → show dashboard
    initDashboard();
  }
});

/********************
 * INITIALIZE DASHBOARD
 ********************/
function initDashboard() {
  const addGiftForm = document.getElementById("addGiftForm");
  const giftListAdmin = document.getElementById("giftListAdmin");

  if (!addGiftForm || !giftListAdmin) return;

  /********************
   * ADD NEW GIFT
   ********************/
  addGiftForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("giftName").value.trim();
    const type = document.getElementById("giftType").value;
    const fileInput = document.getElementById("giftImageFile");

    if (!name) return alert("Please enter a gift name.");

    let imageUrl = "";

    try {
      // Upload image if selected
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        // Optional size check
        if (file.size > 3 * 1024 * 1024) {
          return alert("Please upload an image under 3MB");
        }

        const imageRef = storage.ref(`gift-images/${Date.now()}_${file.name}`);
        const uploadTask = await imageRef.put(file);

        // Get public URL
        imageUrl = await uploadTask.ref.getDownloadURL();
      }

      // Add gift to Firestore
      await db.collection("gifts").add({
        name,
        type,
        imageUrl,
        purchased: false,
        createdAt: new Date()
      });

      addGiftForm.reset();

    } catch (err) {
      console.error("Failed to add gift:", err);
      alert("Failed to add gift. Check console for details.");
    }
  });

  /********************
   * ADMIN PREVIEW
   ********************/
  db.collection("gifts")
    .orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {
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
            // Delete Firestore doc
            await db.collection("gifts").doc(doc.id).delete();

            // Optional: delete image from Storage
            if (gift.imageUrl) {
              const imageRef = storage.refFromURL(gift.imageUrl);
              await imageRef.delete();
            }
          } catch (err) {
            console.error("Failed to delete gift:", err);
            alert("Failed to delete gift. See console.");
          }
        };

        card.appendChild(deleteBtn);
        giftListAdmin.appendChild(card);
      });
    });
}
