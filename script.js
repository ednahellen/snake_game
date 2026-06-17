// ===== MENU RESPONSIVO =====
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
    menuToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
});

// Fechar menu ao clicar em um link
document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navLinks.classList.remove("active");
    });
});

// ===== ROLAGEM SUAVE =====
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});

// ===== CONTADOR ANIMADO =====
const counter = document.getElementById("counter");
if (counter) {
    let value = 0;
    const interval = setInterval(() => {
        value += 5;
        counter.textContent = value;
        if (value >= 500) {
            clearInterval(interval);
        }
    }, 20);
}

// ===== BOTÃO VOLTAR AO TOPO =====
const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
        topBtn.style.display = "block";
        topBtn.style.opacity = "1";
    } else {
        topBtn.style.opacity = "0";
        setTimeout(() => {
            if (window.scrollY <= 400) {
                topBtn.style.display = "none";
            }
        }, 300);
    }
});

topBtn.addEventListener("click", () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});

// ===== ANIMAÇÃO AO ROLAR (REVEAL) =====
const reveals = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
        }
    });
}, {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
});

reveals.forEach(item => {
    revealObserver.observe(item);
});

// ===== MODAL DA GALERIA =====
const images = document.querySelectorAll(".gallery-img");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const closeModal = document.getElementById("closeModal");

images.forEach(img => {
    img.addEventListener("click", () => {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        modalImg.src = img.src;
        modalImg.alt = img.alt;
    });
});

// Fechar modal
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
});

modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
});

// ===== JOGO SNAKE - JARDIM DO ÉDEN =====

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");

// ===== ÁUDIO =====
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playEatSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 700;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function playHitSound() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 150;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.value = 0.15;
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
}

// ===== CONFIGURAÇÕES =====
const grid = 25;
const size = 20;

let snake, dx, dy, score, food;
let particles = [];
let texts = [];
let trees = [];
let speed = 200;
let loop = null;
let gameRunning = true;

// Posições especiais
const adam = { x: 5, y: 18 };
const eve = { x: 20, y: 6 };

// ===== HIGH SCORE =====
let best = parseInt(localStorage.getItem("snake-best") || 0);
bestEl.textContent = best;

// ===== INICIALIZAÇÃO =====
function initGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    score = 0;
    gameRunning = true;
    scoreEl.textContent = 0;
    particles = [];
    texts = [];
    trees = [
        { x: 8, y: 8 },
        { x: 18, y: 15 },
        { x: 3, y: 22 },
        { x: 22, y: 3 }
    ];
    spawnFood();
}

function spawnFood() {
    let newFood;
    let valid = false;
    while (!valid) {
        newFood = {
            x: Math.floor(Math.random() * grid),
            y: Math.floor(Math.random() * grid)
        };
        valid = true;
        // Não pode spawnar em cima da cobra
        for (const s of snake) {
            if (s.x === newFood.x && s.y === newFood.y) {
                valid = false;
                break;
            }
        }
        // Não pode spawnar em cima das árvores
        for (const t of trees) {
            if (t.x === newFood.x && t.y === newFood.y) {
                valid = false;
                break;
            }
        }
        // Não pode spawnar em cima de Adão ou Eva
        if ((adam.x === newFood.x && adam.y === newFood.y) ||
            (eve.x === newFood.x && eve.y === newFood.y)) {
            valid = false;
        }
    }
    food = newFood;
}

// ===== REINICIAR =====
function restartGame() {
    clearInterval(loop);
    speed = 200;
    initGame();
    startLoop();
}

// ===== LOOP =====
function startLoop() {
    clearInterval(loop);
    loop = setInterval(() => {
        if (gameRunning) {
            update();
            draw();
        }
    }, speed);
}

// ===== DRAW FUNCTIONS =====
function drawApple() {
    const x = food.x * size + size / 2;
    const y = food.y * size + size / 2;
    
    // Brilho da maçã
    const gradient = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, 10);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#dc2626');
    
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Brilho
    ctx.beginPath();
    ctx.arc(x - 3, y - 4, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
}

function drawTrees() {
    trees.forEach(tree => {
        const px = tree.x * size;
        const py = tree.y * size;

        // Tronco
        ctx.fillStyle = "#6b4423";
        ctx.fillRect(px + 7, py + 10, 6, 12);
        
        // Copa da árvore
        ctx.beginPath();
        ctx.arc(px + 10, py + 8, 11, 0, Math.PI * 2);
        ctx.fillStyle = "#22c55e";
        ctx.fill();
        
        // Frutinha
        ctx.beginPath();
        ctx.arc(px + 14, py + 4, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ef4444";
        ctx.fill();
    });
}

function drawAdam() {
    // Efeito glow
    ctx.shadowColor = 'rgba(251, 191, 36, 0.3)';
    ctx.shadowBlur = 15;
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("👨", adam.x * size - 2, adam.y * size + 20);
    ctx.shadowBlur = 0;
}

function drawEve() {
    ctx.shadowColor = 'rgba(244, 114, 182, 0.3)';
    ctx.shadowBlur = 15;
    ctx.font = "24px Arial";
    ctx.fillStyle = "#f472b6";
    ctx.fillText("👩", eve.x * size - 2, eve.y * size + 20);
    ctx.shadowBlur = 0;
}

function drawSnake() {
    snake.forEach((s, i) => {
        const x = s.x * size + 10;
        const y = s.y * size + 10;
        const radius = i === 0 ? 9 : 8;
        
        // Cabeça com glow
        if (i === 0) {
            ctx.shadowColor = 'rgba(34, 197, 94, 0.4)';
            ctx.shadowBlur = 15;
        }
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (i === 0) {
            const gradient = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, radius);
            gradient.addColorStop(0, '#4ade80');
            gradient.addColorStop(1, '#22c55e');
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = '#4ade80';
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Olhos da cobra (cabeça)
        if (i === 0) {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x - 4, y - 3, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 4, y - 3, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#1f2937';
            ctx.beginPath();
            ctx.arc(x - 3, y - 2, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 5, y - 2, 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawEffects() {
    texts.forEach(t => {
        ctx.shadowColor = 'rgba(250, 204, 21, 0.5)';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#facc15';
        ctx.font = "bold 22px Arial";
        ctx.fillText(t.text, t.x, t.y);
        t.y -= 1.5;
        t.life--;
        ctx.shadowBlur = 0;
    });
    texts = texts.filter(t => t.life > 0);
}

function draw() {
    ctx.clearRect(0, 0, 500, 500);
    
    // Grid sutil
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= grid; i++) {
        ctx.beginPath();
        ctx.moveTo(i * size, 0);
        ctx.lineTo(i * size, 500);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * size);
        ctx.lineTo(500, i * size);
        ctx.stroke();
    }
    
    drawApple();
    drawTrees();
    drawAdam();
    drawEve();
    drawSnake();
    drawEffects();
}

// ===== UPDATE =====
function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Colisão com bordas
    if (head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid) {
        collision();
        gameRunning = false;
        clearInterval(loop);
        return;
    }

    // Colisão com árvores
    for (const tree of trees) {
        if (head.x === tree.x && head.y === tree.y) {
            collision();
            gameRunning = false;
            clearInterval(loop);
            return;
        }
    }

    // Colisão com Adão
    if (head.x === adam.x && head.y === adam.y) {
        collision();
        gameRunning = false;
        clearInterval(loop);
        return;
    }

    // Colisão com Eva
    if (head.x === eve.x && head.y === eve.y) {
        collision();
        gameRunning = false;
        clearInterval(loop);
        return;
    }

    // Colisão com o próprio corpo
    if (snake.some(p => p.x === head.x && p.y === head.y)) {
        collision();
        gameRunning = false;
        clearInterval(loop);
        return;
    }

    snake.unshift(head);

    // Comeu a fruta
    if (head.x === food.x && head.y === food.y) {
        playEatSound();
        score++;
        scoreEl.textContent = score;
        texts.push({
            text: "+1 🍎",
            x: food.x * size,
            y: food.y * size - 10,
            life: 40
        });

        if (score > best) {
            best = score;
            bestEl.textContent = best;
            localStorage.setItem("snake-best", best);
        }

        spawnFood();
        
        // Aumenta velocidade gradualmente
        if (speed > 80 && score % 5 === 0) {
            speed -= 8;
            clearInterval(loop);
            startLoop();
        }
    } else {
        snake.pop();
    }
}

// ===== COLISÃO =====
function collision() {
    playHitSound();
    const canvasEl = document.getElementById("game");
    canvasEl.classList.add("shake");
    setTimeout(() => canvasEl.classList.remove("shake"), 350);
    
    // Efeito visual de game over
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, 500, 500);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💀 GAME OVER', 250, 240);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '20px Arial';
    ctx.fillText('Clique em "Reiniciar"', 250, 290);
    ctx.textAlign = 'left';
}

// ===== CONTROLES =====
document.addEventListener("keydown", e => {
    if (!gameRunning) return;
    if (e.key === "ArrowUp" && dy !== 1) { dx = 0; dy = -1; e.preventDefault(); }
    if (e.key === "ArrowDown" && dy !== -1) { dx = 0; dy = 1; e.preventDefault(); }
    if (e.key === "ArrowLeft" && dx !== 1) { dx = -1; dy = 0; e.preventDefault(); }
    if (e.key === "ArrowRight" && dx !== -1) { dx = 1; dy = 0; e.preventDefault(); }
});

// ===== INICIAR =====
initGame();
draw();
startLoop();


// Fechar com ESC
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
});