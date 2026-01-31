/**
 * Patchboard - A simple 2D game framework for HTML5 Canvas
 */

class Patchboard {
    constructor(canvasId, width = 800, height = 600) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        
        this.entities = [];
        this.keys = {};
        this.running = false;
        this.lastTime = 0;
        
        this.setupInput();
    }
    
    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });
    }
    
    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }
    
    addEntity(entity) {
        this.entities.push(entity);
        entity.game = this;
        return entity;
    }
    
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }
    
    update(deltaTime) {
        // Update all entities
        for (let i = this.entities.length - 1; i >= 0; i--) {
            const entity = this.entities[i];
            if (entity.dead) {
                this.entities.splice(i, 1);
            } else if (entity.update) {
                entity.update(deltaTime);
            }
        }
        
        // Check collisions
        this.checkCollisions();
    }
    
    checkCollisions() {
        for (let i = 0; i < this.entities.length; i++) {
            for (let j = i + 1; j < this.entities.length; j++) {
                const a = this.entities[i];
                const b = this.entities[j];
                
                if (a.collidesWith && b.collidesWith && 
                    this.isColliding(a, b)) {
                    if (a.onCollision) a.onCollision(b);
                    if (b.onCollision) b.onCollision(a);
                }
            }
        }
    }
    
    isColliding(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Render all entities
        for (const entity of this.entities) {
            if (entity.render) {
                entity.render(this.ctx);
            }
        }
    }
    
    gameLoop(currentTime) {
        if (!this.running) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    start() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    stop() {
        this.running = false;
    }
    
    clear() {
        this.entities = [];
    }
}

// Base Entity class
class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.dead = false;
        this.collidesWith = false;
        this.game = null;
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }
    
    render(ctx) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    destroy() {
        this.dead = true;
    }
}

// Particle system for effects
class Particle extends Entity {
    constructor(x, y, vx, vy, color, life) {
        super(x, y, 2, 2);
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
    }
    
    update(deltaTime) {
        super.update(deltaTime);
        this.life -= deltaTime;
        if (this.life <= 0) {
            this.destroy();
        }
    }
    
    render(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1;
    }
}

// Export for use in game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Patchboard, Entity, Particle };
}
