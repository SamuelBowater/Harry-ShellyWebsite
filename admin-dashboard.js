const addGiftForm = document.getElementById("addGiftForm");
const giftListAdmin = document.getElementById("giftListAdmin");

if (addGiftForm) {
  // Add new gift
  addGiftForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("giftName").value;
    const imageUrl = document.getElementById("giftImage").value;
    const type = document.getElementById("giftType").value;

    try {
      await db.collection("gifts").add({
        name,
        imageUrl,
        type,
        purchased: false,
      });
      addGiftForm.reset();
    } catch (err) {
      console.error(err);
      alert("Failed to add gift.");
    }
  });

  // Render gift list preview
  db.collection("gifts").onSnapshot(snapshot => {
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

      // Edit/Delete buttons (optional)
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = async () => {
        if (confirm(`Delete ${gift.name}?`)) {
          await db.collection("gifts").doc(doc.id).delete();
        }
      };
      card.appendChild(deleteBtn);

      giftListAdmin.appendChild(card);
    });
  });
}

