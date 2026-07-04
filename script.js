// Хранилище видео в локальной памяти браузера
if (!localStorage.getItem('videos')) {
    localStorage.setItem('videos', JSON.stringify([
        {
            id: 1,
            title: "Гайд по Kaisu Script (Тестовое видео)",
            url: "dQw4w9WgXcQ", 
            desc: "Добро пожаловать на новый стильный сайт Kaisu script! Теперь видео отображаются в адаптивной премиальной сетке.",
            comments: [{ user: "BloxFruitsFan", text: "Сайт стал просто пушка! 🔥", isOwner: false }]
        }
    ]));
}

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let currentVideoId = null;

const videoGrid = document.getElementById('videoGrid');
const authBlock = document.getElementById('authBlock');
const authModal = document.getElementById('authModal');
const commentForm = document.getElementById('commentForm');
const commentAuthWarning = document.getElementById('commentAuthWarning');

document.addEventListener("DOMContentLoaded", () => {
    updateAuthUI();
    renderVideos();
    
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
});

function showSection(sectionId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
    if(sectionId === 'main-page') renderVideos();
}

function updateAuthUI() {
    if (currentUser) {
        let nameHTML = currentUser.isOwner 
            ? `<span class="owner-nickname">Admin <span class="owner-tag">Владелец</span></span>`
            : `<span style="color:#60a5fa; font-weight:500;">🔹 ${currentUser.name}</span>`;
            
        authBlock.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
                ${nameHTML} 
                <button onclick="logout()" class="btn btn-secondary" style="padding: 4px 12px; font-size:0.8rem; border-radius:12px;">Выйти</button>
            </div>`;
        commentForm.classList.remove('hidden');
        commentAuthWarning.classList.add('hidden');
        
        if (currentUser.isOwner) {
            document.getElementById('adminPanelBtn').classList.remove('hidden');
        } else {
            document.getElementById('adminPanelBtn').classList.add('hidden');
        }
    } else {
        authBlock.innerHTML = `<button onclick="openAuthModal()" class="btn btn-primary" style="padding: 6px 16px; font-size:0.85rem;">Войти</button>`;
        commentForm.classList.add('hidden');
        commentAuthWarning.classList.remove('hidden');
        document.getElementById('adminPanelBtn').classList.add('hidden');
    }
}

function openAuthModal() { authModal.classList.remove('hidden'); }
function closeAuthModal() { authModal.classList.add('hidden'); }

// Вход через Google или по вашему секретному паролю
function simulateGoogleLogin(isAdminRole) {
    if (isAdminRole) {
        // Всплывающее окно для ввода секретного пароля
        const password = prompt("Введите секретный код владельца:");
        
        // Сверка пароля
        if (password === '12MendalKaisuu21') { 
            currentUser = { name: 'Admin', isOwner: true };
            alert("Доступ разрешен. Добро пожаловать, Владелец!");
        } else {
            alert("Неверный пароль! Доступ к панели публикации заблокирован.");
            return; 
        }
    } else {
        // Симуляция входа пользователя через Google
        const randomNames = ["Google_User77", "X_Gamer_X", "ScriptHub", "KaisuFan"];
        const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)];
        currentUser = { name: chosenName, isOwner: false };
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    if(currentVideoId) watchVideo(currentVideoId);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showSection('main-page');
}

function renderVideos(searchQuery = "") {
    const videos = JSON.parse(localStorage.getItem('videos'));
    videoGrid.innerHTML = "";
    
    const filtered = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filtered.length === 0) {
        videoGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; color:var(--text-muted);'>Ничего не найдено по вашему запросу.</p>";
        return;
    }

    filtered.forEach(video => {
        const item = document.createElement('div');
        item.className = 'video-item';
        item.onclick = () => watchVideo(video.id);
        item.innerHTML = `
            <div class="thumbnail-placeholder">▶</div>
            <div class="video-info">
                <h3>${video.title}</h3>
                <small style="color:var(--text-muted); display:flex; align-items:center; gap:4px;">
                   <span class="material-symbols-outlined" style="font-size:14px;">visibility</span> Посмотреть ролик
                </small>
            </div>
        `;
        videoGrid.appendChild(item);
    });
}

function handleSearch() {
    const query = document.getElementById('searchInput').value;
    document.getElementById('pageTitle').textContent = query ? `Результаты поиска: "${query}"` : "Рекомендации";
    showSection('main-page');
    renderVideos(query);
}

function watchVideo(id) {
    currentVideoId = id;
    const videos = JSON.parse(localStorage.getItem('videos'));
    const video = videos.find(v => v.id === id);
    if (!video) return;

    showSection('watch-page');
    document.getElementById('watchTitle').textContent = video.title;
    document.getElementById('watchDesc').textContent = video.desc;
    
    document.getElementById('watchAuthor').innerHTML = `
        <div style="font-weight:bold; color:white;">Admin <span class="owner-tag">Владелец</span></div>
        <div style="font-size:0.8rem; color:var(--text-muted);">Автор канала</div>
    `;

    const playerWrapper = document.getElementById('videoPlayerWrapper');
    if (video.url.length === 11 || !video.url.includes('.')) {
        playerWrapper.innerHTML = `<iframe src="https://youtube.com{video.url}" allowfullscreen></iframe>`;
    } else {
        playerWrapper.innerHTML = `<video src="${video.url}" controls autoplay></video>`;
    }

    renderComments(video.comments);
}

function renderComments(comments) {
    document.getElementById('commentsCount').textContent = comments.length;
    const list = document.getElementById('commentsList');
    list.innerHTML = "";

    comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment-node';
        
        let userHTML = c.isOwner 
            ? `<span class="owner-nickname">Admin <span class="owner-tag">Владелец</span></span>`
            : `<span style="color:#60a5fa; font-weight:500;">🔹 ${c.user}</span>`;

        div.innerHTML = `
            <div class="comment-user">${userHTML}</div>
            <div class="comment-text" style="padding-left: 4px; color:#e4e4e7;">${c.text}</div>
        `;
        list.appendChild(div);
    });
}

commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser || !currentVideoId) return;

    const text = document.getElementById('commentInput').value.trim();
    if (!text) return;

    const videos = JSON.parse(localStorage.getItem('videos'));
    const videoIndex = videos.findIndex(v => v.id === currentVideoId);
    
    if (videoIndex !== -1) {
        videos[videoIndex].comments.push({
            user: currentUser.name,
            text: text,
            isOwner: currentUser.isOwner
        });
        localStorage.setItem('videos', JSON.stringify(videos));
        document.getElementById('commentInput').value = "";
        renderComments(videos[videoIndex].comments);
    }
});

document.getElementById('addVideoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.isOwner) {
        alert("Ошибка прав доступа!");
        return;
    }

    const title = document.getElementById('videoTitleInput').value.trim();
    const url = document.getElementById('videoUrlInput').value.trim();
    const desc = document.getElementById('videoDescInput').value.trim();

    const videos = JSON.parse(localStorage.getItem('videos'));
    const newVideo = {
        id: Date.now(),
        title: title,
        url: url,
        desc: desc,
        comments: []
    };

    videos.push(newVideo);
    localStorage.setItem('videos', JSON.stringify(videos));
    
    e.target.reset();
    showSection('main-page');
});
