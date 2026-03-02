const giftList = document.getElementById("giftList");

if (giftList) {
  db.collection("gifts").onSnapshot(snapshot => {
    let gifts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Always keep contribution gift at the top
    gifts.sort((a, b) => {
      return (b.type === "contribution") - (a.type === "contribution");
    });

    giftList.innerHTML = "";

    gifts.forEach((gift, index) => {
      const card = document.createElement("div");
      card.className = "gift-card";

      // FIXED animation delay
      card.style.animationDelay = `${index * 0.1}s`;

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

      if (gift.type === "contribution") {
        // Contribution card
        const info = document.createElement("p");
        info.textContent =
          "Your presence at our wedding is the greatest gift of all. If you wish to honor us with a gift, contributions in cash would be greatly appreciated. Thank you for helping make our day special!";
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
        // Physical gift button
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