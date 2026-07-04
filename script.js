// Проверяем локальную память
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

// Элементы
const videoGrid = document.getElementById('videoGrid');
const authBlock = document.getElementById('authBlock');
const authModal = document.getElementById('authModal');
const commentForm = document.getElementById('commentForm');
const commentAuthWarning = document.getElementById('commentAuthWarning');

// Главный запуск
document.addEventListener("DOMContentLoaded", () => {
    // Безопасно проверяем элементы, чтобы код не «падал» при загрузке
    if (authBlock) {
        updateAuthUI();
    }
    if (videoGrid) {
        renderVideos();
    }
    
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
});

function showSection(sectionId) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.remove('hidden');
    if (sectionId === 'main-page') renderVideos();
}

// Принудительное обновление кнопок входа
function updateAuthUI() {
    if (!authBlock) return;
    
    if (currentUser) {
        let nameHTML = currentUser.isOwner 
            ? `<span class="owner-nickname">Admin <span class="owner-tag">Владелец</span></span>`
            : `<span style="color:#60a5fa; font-weight:500; font-size:0.9rem;">🔹 ${currentUser.name}</span>`;
            
        authBlock.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
                ${nameHTML} 
                <button onclick="logout()" class="btn btn-secondary" style="padding: 4px 10px; font-size:0.75rem; border-radius:12px; white-space:nowrap;">Выйти</button>
            </div>`;
            
        if (commentForm) commentForm.classList.remove('hidden');
        if (commentAuthWarning) commentAuthWarning.classList.add('hidden');
        
        const adminBtn = document.getElementById('adminPanelBtn');
        if (adminBtn) {
            if (currentUser.isOwner) adminBtn.classList.remove('hidden');
            else adminBtn.classList.add('hidden');
        }
    } else {
        // Жестко прописываем кнопку войти, если никто не авторизован
        authBlock.innerHTML = `<button onclick="openAuthModal()" class="btn btn-primary" style="padding: 6px 14px; font-size:0.85rem; white-space:nowrap;">Войти</button>`;
        if (commentForm) commentForm.classList.add('hidden');
        if (commentAuthWarning) commentAuthWarning.classList.remove('hidden');
        
        const adminBtn = document.getElementById('adminPanelBtn');
        if (adminBtn) adminBtn.classList.add('hidden');
    }
}

function openAuthModal() { 
    if (authModal) authModal.classList.remove('hidden'); 
}
function closeAuthModal() { 
    if (authModal) authModal.classList.add('hidden'); 
}

function simulateGoogleLogin(isAdminRole) {
    if (isAdminRole) {
        const password = prompt("Введите секретный код владельца:");
        if (password === '12MendalKaisuu21') { 
            currentUser = { name: 'Admin', isOwner: true };
            alert("Доступ разрешен. Добро пожаловать, Владелец!");
        } else {
            alert("Неверный пароль! Доступ заблокирован.");
            return; 
        }
    } else {
        const randomNames = ["Google_User77", "X_Gamer_X", "ScriptHub", "KaisuFan"];
        const chosenName = randomNames[Math.floor(Math.random() * randomNames.length)];
        currentUser = { name: chosenName, isOwner: false };
    }

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    closeAuthModal();
    if (currentVideoId) watchVideo(currentVideoId);
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showSection('main-page');
}

function renderVideos(searchQuery = "") {
    if (!videoGrid) return;
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    videoGrid.innerHTML = "";
    
    const filtered = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filtered.length === 0) {
        videoGrid.innerHTML = "<p style='grid-column: 1/-1; text-align:center; color:var(--text-muted);'>Ничего не найдено.</p>";
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
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    const query = searchInput.value;
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = query ? `Результаты поиска: "${query}"` : "Рекомендации";
    showSection('main-page');
    renderVideos(query);
}

function watchVideo(id) {
    currentVideoId = id;
    const videos = JSON.parse(localStorage.getItem('videos')) || [];
    const video = videos.find(v => v.id === id);
    if (!video) return;

    showSection('watch-page');
    
    const watchTitle = document.getElementById('watchTitle');
    const watchDesc = document.getElementById('watchDesc');
    const watchAuthor = document.getElementById('watchAuthor');
    const playerWrapper = document.getElementById('videoPlayerWrapper');
    
    if (watchTitle) watchTitle.textContent = video.title;
    if (watchDesc) watchDesc.textContent = video.desc;
    if (watchAuthor) {
        watchAuthor.innerHTML = `
            <div style="font-weight:bold; color:white;">Admin <span class="owner-tag">Владелец</span></div>
            <div style="font-size:0.8rem; color:var(--text-muted);">Автор канала</div>
        `;
    }

    if (playerWrapper) {
        if (video.url.length === 11 || !video.url.includes('.')) {
            playerWrapper.innerHTML = `<iframe src="https://youtube.com{video.url}" allowfullscreen></iframe>`;
        } else {
            playerWrapper.innerHTML = `<video src="${video.url}" controls autoplay></video>`;
        }
    }

    renderComments(video.comments || []);
}

function renderComments(comments) {
    const commentsCount = document.getElementById('commentsCount');
    const list = document.getElementById('commentsList');
    if (commentsCount) commentsCount.textContent = comments.length;
    if (!list) return;
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

if (commentForm) {
    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser || !currentVideoId) return;

        const commentInput = document.getElementById('commentInput');
        if (!commentInput) return;
        const text = commentInput.value.trim();
        if (!text) return;

        const videos = JSON.parse(localStorage.getItem('videos')) || [];
        const videoIndex = videos.findIndex(v => v.id === currentVideoId);
        
        if (videoIndex !== -1) {
            if (!videos[videoIndex].comments) videos[videoIndex].comments = [];
            videos[videoIndex].comments.push({
                user: currentUser.name,
                text: text,
                isOwner: currentUser.isOwner
            });
            localStorage.setItem('videos', JSON.stringify(videos));
            commentInput.value = "";
            renderComments(videos[videoIndex].comments);
        }
    });
}

const addVideoForm = document.getElementById('addVideoForm');
if (addVideoForm) {
    addVideoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!currentUser || !currentUser.isOwner) {
            alert("Ошибка прав доступа!");
            return;
        }

        const title = document.getElementById('videoTitleInput').value.trim();
        const url = document.getElementById('videoUrlInput').value.trim();
        const desc = document.getElementById('videoDescInput').value.trim();

        const videos = JSON.parse(localStorage.getItem('videos')) || [];
        const newVideo = {
            id: Date.now(),
            title: title,
            url: url,
            desc: desc,
            comments: []
        };

        videos.push(newVideo);
      localStorage.setItem('videos', JSON.stringify(videos));e.target.reset();showSection('main-page');});}
