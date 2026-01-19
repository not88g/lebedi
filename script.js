// --- ЛОГИКА БАННЕРА И ТАЙМЕРА ---

// Целевая дата: 28 января 2026 года, 09:00
const releaseDate = new Date('2026-01-28T09:00:00').getTime();

// Обновляем таймер каждую секунду
const timerInterval = setInterval(function() {
    const now = new Date().getTime();
    const distance = releaseDate - now;

    // Расчеты времени
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Вывод в элемент
    const timerElement = document.getElementById("countdown");
    if (timerElement) {
        timerElement.innerHTML = days + "д " + hours + "ч " + minutes + "м " + seconds + "с ";
    }

    // Если время вышло
    if (distance < 0) {
        clearInterval(timerInterval);
        if (timerElement) timerElement.innerHTML = "!!! РЕЛИЗ ВЫШЕЛ !!!";
    }
}, 1000);

// Функции открытия и закрытия окна альбома
function openAlbumPage() {
    document.getElementById('album-popup').style.display = 'block';
}

function closeAlbumPage() {
    document.getElementById('album-popup').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const singlesContainer = document.getElementById('singles-container');
    const epsContainer = document.getElementById('eps-container');
    const BOT_USERNAME = 'dvalebebdya_bot';

    function createCard(item) {
        const card = document.createElement('div');
        card.className = 'release-card';
        
        let buttonHtml = '';
        
        // Логика кнопки: если цена 0 — кнопка скачать, иначе — в бота
        if (item.price === 0) {
            buttonHtml = `<a href="${item.file}" class="buy-btn" download style="background: linear-gradient(to bottom, #fff, #ccc); color: black;">💾 СКАЧАТЬ (FREE)</a>`;
        } else {
            const botLink = `https://t.me/${BOT_USERNAME}?start=buy_${item.id}`;
            buttonHtml = `<a href="${botLink}" class="buy-btn" target="_blank">КУПИТЬ: ${item.price} ⭐</a>`;
        }

        // Если это EP, добавляем обработчик клика на карточку для открытия треклиста
        const clickAttr = item.type === 'ep' ? `onclick="showAlbumDetails('${item.id}')"` : '';

        card.innerHTML = `
            <div ${clickAttr} style="cursor: ${item.type === 'ep' ? 'pointer' : 'default'}">
                <img src="${item.image}" alt="${item.title}" width="150" height="150">
                <p><b>${item.title}</b></p>
                <p style="font-size: 11px;">Дата: ${item.year}</p>
            </div>
            ${buttonHtml}
        `;
        return card;
    }

    // Функция для показа деталей EP (используется глобально)
    window.showAlbumDetails = function(albumId) {
        fetch('data.json')
            .then(r => r.json())
            .then(data => {
                const album = data.find(a => a.id === albumId);
                if (!album) return;

                const popup = document.getElementById('album-popup');
                popup.querySelector('h2').innerText = album.title;
                popup.querySelector('.album-cover-glossy').src = album.image;
                
                const list = popup.querySelector('.tracklist-web2 ol');
                list.innerHTML = album.tracks.map(t => `<li>${t}</li>`).join('');
                
                popup.style.display = 'block';
            });
    };

    // Загрузка
    fetch('data.json')
        .then(r => r.json())
        .then(data => {
            singlesContainer.innerHTML = '';
            epsContainer.innerHTML = '';
            data.forEach(item => {
                if (item.type === 'single') singlesContainer.appendChild(createCard(item));
                else epsContainer.appendChild(createCard(item));
            });
        });
});