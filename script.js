// 1. Данные для стран (на основе скриншота 3)
const countries = [
    "Россия",
    "Беларусь",
    "Казахстан",
    "Кыргызстан",
    "Армения",
    "Узбекистан"
];

function displayCountries() {
    const container = document.getElementById('country-list');
    if (!container) return;

    countries.forEach((country, index) => {
        const countryDiv = document.createElement('div');
        countryDiv.className = 'country-item';
        
        // Создаем HTML для каждой страны
        countryDiv.innerHTML = `
            <span>${country}</span>
            <input type="radio" name="selected_country" value="${country}" ${index === 0 ? 'checked' : ''}>
        `;
        container.appendChild(countryDiv);
    });
}


// 2. Загрузка и отображение товаров
async function loadProducts() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;
    
    try {
        // Замените '/products.json' на актуальный путь к вашему файлу
        const response = await fetch('products.json'); 
        const products = await response.json();

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            
            productCard.innerHTML = `
                <img src="${product.image_url}" alt="${product.name}" style="width:100%; height:150px; object-fit: cover;">
                <div class="product-card-info">
                    <p><strong>${product.name}</strong></p>
                    <p>${product.price_kg} $ за ${product.unit}</p>
                    <p class="description">${product.description}</p>
                    <div class="actions">
                        🛒
                    </div>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });

    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        productsContainer.innerHTML = '<p>Не удалось загрузить данные о товарах.</p>';
    }
}


// 3. Запуск функций при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    displayCountries();
});
