# Galaga Clone - Built with Patchboard

A classic Galaga-style space shooter game built with HTML5 Canvas and the custom Patchboard game framework.

![Start Screen](https://github.com/user-attachments/assets/68efd8c9-84b6-4b9a-85f8-0beb747e5ef1)

## Features

- **Classic Galaga Gameplay**: Control a spaceship, shoot down waves of enemies
- **Enemy AI**: Enemies move in formation and perform diving attacks
- **Particle Effects**: Explosion effects when ships are destroyed
- **Score System**: Track your high score as you destroy enemies
- **Lives System**: Three lives to survive as long as possible
- **Wave System**: Continuous waves of enemies with increasing difficulty

![Gameplay](https://github.com/user-attachments/assets/37c5c85d-556d-470d-94a8-de524e2303b4)

## How to Play

1. Open `index.html` in a web browser
2. Click "Start Game" to begin
3. Use **Arrow Keys** (← →) to move your ship left and right
4. Press **SPACE** to shoot
5. Destroy all enemies to advance to the next wave
6. Avoid enemy ships and their bullets

## Patchboard Framework

This game is built using **Patchboard**, a lightweight 2D game framework for HTML5 Canvas that provides:

- **Game Loop**: Smooth, time-based animation and updates
- **Entity System**: Base classes for game objects with automatic lifecycle management
- **Collision Detection**: Built-in AABB collision detection
- **Input Handling**: Simple keyboard input management
- **Particle System**: Effects system for explosions and visual feedback

## Project Structure

```
pb-galaga/
├── index.html       # Main HTML file with game container
├── style.css        # Styling for the game UI
├── patchboard.js    # Patchboard game framework
└── game.js          # Galaga game logic and entities
```

## Technical Details

- Pure JavaScript (no external dependencies)
- HTML5 Canvas for rendering
- Object-oriented design with ES6 classes
- Modular architecture separating framework from game logic

## Running Locally

Simply open `index.html` in any modern web browser, or serve it with a local web server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Then open http://localhost:8000 in your browser
```

## License

MIT