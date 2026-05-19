// ── GAME LOGIC ────────────────────────────────────────────────────────────────
const BOTNOI_TOKEN = "SmFdAPcc8g4D7lWauhzhgerpxsge4bII";
let currentHistory = "";
let turnCount = 0;
let currentAudio = null;
let gameMode = "AI";
let currentTheme = "";

const offlineData = {
    "start": {
        story: "กาลครั้งหนึ่งนานมาแล้ว มีมดแดงตัวน้อยชื่อ 'แดง' อาศัยอยู่ในรังใหญ่ใต้ต้นมะม่วง วันหนึ่งแดงพบว่าเสบียงในรังกำลังจะหมดลง แดงควรทำอย่างไร?",
        image_prompt: "Red ant in a big nest under a mango tree, storybook style",
        choices: [
            { text: "ออกไปหาอาหารคนเดียว", next: "find_alone" },
            { text: "ชวนเพื่อนมดไปด้วยกัน", next: "find_team" }
        ]
    },
    "find_alone": {
        story: "แดงเดินไปเรื่อยๆ จนพบน้ำหวานหยดใหญ่ แต่จู่ๆ ก็มีฝนตกลงมา แดงจะหลบฝนที่ไหน?",
        image_prompt: "Red ant in the rain looking for shelter",
        choices: [
            { text: "หลบใต้ใบไม้แห้ง", next: "leaf_fail" },
            { text: "รีบวิ่งกลับรัง", next: "run_back" }
        ]
    },
    "find_team": {
        story: "แดงและเพื่อนๆ ช่วยกันแบกน้ำตาลก้อนใหญ่กลับรัง ระหว่างทางเจอเจ้าตั๊กแตนขวางทางอยู่",
        image_prompt: "Team of ants carrying sugar, meeting grasshopper",
        choices: [
            { text: "ขอทางดีๆ", next: "talk_end" },
            { text: "หาทางเดินอ้อมไป", next: "bypass_end" }
        ]
    },
    "talk_end": { story: "ตั๊กแตนใจดีช่วยแบกของมาส่งถึงรัง มดทุกตัวอิ่มท้องและมีความสุข จบนิทานกตัญญู", image_prompt: "Happy ants and grasshopper, storybook", choices: [], is_ending: true },
    "bypass_end": { story: "พวกมดเดินอ้อมจนถึงรังอย่างปลอดภัย แม้จะเหนื่อยแต่ทุกคนก็ภูมิใจในความสามัคคี จบนิทาน", image_prompt: "Successful ant team at home", choices: [], is_ending: true },
    "leaf_fail": { story: "ใบไม้ปลิวไปตามลม แดงเปียกฝนจนเป็นหวัด แต่สุดท้ายเพื่อนก็มารับกลับรัง จบนิทาน", image_prompt: "Sad wet ant in forest", choices: [], is_ending: true },
    "run_back": { story: "แดงวิ่งสุดชีวิตจนถึงรังทันเวลา แม้ไม่ได้อาหารแต่ก็ได้บทเรียนเรื่องความปลอดภัย จบนิทาน", image_prompt: "Ant running to nest", choices: [], is_ending: true }
};

function stopCurrentAudio() {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

function startCustomGame() {
    const theme = document.getElementById('custom-theme').value;
    if (!theme) { alert("พิมพ์ธีมก่อนนะ!"); return; }
    startGame('AI_STORY', theme);
}

function startGame(mode, theme) {
    gameMode = mode;
    currentTheme = theme;
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('game-view').style.display = 'block';
    document.getElementById('game-title').innerText = theme;
    currentHistory = "";
    turnCount = 0;
    stopCurrentAudio();

    if (mode === 'OFFLINE') {
        processTurn("start");
    } else {
        processTurn(`เริ่มนิทานในธีม: ${theme}`);
    }
}

function exitGame() {
    stopCurrentAudio();
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('game-view').style.display = 'none';
}

async function processTurn(action) {
    stopCurrentAudio();
    const loadingText = document.getElementById('loading-text');
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'flex';

    let data;
    if (gameMode === 'OFFLINE') {
        data = offlineData[action] || offlineData["start"];
    } else {
        loadingText.innerText = "มดแดง AI กำลังจินตนาการ...";
        try {
            const res = await fetch('https://redant-ojq8.onrender.com/api/generate-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: action, history: currentHistory, turnCount: turnCount, theme: currentTheme })
            });
            data = await res.json();
            currentHistory += `Action: ${action}\nStory: ${data.story}\n`;
            turnCount++;
        } catch (e) {
            document.getElementById('story-display').innerHTML = "<span style='color: red;'>เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่</span>";
            document.getElementById('choice-list').innerHTML = "";
            overlay.style.display = 'none';
            return;
        }
    }

    renderStory(data);

    // 🎨 ระบบเจนภาพสด (Fixed Version 2026 - ล็อคสไตล์นิทาน)
    const sceneImg = document.getElementById('scene-img');
    const imgPrompt = data.image_prompt || currentTheme;

    if (imgPrompt) {
        const randomSeed = Math.floor(Math.random() * 1000000);

        const fixedPrompt = `Cute storybook style, ${imgPrompt}`;

        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(fixedPrompt)}?width=800&height=450&model=flux&nologo=true&seed=${randomSeed}`;

        console.log("Image URL ที่ล็อคสไตล์แล้ว:", imageUrl);

        sceneImg.style.opacity = '0';

        const tempImg = new Image();
        tempImg.src = imageUrl;
        tempImg.onload = () => {
            sceneImg.src = imageUrl;
            sceneImg.style.opacity = '1';
        };

        // 🚨 แผนสำรองถ้า AI เจนรูปไม่สำเร็จ
        tempImg.onerror = () => {
            // ใช้รูป Unsplash ธีม Fantasy แทน
            sceneImg.src = `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop&sig=${randomSeed}`;
            sceneImg.style.opacity = '1';
        };
    }

    // 🔊 เสียงพากย์ (เช็คสวิตช์ก่อนยิงพ้อยต์)
    const isVoiceEnabled = document.getElementById('voice-toggle').checked;
    if (isVoiceEnabled && (data.story || data.text)) {
        loadingText.innerText = "กำลังสร้างเสียงพากย์คุณงาม... 🎧";
        await playVoice(data.story || data.text);
    }

    overlay.style.display = 'none';
}

function renderStory(data) {
    document.getElementById('story-display').innerText = data.story || data.text || "เกิดข้อผิดพลาดในการโหลดเนื้อเรื่อง";
    const choiceBox = document.getElementById('choice-list');
    choiceBox.innerHTML = '';

    // ── Show / hide Director Mode + Custom Action based on story state ──
    const directorSection = document.querySelector('.director-mode-section');
    if (directorSection) {
        directorSection.style.display = data.is_ending ? 'none' : '';
    }
    const customActionArea = document.querySelector('.custom-action-area');
    if (customActionArea) {
        customActionArea.style.display = data.is_ending ? 'none' : '';
    }

    if (data.is_ending) {
        // Build personality stat bars if AI returned stats
        if (data.stats && Array.isArray(data.stats) && data.stats.length > 0) {
            const statsHTML = `
                <div class="stats-container">
                    <p class="stats-title">✨ บุคลิกภาพของคุณ</p>
                    ${data.stats.map(s => `
                        <div class="stat-row">
                            <div class="stat-label-row">
                                <span class="stat-name">${s.trait}</span>
                                <span class="stat-pct">${s.value}%</span>
                            </div>
                            <div class="stat-track">
                                <div class="stat-fill" data-value="${s.value}"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>`;
            choiceBox.innerHTML = statsHTML;

            // Trigger the bar animations after a short delay (allows CSS transition to play)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    choiceBox.querySelectorAll('.stat-fill').forEach(bar => {
                        bar.style.width = bar.getAttribute('data-value') + '%';
                    });
                });
            });
        }

        // Append exit button below the stats
        const exitBtn = document.createElement('button');
        exitBtn.className = 'choice-btn';
        exitBtn.style.textAlign = 'center';
        exitBtn.style.marginTop = data.stats ? '20px' : '0';
        exitBtn.innerHTML = '🏠 จบนิทาน (กลับหน้าหลัก)';
        exitBtn.onclick = exitGame;
        choiceBox.appendChild(exitBtn);

    } else {
        const choices = data.choices || [];
        choices.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = (c.text || c);
            btn.onclick = () => processTurn(c.next || c);
            choiceBox.appendChild(btn);
        });
    }
}

async function playVoice(text) {
    try {
        const res = await fetch('https://api-voice.botnoi.ai/openapi/v1/generate_audio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'botnoi-token': BOTNOI_TOKEN },
            body: JSON.stringify({ text: text, speaker: "3", volume: 1, speed: 1.25, type_media: "mp3", save_file: "true", language: "th" })
        });
        const audioData = await res.json();
        if (audioData.audio_url) {
            currentAudio = new Audio(audioData.audio_url);
            await currentAudio.play().catch(e => console.log("Voice Play Interrupted"));
        }
    } catch (e) { console.error("Voice Error:", e); }
}

// ── DIRECTOR MODE ──────────────────────────────────────────────────
function submitDirectorText() {
    const textarea = document.getElementById('director-textarea');
    const text = textarea.value.trim();
    if (!text) {
        textarea.classList.add('director-textarea--shake');
        setTimeout(() => textarea.classList.remove('director-textarea--shake'), 500);
        return;
    }
    textarea.value = '';
    processTurn(text);
}

// ── CUSTOM ACTION (Open-Ended RPG) ─────────────────────────────────
function submitCustomAction() {
    const input = document.getElementById('custom-action-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    processTurn(text);
}

// Enter key submits the custom action input
document.getElementById('custom-action-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        submitCustomAction();
    }
});

// ── VOICE COMMAND (SpeechRecognition) ─────────────────────────────
function startVoiceCommand() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert('เบราว์เซอร์นี้ไม่รองรับการสั่งงานด้วยเสียง กรุณาใช้ Chrome');
        return;
    }

    const micBtn = document.getElementById('mic-btn');
    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => micBtn.classList.add('listening');
    recognition.onend = () => micBtn.classList.remove('listening');
    recognition.onerror = () => micBtn.classList.remove('listening');

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        if (transcript) {
            const input = document.getElementById('custom-action-input');
            input.value = transcript;
            input.focus();
        }
    };

    recognition.start();
}

// ── FILTER BAR LOGIC ──────────────────────────────────────────────
(function () {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('#story-grid .story-card');

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            // 1. Update active button state
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');

            // 2. Filter cards
            var filter = btn.getAttribute('data-filter'); // e.g. "ai", "offline", "adventure", "fantasy", "all"

            cards.forEach(function (card) {
                if (filter === 'all') {
                    card.classList.remove('hidden');
                } else {
                    var cats = card.getAttribute('data-category') || '';
                    if (cats.split(' ').indexOf(filter) !== -1) {
                        card.classList.remove('hidden');
                    } else {
                        card.classList.add('hidden');
                    }
                }
            });
        });
    });
})();

// ── DARK MODE TOGGLE ──────────────────────────────────────────────
(function () {
    var btn = document.getElementById('theme-toggle-btn');
    var html = document.documentElement;

    // Apply saved preference immediately (before paint)
    if (localStorage.getItem('redant-theme') === 'dark') {
        html.setAttribute('data-theme', 'dark');
        btn.textContent = '☀️';
    }

    btn.addEventListener('click', function () {
        var isDark = html.getAttribute('data-theme') === 'dark';
        if (isDark) {
            html.removeAttribute('data-theme');
            btn.textContent = '🌙';
            localStorage.setItem('redant-theme', 'light');
        } else {
            html.setAttribute('data-theme', 'dark');
            btn.textContent = '☀️';
            localStorage.setItem('redant-theme', 'dark');
        }
    });
})();
