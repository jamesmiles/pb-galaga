/**
 * Galaga Clone - Game Logic
 */

// Player ship
class Player extends Entity {
    constructor(x, y) {
        super(x, y, 30, 30);
        this.speed = 300;
        this.shootCooldown = 0;
        this.shootDelay = 0.3;
        this.collidesWith = true;
        this.type = 'player';
    }
    
    update(deltaTime) {
        // Movement
        if (this.game.isKeyPressed('ArrowLeft')) {
            this.vx = -this.speed;
        } else if (this.game.isKeyPressed('ArrowRight')) {
            this.vx = this.speed;
        } else {
            this.vx = 0;
        }
        
        super.update(deltaTime);
        
        // Keep player in bounds
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) {
            this.x = this.game.width - this.width;
        }
        
        // Shooting
        this.shootCooldown -= deltaTime;
        if (this.game.isKeyPressed('Space') && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = this.shootDelay;
        }
    }
    
    shoot() {
        const bullet = new Bullet(
            this.x + this.width / 2 - 2,
            this.y,
            0,
            -500,
            'player'
        );
        this.game.addEntity(bullet);
    }
    
    render(ctx) {
        // Draw player ship
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#0f0';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    onCollision(other) {
        if (other.type === 'enemy' || other.type === 'enemyBullet') {
            this.destroy();
            this.explode();
            if (window.gameState) {
                window.gameState.loseLife();
            }
        }
    }
    
    explode() {
        // Create explosion particles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 100 + Math.random() * 100;
            const particle = new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#0f0',
                1
            );
            this.game.addEntity(particle);
        }
    }
}

// Enemy ship
class Enemy extends Entity {
    constructor(x, y, formationX, formationY) {
        super(x, y, 25, 25);
        this.formationX = formationX;
        this.formationY = formationY;
        this.targetX = x;
        this.targetY = y;
        this.speed = 100;
        this.shootCooldown = Math.random() * 3 + 2;
        this.collidesWith = true;
        this.type = 'enemy';
        this.diving = false;
        this.diveTime = 0;
    }
    
    update(deltaTime) {
        // Formation movement
        if (!this.diving) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 2) {
                this.vx = (dx / dist) * this.speed;
                this.vy = (dy / dist) * this.speed;
            } else {
                this.vx = 0;
                this.vy = 0;
            }
        } else {
            // Diving attack pattern
            this.diveTime += deltaTime;
            const t = this.diveTime;
            this.vx = Math.sin(t * 3) * 200;
            this.vy = 200;
            
            if (this.y > this.game.height) {
                this.diving = false;
                this.diveTime = 0;
                this.y = -50;
                this.x = Math.random() * (this.game.width - this.width);
            }
        }
        
        super.update(deltaTime);
        
        // Shooting
        this.shootCooldown -= deltaTime;
        if (this.shootCooldown <= 0 && !this.diving) {
            this.shoot();
            this.shootCooldown = Math.random() * 3 + 2;
        }
        
        // Random dive attack
        if (!this.diving && Math.random() < 0.0005) {
            this.diving = true;
            this.diveTime = 0;
        }
    }
    
    shoot() {
        const bullet = new Bullet(
            this.x + this.width / 2 - 2,
            this.y + this.height,
            0,
            300,
            'enemyBullet'
        );
        this.game.addEntity(bullet);
    }
    
    render(ctx) {
        // Draw enemy ship
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw wings
        ctx.fillStyle = '#ff0';
        ctx.fillRect(this.x - 5, this.y + 10, 5, 10);
        ctx.fillRect(this.x + this.width, this.y + 10, 5, 10);
        
        // Add glow effect
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
    
    onCollision(other) {
        if (other.type === 'playerBullet') {
            this.destroy();
            this.explode();
            if (window.gameState) {
                window.gameState.addScore(100);
            }
        }
    }
    
    explode() {
        // Create explosion particles
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 80;
            const particle = new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#f00',
                0.8
            );
            this.game.addEntity(particle);
        }
    }
}

// Bullet
class Bullet extends Entity {
    constructor(x, y, vx, vy, type) {
        super(x, y, 4, 10);
        this.vx = vx;
        this.vy = vy;
        this.type = type;
        this.collidesWith = true;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        
        // Remove if off screen
        if (this.y < -20 || this.y > this.game.height + 20) {
            this.destroy();
        }
    }
    
    render(ctx) {
        ctx.fillStyle = this.type === 'playerBullet' ? '#0ff' : '#ff0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add glow
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.type === 'playerBullet' ? '#0ff' : '#ff0';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
    
    onCollision(other) {
        if (this.type === 'playerBullet' && other.type === 'enemy') {
            this.destroy();
        } else if (this.type === 'enemyBullet' && other.type === 'player') {
            this.destroy();
        }
    }
}

// Star background
class Star extends Entity {
    constructor(x, y, speed) {
        super(x, y, 1, 1);
        this.vy = speed;
        this.brightness = Math.random();
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        if (this.y > this.game.height) {
            this.y = 0;
            this.x = Math.random() * this.game.width;
        }
    }
    
    render(ctx) {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Game state manager
class GameState {
    constructor(game) {
        this.game = game;
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.player = null;
        this.gameOver = false;
        
        this.updateUI();
    }
    
    start() {
        this.score = 0;
        this.lives = 3;
        this.wave = 1;
        this.gameOver = false;
        
        this.game.clear();
        this.setupBackground();
        this.spawnPlayer();
        this.spawnEnemies();
        this.updateUI();
        this.game.start();
    }
    
    setupBackground() {
        // Add stars
        for (let i = 0; i < 50; i++) {
            const star = new Star(
                Math.random() * this.game.width,
                Math.random() * this.game.height,
                20 + Math.random() * 30
            );
            this.game.addEntity(star);
        }
    }
    
    spawnPlayer() {
        this.player = new Player(
            this.game.width / 2 - 15,
            this.game.height - 60
        );
        this.game.addEntity(this.player);
    }
    
    spawnEnemies() {
        const rows = 4;
        const cols = 8;
        const spacing = 60;
        const offsetX = (this.game.width - (cols * spacing)) / 2;
        const offsetY = 80;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = offsetX + col * spacing;
                const y = offsetY + row * spacing;
                const enemy = new Enemy(x, y - 200, x, y);
                this.game.addEntity(enemy);
            }
        }
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
        this.checkWaveComplete();
    }
    
    checkWaveComplete() {
        const enemies = this.game.entities.filter(e => e.type === 'enemy');
        if (enemies.length === 0) {
            this.wave++;
            setTimeout(() => {
                this.spawnEnemies();
            }, 2000);
        }
    }
    
    loseLife() {
        this.lives--;
        this.updateUI();
        
        if (this.lives > 0) {
            setTimeout(() => {
                this.spawnPlayer();
            }, 2000);
        } else {
            this.endGame();
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.game.stop();
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    updateUI() {
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('lives-value').textContent = this.lives;
    }
}

// Initialize game
let game;
let gameState;

window.addEventListener('DOMContentLoaded', () => {
    game = new Patchboard('game-canvas', 800, 600);
    gameState = new GameState(game);
    window.gameState = gameState;
    
    // Start button
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hidden');
        gameState.start();
    });
    
    // Restart button
    document.getElementById('restart-btn').addEventListener('click', () => {
        document.getElementById('game-over').classList.add('hidden');
        gameState.start();
    });
});
