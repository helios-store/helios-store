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


