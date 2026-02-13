# PB-Galaga System Context

## Actors

### Human Actors

1. **Players (Primary)**
   - Single player mode: One player controls the red ship
   - Two player co-op mode: Two players control red and blue ships
   - Interact via keyboard controls
   - Consume visual and audio feedback

2. **Developers**
   - Write and maintain game code
   - Create test harnesses
   - Run automated tests
   - Use headless mode for development and debugging

3. **Testers**
   - Execute manual testing
   - Use test harnesses to validate object behaviors
   - Review visual regression tests
   - Validate gameplay mechanics

### Automated Actors

1. **Test Scripts**
   - Drive game loop in headless mode
   - Validate game state transitions
   - Execute automated test suites
   - Generate test reports

2. **AI Test Agents**
   - Advance game loop programmatically
   - Verify game state correctness
   - Simulate player inputs
   - Perform automated gameplay validation

3. **CI/CD System**
   - Build and bundle game assets
   - Run automated test suites
   - Deploy to hosting platform
   - Generate build artifacts

## External Systems

### Runtime Dependencies

1. **Web Browser**
   - Executes JavaScript/TypeScript (compiled)
   - Provides Canvas/WebGL for rendering
   - Handles user input events
   - Manages audio playback
   - Supported browsers: Modern Chrome, Firefox, Safari, Edge

2. **Phaser Framework**
   - Game rendering engine
   - Sprite and animation management
   - Audio subsystem
   - Input handling utilities
   - Physics utilities (if needed)

### Development Dependencies

1. **TypeScript Compiler**
   - Transpiles TypeScript to JavaScript
   - Type checking and validation
   - Source map generation

2. **Build Tools**
   - Webpack/Vite/Rollup for bundling
   - Asset optimization
   - Development server

3. **Testing Frameworks**
   - Jest/Vitest for unit tests
   - Testing library for DOM interactions
   - Coverage reporting tools

### Deployment Platform

1. **Static Site Hosting**
   - GitHub Pages / Netlify / Vercel
   - Serves static HTML, JS, CSS, and assets
   - No backend server required
   - CDN for asset delivery

## System Boundaries

### Inside the System

**What PB-Galaga Owns and Controls:**

1. **Core Game Logic**
   - Game loop and time step management
   - State management (current and previous state)
   - Collision detection algorithms
   - Score and lives tracking
   - Level progression logic

2. **Game Objects**
   - Player ship implementations
   - Enemy AI and behaviors
   - Projectile physics
   - Power-up systems
   - Object lifecycle management

3. **Game Assets**
   - Sprite sheets and animations
   - Sound effects
   - Background images
   - UI elements

4. **Menu Systems**
   - Start menu
   - Pause menu
   - Game over screen
   - Level complete screen
   - Control instructions

5. **Test Infrastructure**
   - Test harnesses for all object types
   - Automated test scripts
   - Headless game mode
   - Test utilities and helpers

### Outside the System

**What PB-Galaga Depends On:**

1. **Browser Environment**
   - JavaScript execution
   - Canvas/WebGL rendering
   - Input event system
   - Audio API
   - Local storage (for settings/high scores)

2. **Third-Party Libraries**
   - Phaser rendering engine
   - TypeScript language
   - Testing frameworks
   - Build tools

3. **Hosting Infrastructure**
   - Web server for static files
   - CDN for asset delivery
   - DNS and domain management

**What PB-Galaga Does NOT Handle:**

1. User authentication or accounts
2. Persistent cloud storage or save games
3. Multiplayer networking or matchmaking
4. In-app purchases or monetization
5. Analytics or telemetry
6. Backend APIs or databases
7. Social media integration

## Integration Points

### Browser APIs

1. **Canvas/WebGL API**
   - **Purpose**: Render game graphics
   - **Interface**: Phaser abstracts this
   - **Data Flow**: Game state → Phaser → Canvas rendering

2. **Keyboard Events**
   - **Purpose**: Capture player input
   - **Interface**: window.addEventListener for keydown/keyup
   - **Data Flow**: Browser events → Input Handler → Game State

3. **RequestAnimationFrame**
   - **Purpose**: Render loop timing
   - **Interface**: window.requestAnimationFrame()
   - **Data Flow**: Browser callback → Render loop

4. **Web Audio API**
   - **Purpose**: Play sound effects and music
   - **Interface**: Phaser audio subsystem
   - **Data Flow**: Game events → Phaser audio → Web Audio API

5. **Local Storage (Optional)**
   - **Purpose**: Store high scores and settings
   - **Interface**: window.localStorage
   - **Data Flow**: Game state → Local storage (persistence)

### Phaser Framework

1. **Scene Management**
   - Game creates Phaser scenes
   - Scenes receive state updates
   - Scenes render current interpolated state

2. **Sprite System**
   - Game provides sprite configurations
   - Phaser manages sprite lifecycle
   - Game updates sprite positions/animations

3. **Input System**
   - Phaser captures input events
   - Game polls Phaser for input state
   - Game translates to game actions

### Build Process

1. **TypeScript Compilation**
   - Source files → TypeScript compiler → JavaScript
   - Type checking and validation
   - Source maps for debugging

2. **Asset Bundling**
   - Source + Assets → Bundler → Optimized bundle
   - Code splitting and tree shaking
   - Asset optimization

3. **Deployment**
   - Build artifacts → Static hosting platform
   - Automatic deployment on git push
   - CDN distribution

## Context Diagram

```
┌──────────────────────────────────────────────────────────┐
│                        Players                           │
│                  (Keyboard Controls)                     │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│                    Web Browser                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │              PB-Galaga Game                        │  │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │    Engine    │  │  Objects    │  │  Levels  │  │  │
│  │  │  (Game Loop) │◄─┤  (Ships,    │◄─┤ (Waves,  │  │  │
│  │  │              │  │   Enemies)  │  │  Paths)  │  │  │
│  │  └──────┬───────┘  └─────────────┘  └──────────┘  │  │
│  │         │                                          │  │
│  │         ▼                                          │  │
│  │  ┌──────────────┐                                 │  │
│  │  │   Renderer   │                                 │  │
│  │  │   (Phaser)   │                                 │  │
│  │  └──────────────┘                                 │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│              Static Hosting Platform                     │
│           (GitHub Pages / Netlify / Vercel)              │
└──────────────────────────────────────────────────────────┘
```
