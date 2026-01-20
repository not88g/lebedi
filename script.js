document.addEventListener('DOMContentLoaded', () => {
    // 1. ДЕТЕКТОР APPLE (SAFARI/iOS) ДЛЯ ШРИФТА
    const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if (isApple) {
        document.body.classList.add('is-safari');
        console.log("Apple device detected: Font switched to Marker Felt");
    }

    const singlesContainer = document.getElementById('singles-container');
    const epsContainer = document.getElementById('eps-container');
    const BOT_USERNAME = 'dvalebedya_bot';

    // 2. ТАЙМЕР (С проверкой на наличие элемента)
    const releaseDate = new Date('2026-01-28T09:00:00').getTime();
    const timerElem = document.getElementById("countdown");

    if (timerElem) {
        const timerInterval = setInterval(() => {
            const now = new Date().getTime();
            const distance = releaseDate - now;

            if (distance < 0) {
                clearInterval(timerInterval);
                timerElem.innerHTML = "РЕЛИЗ ВЫШЕЛ!";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            timerElem.innerHTML = `${days}д ${hours}ч ${minutes}м ${seconds}с`;
        }, 1000);
    }

    let previewAudio = new Audio();

window.playPreview = function(url) {
    if (!previewAudio.paused) {
        previewAudio.pause();
    }

    previewAudio.src = url;
    previewAudio.currentTime = 40; // Стартуем с 40 секунды
    previewAudio.volume = 0; // Начинаем с тишины для fade-in
    previewAudio.play();

    // Fade-in (плавное появление за 1.5 сек)
    let fadeIn = setInterval(() => {
        if (previewAudio.volume < 0.9) {
            previewAudio.volume += 0.1;
        } else {
            clearInterval(fadeIn);
        }
    }, 150);

    // Fade-out и остановка через 15 секунд (на 55-й секунде)
    setTimeout(() => {
        let fadeOut = setInterval(() => {
            if (previewAudio.volume > 0.1) {
                previewAudio.volume -= 0.1;
            } else {
                clearInterval(fadeOut);
                previewAudio.pause();
            }
        }, 150);
    }, 13500); // Начинаем затухание чуть раньше конца (через 13.5 сек)
};


    // 3. ЗАГРУЗКА ДАННЫХ (data.json)
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (singlesContainer) singlesContainer.innerHTML = '';
            if (epsContainer) epsContainer.innerHTML = '';

            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'release-card';
                
                let btn = item.price === 0 
                    ? `<a href="${item.file}" class="buy-btn" download style="background:linear-gradient(#fff,#ccc);color:#000">💾 СКАЧАТЬ (FREE)</a>`
                    : `<a href="https://t.me/${BOT_USERNAME}?start=buy_${item.id}" class="buy-btn" target="_blank">КУПИТЬ: ${item.price} ⭐</a>`;

                const clickAction = item.type === 'ep' ? `onclick="showAlbumDetails('${item.id}')"` : '';

                card.innerHTML = `
                    <div ${clickAction} style="cursor:pointer">
                        <img src="${item.image}" alt="${item.title}" width="150" height="150">
                        <p><b>${item.title}</b></p>
                        <p style="font-size:11px">Дата: ${item.year}</p>
                    </div>
                    ${btn}
                `;
                
                if (item.type === 'single' && singlesContainer) singlesContainer.appendChild(card);
                else if (item.type === 'ep' && epsContainer) epsContainer.appendChild(card);
            });
        })
        .catch(err => {
            console.error('Ошибка AJAX:', err);
            if (singlesContainer) singlesContainer.innerHTML = 'Ошибка загрузки дискографии';
        });

    // 4. ПОП-АП АЛЬБОМА
    window.showAlbumDetails = function(albumId) {
    fetch('data.json')
        .then(r => r.json())
        .then(data => {
            // Если мы передали бонусный ID, данные всё равно берем из основного
            const isBonus = (albumId === 'perya_bonus_ep');
            const targetId = isBonus ? 'perya_ep' : albumId;
            
            const album = data.find(a => a.id === targetId);
            if (!album) return;

            const popup = document.getElementById('album-popup');
            
            // Настраиваем контент
            if (isBonus) {
                popup.querySelector('h2').innerText = album.title + " (ПРЕДЗАКАЗ)";
                popup.querySelector('.album-cover-glossy').src = "https://github.com/not88g/lebedi/raw/refs/heads/main/alt%20cover.png";
                const tracks = [...album.tracks, "8. стчпр!рем (SECRET BONUS)"];
                popup.querySelector('.tracklist-web2 ol').innerHTML = tracks.map(t => `<li>${t}</li>`).join('');
            } else {
                popup.querySelector('h2').innerText = album.title;
                popup.querySelector('.album-cover-glossy').src = album.image;
                popup.querySelector('.tracklist-web2 ol').innerHTML = album.tracks.map(t => `<li>${t}</li>`).join('');
            }

            // Добавляем кнопку превью, если это "Без слов" или "Перья"
            if (targetId === 'perya_ep' || targetId === 'no_words') {
                const previewBtn = `
                    <button onclick="playPreview('https://github.com/not88g/lebedi/raw/refs/heads/main/music/aftercare.m4a')" 
                            class="preview-btn" style="margin-top:10px; width:100%;">
                        ▶ ПОСЛУШАТЬ ОТРЫВОК (0:40)
                    </button>`;
                popup.querySelector('.tracklist-web2').insertAdjacentHTML('beforeend', previewBtn);
            }

            popup.style.display = 'block';
        });

    window.closeAlbumPage = () => {
        const p = document.getElementById('album-popup');
        if (p) p.style.display = 'none';
    };
});


