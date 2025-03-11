import { BaseScene } from "./BaseScene.js";
class PauseScene extends BaseScene {
  constructor() {
    super("PauseScene");
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .rectangle(0, 0, width, height, 0x000000, 0.7)
      .setOrigin(0)
      .setScrollFactor(0);

    this.add
      .text(width / 2, height / 2, "PAUSED", {
        fontSize: "64px",
      })
      .setOrigin(0.5);

    ["SPACE", "ESC"].forEach((key) => {
      this.input.keyboard.on(`keydown-${key}`, () => {
        this.scene.resume("GameScene");
        this.scene.stop();
      });
    });
  }
}
export { PauseScene };
