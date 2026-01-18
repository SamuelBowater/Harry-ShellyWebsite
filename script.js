/********************
 * FIREBASE CONFIG *
 ********************/
const firebaseConfig = {
    apiKey: "AIzaSyCyB7BnO7aN_Qc1-twh01iKsqUGRhRJYWc",
    authDomain: "harry-shellywedding.firebaseapp.com",
    projectId: "harry-shellywedding",
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/********************
 * RSVP PAGE LOGIC *
 ********************/
const rsvpForm = document.getElementById("rsvpForm");

if (rsvpForm) {
  const rsvpMessage = document.getElementById("rsvpMessage");

  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const attending = document.getElementById("attending").value === "yes";
    const guests = Number(document.getElementById("guests").value);

    await db.collection("rsvps").add({
      name,
      attending,
      guests,
      submittedAt: new Date()
    });

    rsvpMessage.textContent = "Thank you for your RSVP!";
    rsvpForm.reset();
  });
}

/********************
 * GIFTS PAGE LOGIC *
 ********************/
const giftList = document.getElementById("giftList");

if (giftList) {
  db.collection("gifts").onSnapshot(snapshot => {
    giftList.innerHTML = "";

    snapshot.forEach(doc => {
        const gift = doc.data();
        const div = document.createElement("div");
        div.className = "gift";

        const label = document.createElement("span");
        label.textContent = gift.name;

        div.appendChild(label);

        // Image (optional)
        if (gift.imageUrl) {
        const img = document.createElement("img");
        img.src = gift.imageUrl;
        img.alt = gift.name;
        img.className = "gift-image"; // we’ll style it next
        div.appendChild(img);
        }

        if (gift.purchased) {
        // ✅ Purchased state
        const thankYou = document.createElement("span");
        thankYou.className = "gift-thankyou";
        thankYou.textContent = "Thank you 🤍";

        div.appendChild(thankYou);
        } else {
        // 🛒 Available state
        const button = document.createElement("button");
        button.textContent = "I bought this";

        button.onclick = () => {
            const actions = document.createElement("div");
            actions.className = "gift-actions";

            const input = document.createElement("input");
            input.type = "text";
            input.placeholder = "Your name (optional)";

            const confirm = document.createElement("button");
            confirm.textContent = "Confirm";
            confirm.className = "gift-confirm";

            confirm.onclick = async () => {
            confirm.disabled = true;

            await db.collection("gifts").doc(doc.id).update({
                purchased: true,
                purchasedBy: input.value || ""
            });
            };

            actions.appendChild(input);
            actions.appendChild(confirm);

            div.replaceChild(actions, button);
        };

        div.appendChild(button);
        }

        giftList.appendChild(div);

    });
  });
}
