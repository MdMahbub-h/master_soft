// Player management
import { SoundManager } from "../managers/SoundManager.js";
import { MovementManager } from "../managers/MovementManager.js";
class PlayerSystem {
  constructor(scene, gameState, spawnPoint = { x: 384, y: 384 }) {
    this.scene = scene;
    this.gameState = gameState;
    this.spawnPoint = spawnPoint;
    this.controls = {};
    this.setupPlayer();
    this.setupControls();
    this.soundManager = new SoundManager(scene.sounds);
    this.movementManager = new MovementManager(this.player, gameState, scene);
  }
  setupPlayer() {
    // Create player sprite
    this.player = this.scene.physics.add.sprite(0, 0, "car");
    this.player.setDepth(1);
    this.player.setCollideWorldBounds(true);
    this.player.angle = 180;

    // Explicitly set to screen center
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;

    this.player.setPosition(centerX, centerY);
  }

  respawnPlayer(newSpawnPoint) {
    this.spawnPoint = newSpawnPoint;
    const centerX = this.scene.cameras.main.centerX;
    const centerY = this.scene.cameras.main.centerY;
    this.player.setPosition(centerX, centerY);
    if (this.movementManager) {
      this.movementManager.resetWorldOffset(newSpawnPoint);
    }
  }

  setupControls() {
    this.controls = this.scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.O,
      right: Phaser.Input.Keyboard.KeyCodes.P,
      accelerate: Phaser.Input.Keyboard.KeyCodes.Q,
      brake: Phaser.Input.Keyboard.KeyCodes.A,
    });

    ["O", "P"].forEach((key) => {
      this.scene.input.keyboard.on(`keyup-${key}`, () => {
        this.gameState.canRotate = true;
      });
    });
  }

  update() {
    const currentSpeed = this.gameState.get("speed") || 0;
    const maxSpeed = 10;

    this.soundManager.playEngineSound(currentSpeed, maxSpeed, this.controls);
    this.movementManager.updateMovement(this.controls, maxSpeed);
  }

  destroy() {
    // Clean up sprite
    if (this.player) {
      this.player.destroy();
    }

    // Clean up sound manager
    if (this.soundManager) {
      Object.values(this.scene.sounds).forEach((sound) => {
        if (sound.isPlaying) {
          sound.stop();
        }
      });
    }

    // Clean up movement manager
    if (this.movementManager) {
      // MovementManager doesn't need explicit cleanup as it doesn't create any Phaser objects
      this.movementManager = null;
    }

    // Clean up controls
    if (this.controls) {
      // Remove any event listeners if you have any
      this.controls = null;
    }
  }
}
export { PlayerSystem };
