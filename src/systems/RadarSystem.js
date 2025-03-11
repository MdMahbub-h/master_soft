class RadarSystem {
  constructor(scene, player, enemies, radarSize = 90) {
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    this.radarSize = radarSize;

    // Get the radar canvas and context
    this.radarCanvas = document.getElementById("radar-canvas");
    this.radarContext = this.radarCanvas.getContext("2d");

    // Initialize radar
    this.drawRadarBackground();
  }

  drawRadarBackground() {
    // Clear the canvas
    this.radarContext.clearRect(0, 0, this.radarSize, this.radarSize);

    // Draw the radar background (black square)
    this.radarContext.fillStyle = "#000000";
    this.radarContext.fillRect(0, 0, this.radarSize, this.radarSize);

    // Draw the player as a green dot in the center
    this.radarContext.fillStyle = "#00ff00"; // Green dot for player
    this.radarContext.beginPath();
    this.radarContext.arc(
      this.radarSize / 2,
      this.radarSize / 2,
      3, // Dot size
      0,
      2 * Math.PI
    );
    this.radarContext.fill();
  }

  update() {
    // Clear the radar
    this.drawRadarBackground();

    // Get player position
    const playerX = this.player.x;
    const playerY = this.player.y;

    // Update radar dots for each enemy
    this.enemies.getChildren().forEach((enemy) => {
      const enemyX = enemy.x;
      const enemyY = enemy.y;

      // Calculate relative position to the player
      const relativeX = enemyX - playerX;
      const relativeY = enemyY - playerY;

      // Scale down the position to fit the radar
      const scaleFactor = this.radarSize / 2400; // Assuming world size is 2400x2400
      const radarX = this.radarSize / 2 + relativeX * scaleFactor;
      const radarY = this.radarSize / 2 + relativeY * scaleFactor;

      // Draw a dot for the enemy
      this.radarContext.fillStyle = "#ff0000"; // Red dot
      this.radarContext.beginPath();
      this.radarContext.arc(radarX, radarY, 2, 0, 2 * Math.PI); // Smaller dot for square radar
      this.radarContext.fill();
    });
  }

  destroy() {
    // Clear the canvas
    this.radarContext.clearRect(0, 0, this.radarSize, this.radarSize);
  }
}
export { RadarSystem };

// // RadarSystem.js
// class RadarSystem {
//     constructor(scene, player, enemies, radarSize = 200) {
//       this.scene = scene;
//       this.player = player;
//       this.enemies = enemies;
//       this.radarSize = radarSize;

//       // Create radar background
//       this.radarBackground = this.scene.add.graphics();
//       this.drawRadarBackground();

//       // Create a container for radar dots
//       this.radarDots = this.scene.add.group();
//     }

//     drawRadarBackground() {
//       // Draw a black circle for the radar background
//       this.radarBackground.fillStyle(0x000000, 1);
//       this.radarBackground.fillCircle(
//         this.radarSize / 2,
//         this.radarSize / 2,
//         this.radarSize / 2
//       );

//       // Draw a crosshair in the center
//       this.radarBackground.lineStyle(2, 0x00ff00, 1);
//       this.radarBackground.lineBetween(
//         this.radarSize / 2 - 10,
//         this.radarSize / 2,
//         this.radarSize / 2 + 10,
//         this.radarSize / 2
//       );
//       this.radarBackground.lineBetween(
//         this.radarSize / 2,
//         this.radarSize / 2 - 10,
//         this.radarSize / 2,
//         this.radarSize / 2 + 10
//       );

//       // Position the radar in the top-right corner
//       this.radarBackground.setScrollFactor(0);
//       this.radarBackground.setPosition(
//         this.scene.cameras.main.width - this.radarSize - 20,
//         20
//       );
//     }

//     update() {
//       // Clear previous radar dots
//       this.radarDots.clear(true, true);

//       // Get player position
//       const playerX = this.player.x;
//       const playerY = this.player.y;

//       // Update radar dots for each enemy
//       this.enemies.getChildren().forEach((enemy) => {
//         const enemyX = enemy.x;
//         const enemyY = enemy.y;

//         // Calculate relative position to the player
//         const relativeX = enemyX - playerX;
//         const relativeY = enemyY - playerY;

//         // Scale down the position to fit the radar
//         const scaleFactor = this.radarSize / 2400; // Assuming world size is 2400x2400
//         const radarX = this.radarSize / 2 + relativeX * scaleFactor;
//         const radarY = this.radarSize / 2 + relativeY * scaleFactor;

//         // Draw a dot for the enemy
//         const dot = this.scene.add.circle(radarX, radarY, 3, 0xff0000);
//         this.radarDots.add(dot);

//         // Position the dot relative to the radar background
//         dot.setScrollFactor(0);
//         dot.setPosition(
//           this.radarBackground.x + radarX,
//           this.radarBackground.y + radarY
//         );
//       });
//     }

//     destroy() {
//       this.radarBackground.destroy();
//       this.radarDots.clear(true, true);
//     }
//   }

//   export { RadarSystem };
