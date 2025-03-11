import { BaseScene } from "./BaseScene.js";

class GameWinScene extends BaseScene {
  constructor() {
    super({ key: "GameWinScene" });
  }

  create() {
    const { width, height } = this.scale;
    const gameScene = this.scene.get("GameScene");
    const gameState = gameScene.gameState;

    this.add.image(width / 2, height / 2, "complete").setOrigin(0.5);

    const restartButton = this.add
      .text(width / 2, height * 0.75, "Restart Game", {
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "#000000",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();
    // Stats Container
    const stats = [
      `Total Score: ${gameState.get("score")}`,
    ];

    stats.forEach((stat, index) => {
      this.add
        .text(width / 2, height / 2 - 40 + (index * 40), stat, {
          fontSize: "32px",
          color: "#ffffff",
          backgroundColor: "#000000",
        })
        .setOrigin(0.5);
    });

    restartButton.on("pointerdown", () => {
      const gameScene = this.scene.get("GameScene");
      gameScene.gameState.reset();
      this.scene.stop("GameScene");
      this.scene.stop("GameWinScene");
      this.scene.start("MenuScene");
    });
  }
}

export { GameWinScene };
