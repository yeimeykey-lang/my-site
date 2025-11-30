// Загружаем товары
async function loadProducts() {
    const res = await fetch("products.json");
    const products = await res.json();

    const grid = document.getElementById("product-grid");
    const rec = document.getElementById("recommend-grid");

    products.forEach((p, i) => {
        const item = document.createElement("div");
        item.className = "product";
        item.textContent = p.name;
        grid.appendChild(item);

        if (i < 6) {
            const r = document.createElement("div");
            r.className = "product";
            r.textContent = p.name;
            rec.appendChild(r);
        }
    });
}

loadProducts();

// Регистрация
document.getElementById("registerBtn").onclick = () => {
    const name = document.getElementById("userName").value;
    const gender = document.querySelector("input[name='gender']:checked");

    if (!name) {
        document.getElementById("status").textContent = "Введите имя.";
        return;
    }
    if (!gender) {
        document.getElementById("status").textContent = "Выберите пол.";
        return;
    }

    document.getElementById("status").textContent =
        "Регистрация успешна (фейк, без бэкенда).";
};
