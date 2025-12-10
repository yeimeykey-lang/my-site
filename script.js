// -------------------------
// 1. Загрузка товаров из JSON
// -------------------------

let products = [];
const productsGrid = document.querySelector(".products-grid");
const searchInput = document.querySelector("#search");
const categoryButtons = document.querySelectorAll(".filter-btn");

// Загружаем JSON
fetch("products.json")
    .then(res => res.json())
    .then(data => {
        products = data;
        renderProducts(products);
    })
    .catch(err => console.error("Ошибка загрузки JSON:", err));


// -------------------------
// 2. Рендер товаров
// -------------------------

function renderProducts(list) {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";

    list.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        card.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <div class="price">${product.price} ₸</div>
            <button class="add-btn" onclick="addToCart(${product.id})">Добавить в корзину</button>
        `;

        // Открытие карточки товара
        card.addEventListener("click", (e) => {
            if (e.target.tagName !== "BUTTON") {
                window.location.href = `product.html?id=${product.id}`;
            }
        });

        productsGrid.appendChild(card);
    });
}


// -------------------------
// 3. Поиск
// -------------------------

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase();
        const filtered = products.filter(item =>
            item.title.toLowerCase().includes(value) ||
            item.description.toLowerCase().includes(value)
        );
        renderProducts(filtered);
    });
}


// -------------------------
// 4. Фильтры по категориям
// -------------------------

categoryButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const category = btn.dataset.category;

        if (category === "all") {
            renderProducts(products);
        } else {
            const filtered = products.filter(p => p.category === category);
            renderProducts(filtered);
        }
    });
});


// -------------------------
// 5. Корзина
// -------------------------

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(id) {
    let cart = getCart();
    const item = products.find(p => p.id === id);

    const exists = cart.find(p => p.id === id);

    if (exists) {
        exists.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }

    saveCart(cart);
    alert("Товар добавлен в корзину!");
}


// -------------------------
// 6. Отрисовка корзины (cart.html)
// -------------------------

function renderCart() {
    const cartContainer = document.querySelector(".cart-items");
    const totalPriceElement = document.querySelector(".total-price");

    if (!cartContainer) return;

    let cart = getCart();
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Корзина пуста</p>";
        if (totalPriceElement) totalPriceElement.textContent = "0 ₸";
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        const element = document.createElement("div");
        element.classList.add("cart-item");

        element.innerHTML = `
            <img src="${item.image}">
            <div class="info">
                <h3>${item.title}</h3>
                <p>${item.price} ₸</p>
                <p>Количество: ${item.quantity}</p>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Удалить</button>
        `;

        cartContainer.appendChild(element);
    });

    if (totalPriceElement) {
        totalPriceElement.textContent = total + " ₸";
    }
}

function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    renderCart();
}


// -------------------------
// 7. Страница товара product.html
// -------------------------

function renderProductPage() {
    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));

    const product = products.find(p => p.id === id);
    if (!product) return;

    const title = document.querySelector(".product-title");
    const img = document.querySelector(".product-img");
    const desc = document.querySelector(".product-desc");
    const price = document.querySelector(".product-price");

    if (title) title.textContent = product.title;
    if (desc) desc.textContent = product.description;
    if (img) img.src = product.image;
    if (price) price.textContent = product.price + " ₸";
}


// -------------------------
// 8. Авто-запуск нужных функций
// -------------------------

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
    renderProductPage();
});
