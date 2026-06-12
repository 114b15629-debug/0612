const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let orbs = [];
let gravityMode = 'down'; // 'down' 或 'center'
let gameStarted = false;
let isMouseDown = false;
let mouseX = 0;
let mouseY = 0;

// 顏色池
const colors = ['#66fcf1', '#45f3ff', '#c5a1ff', '#ff007f', '#00ff66'];

// 初始化畫布大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- 事件監聽 ---

// Landing Page 按鈕
const startBtn = document.getElementById('start-btn');
const landingPage = document.getElementById('landing-page');
startBtn.addEventListener('click', () => {
    landingPage.classList.add('hidden');
    gameStarted = true;
});

// 滑鼠事件
window.addEventListener('mousedown', (e) => {
    if (!gameStarted) return;
    isMouseDown = true;
    updateMousePos(e);
});

window.addEventListener('mousemove', (e) => {
    if (!gameStarted) return;
    updateMousePos(e);
});

window.addEventListener('mouseup', () => {
    isMouseDown = false;
});

function updateMousePos(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

// 鍵盤事件
window.addEventListener('keydown', (e) => {
    if (!gameStarted) return;

    if (e.key === ' ') {
        gravityMode = (gravityMode === 'down') ? 'center' : 'down';
    }
    if (e.key === 'c' || e.key === 'C') {
        orbs = [];
    }
});

// --- 彈珠類別 (Orb Class) ---
class Orb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        // 隨機初始速度
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.radius = Math.random() * 10 + 8; // 半徑 8 ~ 18
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.lifespan = 1.0; // 生命值 1.0 -> 0.0
        this.decay = Math.random() * 0.005 + 0.002; // 消散速度
    }

    update() {
        let ax = 0;
        let ay = 0;

        // 計算引力加速度
        if (gravityMode === 'down') {
            ay = 0.2; // 向下重力
        } else if (gravityMode === 'center') {
            // 向中心點 (width/2, height/2) 的引力
            let cx = canvas.width / 2;
            let cy = canvas.height / 2;
            let dx = cx - this.x;
            let dy = cy - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // 歸一化並給予引力強度 0.3
            ax = (dx / dist) * 0.3;
            ay = (dy / dist) * 0.3;
        }

        // 速度與位置更新
        this.vx += ax;
        this.vy += ay;
        this.x += this.vx;
        this.y += this.vy;

        // 生命值減少
        this.lifespan -= this.decay;

        // 邊界碰撞（僅在向下重力模式下開啟，體驗較好）
        if (gravityMode === 'down') {
            // 左右牆壁
            if (this.x - this.radius < 0) {
                this.x = this.radius;
                this.vx *= -0.8;
            } else if (this.x + this.radius > canvas.width) {
                this.x = canvas.width - this.radius;
                this.vx *= -0.8;
            }
            // 地板
            if (this.y + this.radius > canvas.height) {
                this.y = canvas.height - this.radius;
                this.vy *= -0.7; // 彈力損耗
            }
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.lifespan;

        // 繪製外層發光暈影
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.lifespan * 0.2;
        ctx.fill();

        // 繪製核心主體
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.lifespan;
        ctx.fill();

        ctx.restore();
    }
}

// --- UI 資訊文字 ---
function drawUI() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const modeText = gravityMode === 'down' ? '⬇️ 常規重力' : '🌀 中心黑洞';
    ctx.fillText(`當前引力模式: ${modeText} (按空白鍵切換)`, 20, 20);
    ctx.fillText(`當前彈珠數量: ${orbs.length} (按 C 清空)`, 20, 45);
}

// --- 遊戲主迴圈 (Game Loop) ---
function gameLoop() {
    // 透過半透明黑色覆蓋，製造炫酷的動態殘影（Tail 效果）
    ctx.fillStyle = 'rgba(11, 12, 16, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameStarted) {
        // 如果滑鼠按著，每影格生成 1-2 顆彈珠
        if (isMouseDown) {
            orbs.push(new Orb(mouseX, mouseY));
        }

        // 更新與繪製彈珠
        for (let i = orbs.length - 1; i >= 0; i--) {
            orbs[i].update();
            orbs[i].draw();

            // 移除老化的彈珠
            if (orbs[i].lifespan <= 0) {
                orbs.splice(i, 1);
            }
        }

        // 繪製介面
        drawUI();
    }

    // 請求下一影格
    requestAnimationFrame(gameLoop);
}

// 啟動遊戲迴圈
gameLoop();