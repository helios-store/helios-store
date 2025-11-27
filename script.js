// ----- PRELOAD IMAGES -----
document.querySelectorAll(".carousel").forEach(carousel => {
    const images = JSON.parse(carousel.dataset.images);
    images.forEach(src => {
        const img = new Image();
        img.src = src; // met en cache l'image → affichage instantané après
    });
});

// === VARIABLES ===
const iconePanier = document.querySelector(".fa-cart-shopping");
const panierDiv = document.getElementById("panier");
const panierItems = document.getElementById("panier-items");
const totalSpan = document.getElementById("total");
const btnCommander = document.getElementById("btn-commander");
const emailForm = document.getElementById("email-form");
const emailClientInput = document.getElementById("email-client");
const btnEnvoyerCommande = document.getElementById("envoyer-commande");

let panier = [];

// === MASQUER LE PANIER AU DÉBUT ===
panierDiv.style.display = "none";

// === AFFICHER / CACHER LE PANIER ===
iconePanier.addEventListener("click", () => {
    panierDiv.style.display = panierDiv.style.display === "none" ? "block" : "none";
});

// === AJOUTER AU PANIER ===
document.querySelectorAll(".achat").forEach(btn => {
    btn.addEventListener("click", () => {
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);

        const existing = panier.find(p => p.name === name);

        if (existing) {
            existing.qty++;
        } else {
            panier.push({ name, price, qty: 1 });
        }

        updatePanier();
    });
});

// === METTRE À JOUR L’AFFICHAGE DU PANIER ===
function updatePanier() {
    panierItems.innerHTML = "";
    let total = 0;

    panier.forEach((item, index) => {
        total += item.price * item.qty;

        const li = document.createElement("li");
        li.innerHTML = `
            ${item.name} - ${item.price}€ x ${item.qty}
            <div class="qte-controls">
                <button onclick="changerQte(${index}, 1)">+</button>
                <button onclick="changerQte(${index}, -1)">-</button>
                <button class="remove" onclick="supprimerItem(${index})">X</button>
            </div>
        `;

        panierItems.appendChild(li);
    });

    totalSpan.textContent = total.toFixed(2);
}

// === CHANGER QUANTITÉ ===
function changerQte(index, diff) {
    panier[index].qty += diff;
    if (panier[index].qty <= 0) panier.splice(index, 1);
    updatePanier();
}

// === SUPPRIMER UN PRODUIT ===
function supprimerItem(index) {
    panier.splice(index, 1);
    updatePanier();
}

// === AFFICHER LE FORMULAIRE EMAIL ===
btnCommander.addEventListener("click", () => {
    if (panier.length === 0) {
        alert("Votre panier est vide.");
        return;
    }
    emailForm.style.display = "block";
});

// === ENVOYER EMAILJS + REDIRECTION PAYPAL ===
btnEnvoyerCommande.addEventListener("click", () => {
    const email = emailClientInput.value.trim();
    if (!email) {
        alert("Veuillez entrer votre email.");
        return;
    }

    // Génération d’un numéro de commande
    const order_id = Math.floor(100000 + Math.random() * 900000);

    const items = panier
        .map(item => `${item.name} x ${item.qty} = ${item.price * item.qty}€`)
        .join("\n");

    const total = totalSpan.textContent;

    const orderId = Math.floor(100000 + Math.random() * 900000);  // 6 chiffres

    const params = {
        email_client: email,
        items: items,
        total: total,
        order_id: order_id
    };

    emailjs.send("service_d6t7i3n", "template_ngn8i66", params)
        .then(() => {
            alert("Votre commande est envoyée ! Redirection vers PayPal…");
            window.location.href = "https://paypal.me/StoreHelios";
        })
        .catch((e) => {
            console.log(e);
            alert("Erreur lors de l’envoi. Redirection vers PayPal malgré tout.");
            window.location.href = "https://paypal.me/StoreHelios";
        });
});



// ----- COMPTE À REBOURS -----
// ✔️ MODIFIE ICI LA DATE DU DROP
const targetDate = new Date("2026-01-20 18:00:00").getTime();

function updateBigCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
        document.getElementById("countdown-big").innerHTML = "00:00:00:00";
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    function pad(n) { return n.toString().padStart(2, "0"); }

    document.getElementById("countdown-big").innerHTML =
        `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

setInterval(updateBigCountdown, 1000);
updateBigCountdown();


document.querySelectorAll(".carousel").forEach(carousel => {
    const images = JSON.parse(carousel.dataset.images);
    const img = carousel.querySelector(".carousel-img");
    const btnLeft = carousel.querySelector(".carousel-btn.left");
    const btnRight = carousel.querySelector(".carousel-btn.right");
    const dotsContainer = carousel.querySelector(".dots");

    let index = 0;

    // Génération des dots
    images.forEach((_, i) => {
        const dot = document.createElement("span");
        if (i === 0) dot.classList.add("active");
        dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll("span");

    function updateCarousel() {
        img.src = images[index];
        dots.forEach(d => d.classList.remove("active"));
        dots[index].classList.add("active");
    }

    // Click flèches
    btnRight.addEventListener("click", () => {
        index = (index + 1) % images.length;
        updateCarousel();
    });

    btnLeft.addEventListener("click", () => {
        index = (index - 1 + images.length) % images.length;
        updateCarousel();
    });

    // Affichage flèches mobile
    carousel.addEventListener("touchstart", () => {
        btnLeft.style.opacity = "1";
        btnRight.style.opacity = "1";
        setTimeout(() => {
            btnLeft.style.opacity = "0";
            btnRight.style.opacity = "0";
        }, 1500);
    });

    // --- Swipe mobile ---
    let startX = 0;

    carousel.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX;
    });

    carousel.addEventListener("touchend", (e) => {
        let endX = e.changedTouches[0].clientX;

        if (startX - endX > 40) {
            index = (index + 1) % images.length;
            updateCarousel();
        } 
        else if (endX - startX > 40) {
            index = (index - 1 + images.length) % images.length;
            updateCarousel();
        }
    });
});
