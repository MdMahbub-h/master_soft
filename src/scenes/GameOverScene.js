import { BaseScene } from "./BaseScene.js";

class GameOverScene extends BaseScene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  create() {
    const { width, height } = this.scale;
    const gameScene = this.scene.get("GameScene");
    const gameState = gameScene.gameState;

    // Background
    this.add
      .rectangle(0, 0, width, height, 0x000000, 0.8)
      .setOrigin(0)
      .setScrollFactor(0);

    // Game Over Text
    this.add
      .text(width / 2, height / 4, "GAME OVER", {
        fontSize: "64px",
        color: "#ff0000",
      })
      .setOrigin(0.5);

    // Stats Container
    const stats = [
      `Total Score: ${gameState.get("score")}`,
      `Cases Collected: ${gameState.get("casesCollected") || 0}`,
    ];

    stats.forEach((stat, index) => {
      this.add
        .text(width / 2, height / 2 - 40 + (index * 40), stat, {
          fontSize: "28px",
          color: "#ffffff",
        })
        .setOrigin(0.5);
    });

    // Restart Button
    const restartButton = this.add
      .text(width / 2, height * 0.75, "Restart Game", {
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive();

    restartButton.on("pointerdown", () => {
      gameState.reset();
      this.scene.stop("GameScene");
      this.scene.stop("GameOverScene");
      this.scene.start("MenuScene");
    });
  }

  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

export { GameOverScene };