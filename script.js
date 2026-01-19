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
    let gifts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Move contribution gift to first position
    const contributionIndex = gifts.findIndex(g => g.type === "contribution");
    if (contributionIndex > -1) {
      const [contributionGift] = gifts.splice(contributionIndex, 1);
      gifts.unshift(contributionGift);
    }

    giftList.innerHTML = "";

    gifts.forEach(gift => {
      const card = document.createElement("div");
      card.className = "gift-card";
      
      card.style.animationDelay = '${index * 0.1}s';

      /* Image */
      if (gift.imageUrl) {
        const imageWrap = document.createElement("div");
        imageWrap.className = "gift-image-wrap";

        const img = document.createElement("img");
        img.src = gift.imageUrl;
        img.alt = gift.name;
        img.loading = "lazy";

        imageWrap.appendChild(img);
        card.appendChild(imageWrap);
      }

      /* Content */
      const content = document.createElement("div");
      content.className = "gift-content";

      const title = document.createElement("h3");
      title.textContent = gift.name;
      content.appendChild(title);

      if (gift.type === 1) {
        // Contribution card
        const info = document.createElement("p");
        info.textContent = "Your presence at our wedding is the greatest gift of all. If you wish to honor us with a gift, contributions in cash would be greatly appreciated. Thank you for helping make our day special!";
        info.style.fontStyle = "italic";
        content.appendChild(info);
      } else if (gift.purchased) {
        // Purchased badge + thank you
        const badge = document.createElement("div");
        badge.className = "gift-badge";
        badge.textContent = "Purchased";

        const thankYou = document.createElement("div");
        thankYou.className = "gift-thankyou";
        thankYou.textContent = "Thank you 🤍";

        content.appendChild(badge);
        content.appendChild(thankYou);

      } else {
        // Physical gift "I bought this"
        const button = document.createElement("button");
        button.textContent = "I've bought this";

        button.onclick = () => {
          const actions = document.createElement("div");
          actions.className = "gift-actions";

          const input = document.createElement("input");
          input.placeholder = "Your name (optional)";
          input.setAttribute("aria-label", "Your name");

          const confirm = document.createElement("button");
          confirm.textContent = "Confirm";
          confirm.className = "gift-confirm";

          confirm.onclick = async () => {
            card.classList.add("collapsing");
            confirm.disabled = true;

            try {
              await db.collection("gifts").doc(gift.id).update({
                purchased: true,
                purchasedBy: input.value || ""
              });
            } catch (err) {
              console.error(err);
              confirm.disabled = false;
              alert("Something went wrong. Please try again.");
            }
          };

          actions.append(input, confirm);
          content.replaceChild(actions, button);
        };

        content.appendChild(button);
      }

      card.appendChild(content);
      giftList.appendChild(card);
    });
  });
}
