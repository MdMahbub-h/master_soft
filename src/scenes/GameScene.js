// Main game scene
import { PlayerSystem } from "../systems/PlayerSystem.js";
import { CollectibleSystem } from "../systems/CollectibleSystem.js";
import { ObstacleSystem } from "../systems/ObstacleSystem.js";
import { RegionSystem } from "../systems/RegionSystem.js";
import { EnemySystem } from "../systems/EnemySystem.js";
import { FPSDisplay } from "../systems/FPSDisplay.js";
import { MinimapSystem } from "../systems/MiniMapSystem.js";
import { RadarSystem } from "../systems/RadarSystem.js"; // Add this import
import { BaseScene } from "./BaseScene.js";
import { GameState } from "../GameState.js";

class GameScene extends BaseScene {
  constructor() {
    super("GameScene");
    this.initializeGameState();
  }
  initializeGameState() {
    this.gameState = new GameState();
  }
  create() {
    this.tempWarning = false;
    if (super.create) {
      super.create();
    }

    // Initialize physics world
    if (!this.physics || !this.physics.world) {
      console.warn("Physics system not initialized, reinitializing scene");
      this.scene.restart();
      return;
    }
    this.fpsDisplay = new FPSDisplay(this);

    // if (this.gameState.get("currentRegion") == "Unknown") {
    //   this.scene.restart();
    //   return;
    // }
    // Setup scene basics first
    this.addBackground();

    this.physics.world.setBounds(0, 0, 2400, 2400);
    this.cameras.main.setBounds(0, 0, 2400, 2400);
    //Initialize sounds
    this.sounds = {
      accelerate: this.sound.add("accelerate", { loop: true, volume: 0.5 }),
      braking: this.sound.add("braking", { loop: false, volume: 0.7 }),
      crash: this.sound.add("crash", { loop: false }),
      idle: this.sound.add("idle", { loop: true, volume: 0.5 }),
      refuel: this.sound.add("refuel", { loop: false }),
      topspeed: this.sound.add("topspeed", { loop: true, volume: 2 }),
      skid: this.sound.add("skid", { loop: false, volume: 5 }),
      overheating: this.sound.add("overheating", { loop: true, volume: 3 }),
      blowup: this.sound.add("blowup", { loop: false, volume: 3 }),
    };

    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion", {
        start: 0,
        end: 7,
      }),
      frameRate: 16,
      repeat: 0,
    });

    // Initialize player first
    this.spawnPoint = { x: 324, y: 314 }; // Default spawn
    this.playerSystem = new PlayerSystem(this, this.gameState, this.spawnPoint);

    // Then region system
    this.regionSystem = new RegionSystem(this, this.gameState);
    // Finally update spawn point
    this.spawnPoint = this.regionSystem.getRandomSpawnPoint();

    // let spawnInRegion = false;
    // while (!spawnInRegion) {
    //   this.spawnPoint = this.regionSystem.getRandomSpawnPoint();
    //   for (const region of this.regionSystem.regions) {
    //     if (this.regionSystem.isInRegion(this.spawnPoint, region)) {
    //       spawnInRegion = true;
    //     }
    //   }
    // }
    // this.spawnPoint = this.regionSystem.pointInRegion();

    this.playerSystem.respawnPlayer(this.spawnPoint);

    this.minimapSystem = new MinimapSystem(
      this, // Scene
      this.playerSystem.movementManager, // MovementManager
      this.regionSystem.getBoundingBoxOfAll(),
      this.spawnPoint
    );

    // Initialize systems
    this.collectibleSystem = new CollectibleSystem(this, this.gameState);
    this.obstacleSystem = new ObstacleSystem(this, this.gameState);
    this.enemySystem = new EnemySystem(this);
    this.explosions = this.add.group();

    // Setup collisions
    if (this.collectibleSystem) {
      this.collectibleSystem.setupCollisions(this.playerSystem.player);
      this.spawnItems(this.collectibleSystem);
    }
    if (this.obstacleSystem) {
      this.obstacleSystem.setupCollisions(this.playerSystem.player);
      this.spawnItems(this.obstacleSystem);
    }
    if (this.enemySystem) {
      this.enemySystem.setupCollisions(this.playerSystem.player);
      // Initialize radar system
      this.radarSystem = new RadarSystem(
        this,
        this.playerSystem.player,
        this.enemySystem.enemies
      );
    }

    // Set up pause functionality

    ["SPACE", "ESC"].forEach((key) => {
      this.input.keyboard.on(`keydown-${key}`, () => {
        this.handlePause();
      });
    });

    // Listen for game state changes
    this.gameState.on("stateChange", (state) => {
      this.updateUI(state);
    });

    // this.addDebugCenter();

    // Add text to display the current region
    this.addRegionText();

    this.time.addEvent({
      delay: 1000,
      callback: () =>
        this.gameState.update("score", this.gameState.get("score") + 10),
      loop: true,
    });
    if (this.gameState.get("currentRegion") == "Unknown") {
      this.scene.restart();
      return;
    }
    this.registerEvents();
  }
  addRegionText() {
    // Create a text object to display the current region
    this.regionText = this.add.text(
      this.cameras.main.centerX, // X position (center of the screen)
      20, // Y position (20 pixels from the top)
      `Region: ${this.gameState.get("currentRegion")}`, // Initial text
      {
        fontFamily: "Arial",
        fontSize: "18px",
        fill: "#000000",
        padding: { x: 10, y: 5 },
      }
    );

    // Center the text horizontally
    this.regionText.setOrigin(0.5, 0);
  }

  registerEvents() {
    this.events.removeListener("updateRegion");
    this.events.on("updateRegion", () => {
      // this.regionText.setText(`Region: ${this.gameState.get("currentRegion")}`);
    });

    this.events.removeListener("gameWin");
    this.events.on("gameWin", () => {
      this.scene.start("GameWinScene");
    });

    this.events.removeListener("gameOver");
    this.events.on("gameOver", () => {
      this.sounds.overheating.stop();
      this.scene.start("GameOverScene");
    });

    this.events.removeListener("playerHit");
    this.events.on("playerHit", (collisionPoint) => {
      this.sounds.skid.play();
      // Reset speed
      this.gameState.update("speed", 0);
      this.sounds.crash.play();

      this.cameras.main.shake(200, 0.02);

      const explosion = this.add
        .sprite(collisionPoint.x, collisionPoint.y, "explosion")
        .play("explode", true);
      explosion.on("animationcomplete", () => explosion.destroy());
      this.explosions.add(explosion);

      const currentLives = this.gameState.get("lives");
      console.log("Current lives before hit:", currentLives); // Debug log
      this.gameState.update("lives", currentLives - 1);
      console.log("Lives after hit:", this.gameState.get("lives")); // Debug log
      if (this.gameState.get("lives") <= 0) {
        this.events.emit("gameOver");
      }
    });

    this.events.removeListener("engineDown");
    this.events.on("engineDown", (collisionPoint) => {
      // Reset speed
      this.sounds.skid.play();
      this.gameState.update("speed", 0);
      this.sounds.blowup.play();
      this.cameras.main.shake(200, 0.02);

      const explosion = this.add
        .sprite(collisionPoint.x, collisionPoint.y, "explosion")
        .play("explode", true);
      explosion.on("animationcomplete", () => explosion.destroy());
      this.explosions.add(explosion);

      const currentLives = this.gameState.get("lives");
      console.log("Current lives before hit:", currentLives); // Debug log
      this.gameState.update("lives", currentLives - 1);
      console.log("Lives after hit:", this.gameState.get("lives")); // Debug log
      if (this.gameState.get("lives") <= 0) {
        this.events.emit("gameOver");
      }
    });
  }

  addBackground() {
    this.background = this.add
      .tileSprite(
        0,
        0,
        this.physics.world.bounds.width,
        this.physics.world.bounds.height,
        "dot_pattern"
      )
      .setOrigin(0, 0);
  }

  addDebugCenter() {
    // Create a graphics object for the debug circle
    this.debugCenter = this.add.graphics();
    this.debugCenter.setDepth(4);
    this.debugCenter.lineStyle(2, 0xff0000); // Red outline
    this.debugCenter.strokeCircle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      10
    );

    // Add a crosshair
    this.debugCenter.lineStyle(1, 0xff0000);
    // Horizontal line
    this.debugCenter.lineBetween(
      this.cameras.main.centerX - 15,
      this.cameras.main.centerY,
      this.cameras.main.centerX + 15,
      this.cameras.main.centerY
    );
    // Vertical line
    this.debugCenter.lineBetween(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 15,
      this.cameras.main.centerX,
      this.cameras.main.centerY + 15
    );

    // Make it stay fixed on screen
    this.debugCenter.setScrollFactor(0);
  }
  qop;
  spawnItems(itemSystem) {
    const itemSize = 32;
    if (!this.spawnedPositions) {
      this.spawnedPositions = [];
    }

    const isOverlapping = (pos) => {
      return this.spawnedPositions.some(
        (existing) =>
          Phaser.Math.Distance.Between(pos.x, pos.y, existing.x, existing.y) <
          itemSize * 2
      );
    };

    const getValidSpawnPoint = (region) => {
      let attempts = 0;
      let position;

      do {
        const rawPoint = this.regionSystem.generateRandomPointInPolygon(
          region.polygon
        );

        position = this.playerSystem.movementManager
          ? this.playerSystem.movementManager.worldToScreen(
              rawPoint.x,
              rawPoint.y
            )
          : rawPoint;
        attempts++;
      } while (isOverlapping(position) && attempts < 50);

      return attempts < 50 ? position : null;
    };

    const getValidCollectibleSpawnPoint = (region) => {
      let attempts = 0;
      let position;

      do {
        const rawPoint = this.regionSystem.generateRandomPointInPolygon(
          region.polygon
        );

        position = this.playerSystem.movementManager
          ? this.playerSystem.movementManager.worldToScreen(
              rawPoint.x,
              rawPoint.y
            )
          : rawPoint;
        attempts++;
      } while (isOverlapping(position) && attempts < 50);

      return attempts < 50 ? position : null;
    };
    if (itemSystem instanceof CollectibleSystem) {
      // Iterate through the regions except the last one
      for (let i = 0; i < this.regionSystem.regions.length - 1; i++) {
        const region = this.regionSystem.regions[i];
        Object.keys(itemSystem.types).forEach((type) => {
          const position = getValidCollectibleSpawnPoint(region);
          if (this.regionSystem.isInRegion(position, region)) {
            itemSystem.spawn(type, position.x, position.y);
            this.spawnedPositions.push(position);
          }
        });
      }
    } else {
      for (const [type, config] of Object.entries(itemSystem.types)) {
        for (let i = 0; i < config.density; i++) {
          const position = this.getValidPosition();
          if (!isOverlapping(position)) {
            itemSystem.spawn(type, position.x, position.y);
            this.spawnedPositions.push(position);
          }
        }
      }
    }
  }

  getValidPosition(margin = 50, minDistance = 100) {
    // Calculate areas and create weighted distribution
    const regionWeights = this.regionSystem.regions.map((region) => {
      return { region, area: region.polygon.area };
    });

    const totalArea = regionWeights.reduce((sum, { area }) => sum + area, 0);
    const weights = regionWeights.map(({ area }) => area / totalArea);

    // Select region based on weighted probability
    const random = Math.random();
    let sum = 0;
    const selectedRegion = regionWeights.find(({ area }, index) => {
      sum += weights[index];
      return random <= sum;
    }).region;

    const rawPoint = this.regionSystem.generateRandomPointInPolygon(
      selectedRegion.polygon
    );

    // Adjust for world offset from movement manager
    if (this.playerSystem.movementManager) {
      return this.playerSystem.movementManager.worldToScreen(
        rawPoint.x,
        rawPoint.y
      );
    }
    return rawPoint;
  }

  update(time, delta) {
    if (!this.scene.isPaused()) {
      this.playerSystem.update();
      this.updateGameState(delta);
      if (this.enemySystem) {
        this.enemySystem.update(time);
      }
      if (this.minimapSystem) {
        this.minimapSystem.update();
      }
      // Update radar system
      if (this.radarSystem) {
        this.radarSystem.update();
      }
    }
  }

  handlePause() {
    if (this.scene.isPaused()) {
      this.scene.resume();
    } else {
      this.scene.pause();
      // Show pause menu
      this.scene.launch("PauseScene");
    }
  }

  updateGameState(delta) {
    const currentSpeed = Math.round(this.gameState.get("speed"));

    this.regionText.setText(`Region: ${this.gameState.get("currentRegion")}`);
    // Temperature
    const tempChangeRate = this.getTempChangeRate(currentSpeed);
    const currentTemp = this.gameState.get("temp");
    const newTemp = Phaser.Math.Clamp(
      currentTemp + (tempChangeRate * delta) / 1000,
      50,
      130
    );

    // Check if temperature hits critical level
    if (newTemp >= 130 && currentTemp < 130) {
      this.events.emit("engineDown", {
        x: this.playerSystem.player.x,
        y: this.playerSystem.player.y,
      });
      this.sounds.blowup.play();
      // Reset temperature after damage
      this.gameState.update("temp", 50);
    } else {
      this.gameState.update("temp", newTemp);
    }

    if (!this.tempWarning && newTemp > 100) {
      // tempWarning sound
      this.sounds.overheating.play();
      this.tempWarning = true;
    } else if (newTemp < 100) {
      this.sounds.overheating.stop();
      this.tempWarning = false;
    }

    // Fuel
    const fuelConsumptionRate = this.getFuelConsumptionRate(currentSpeed);
    const currentFuel = this.gameState.get("fuel");
    this.gameState.update(
      "fuel",
      Math.max(0, currentFuel - fuelConsumptionRate)
    );
  }

  cleanup() {
    // Destroy all systems properly

    if (this.playerSystem) {
      this.playerSystem.destroy();
      this.playerSystem = null;
    }

    if (this.collectibleSystem) {
      this.collectibleSystem.collectibles.destroy(true);
      this.collectibleSystem = null;
    }

    if (this.obstacleSystem) {
      this.obstacleSystem.obstacles.destroy(true);
      this.obstacleSystem = null;
    }

    if (this.enemySystem) {
      this.enemySystem.enemies.destroy(true);
      this.enemySystem = null;
    }

    if (this.explosions) {
      this.explosions.destroy(true);
      this.explosions = null;
    }

    if (this.regionSystem) {
      // Clean up region system
      this.regionSystem.cleanup();
      this.regionSystem = null;
    }

    if (this.fpsDisplay) {
      this.fpsDisplay.destroy();
      this.fpsDisplay = null;
    }

    if (this.radarSystem) {
      this.radarSystem.destroy();
      this.radarSystem = null;
    }
    // Reset game state
    this.gameState.reset();

    // Remove all event listeners
    this.events.removeAllListeners();
  }

  getTempChangeRate(speed) {
    const rates = {
      0: -5,
      1: -2,
      2: -0.5,
      3: -0.2,
      4: 0.5,
      5: 0.6,
      6: 1.0,
      7: 1.2,
      8: 1.5,
      9: 1.6,
      10: 1.9,
    };
    return rates[speed] || 0;
  }

  getFuelConsumptionRate(speed) {
    const ratios = {
      0: 1 / 240,
      1: 1 / 120,
      2: 1 / 96,
      3: 1 / 90,
      4: 1 / 84,
      5: 1 / 72,
      6: 1 / 60,
      7: 1 / 54,
      8: 1 / 48,
      9: 1 / 42,
      10: 1 / 30,
    };
    return ratios[speed] || 0;
  }
}

export { GameScene };
