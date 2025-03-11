# Wasteland Racer Game

## Overview

Wasteland Racer is an exciting racing game built using Phaser 3, where players navigate through a vast wasteland, collect items, and avoid obstacles and enemies. The game features a dynamic environment, engaging gameplay mechanics, and a user-friendly interface.

## Features

- **Dynamic World**: Explore a large world with boundaries set to 2400x2400 pixels.
- **Collectibles**: Gather fuel and cases to enhance your score and gameplay.
- **Obstacles and Enemies**: Avoid various obstacles and enemy cars that challenge your progress.
- **User Interface**: Real-time updates on score, speed, temperature, and fuel levels.
- **Sound Effects**: Engaging sound effects for actions like acceleration, braking, and collisions.
- **Pause and Restart Functionality**: Easily pause the game and restart after a game over.

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, etc.)
- Basic knowledge of HTML, CSS, and JavaScript

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/wasteland-racer.git
   cd wasteland-racer
   ```

2. Open `index.html` in your web browser.

### Game Controls

- **Q**: Accelerate
- **A**: Brake
- **O**: Turn Left
- **P**: Turn Right

### Game Objective

Navigate your car through the wasteland, collect items to increase your score, and avoid crashing into obstacles and enemy cars. Keep an eye on your fuel and temperature levels to ensure you can continue racing.

## Game Structure

- **index.html**: The main HTML file that loads the game.
- **style.css**: The stylesheet for the game interface.
- **src/game.js**: The entry point for the game logic.
- **src/scenes/**: Contains various scenes like `GameScene`, `MenuScene`, `PauseScene`, and `GameOverScene`.
- **src/systems/**: Manages different game systems such as player, collectibles, obstacles, and enemies.
- **src/managers/**: Handles sound and movement management.
- **src/GameState.js**: Manages the game's state, including score, fuel, and lives.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- [Phaser 3](https://phaser.io/) for the game framework.
- All contributors and players who provide feedback and support.

Enjoy racing in the wasteland!
