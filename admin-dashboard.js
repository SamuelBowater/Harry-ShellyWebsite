console.log("ADMIN DASHBOARD LOADED");

const addGiftForm = document.getElementById("addGiftForm");
const giftListAdmin = document.getElementById("giftListAdmin");

/********************
 * FIREBASE CONFIG *
 ********************/
const firebaseConfig = {
  apiKey: "AIzaSyCyB7BnO7aN_Qc1-twh01iKsqUGRhRJYWc",
  authDomain: "harry-shellywedding.firebaseapp.com",
  projectId: "harry-shellywedding",
  storageBucket: "harry-shellywedding.firebaseapp.com",
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();

/********************
 * AUTH GUARD *
 ********************/
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    alert("Please log in to access the admin dashboard.");
    window.location.href = "admin-login.html";
  }
});

/********************
 * ADD GIFT LOGIC *
 ********************/
addGiftForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("giftName").value;
  const type = document.getElementById("giftType").value;
  const fileInput = document.getElementById("giftImageFile");

  let imageUrl = "";

  try {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];

      if (file.size > 3 * 1024 * 1024) {
        alert("Please upload an image under 3MB");
        return;
      }

      const imageRef = storage.ref(
        `gift-images/${Date.now()}_${file.name}`
      );

      await imageRef.put(file);
      imageUrl = await imageRef.getDownloadURL();
    }

    await db.collection("gifts").add({
      name,
      type,
      imageUrl,
      purchased: false,
      createdAt: new Date()
    });

    addGiftForm.reset();

  } catch (err) {
    console.error("ADD GIFT ERROR:", err);
    alert("Failed to add gift.");
  }
});

/********************
 * ADMIN PREVIEW *
 ********************/
db.collection("gifts")
  .orderBy("createdAt", "desc")
  .onSnapshot(snapshot => {

    giftListAdmin.innerHTML = "";

    snapshot.forEach(doc => {
      const gift = doc.data();

      const card = document.createElement("div");
      card.className = "admin-gift-card";

      if (gift.imageUrl) {
        const img = document.createElement("img");
        img.src = gift.imageUrl;
        img.alt = gift.name;
        card.appendChild(img);
      }

      const title = document.createElement("h3");
      title.textContent = gift.name;
      card.appendChild(title);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "admin-delete";

      deleteBtn.onclick = async () => {
        if (confirm(`Delete "${gift.name}"?`)) {
          await db.collection("gifts").doc(doc.id).delete();
        }
      };

      card.appendChild(deleteBtn);
      giftListAdmin.appendChild(card);
    });
  });
