// Obstacle system
class ObstacleSystem {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.obstacles = scene.physics.add.group();

    this.types = {
      tree: { sprite: "tree", scale: 1, damage: 25, density: 5 },
      rock: { sprite: "rock", scale: 1, damage: 35, density: 5 },
      missile: { sprite: "missile", scale: 1, damage: 50, density: 5 },
      steel: { sprite: "steel", scale: 1, damage: 50, density: 5 },
      building: { sprite: "building", scale: 1, damage: 50, density: 5 },
    };
  }

  spawn(type, x, y) {
    const config = this.types[type];
    const obstacle = this.obstacles
      .create(x, y, config.sprite)
      .setScale(config.scale)
      .setImmovable(true);
    obstacle.damage = config.damage;
    return obstacle;
  }

  handleCollision(player, obstacle) {
    // Calculate collision angle
    const angle = Phaser.Math.Angle.Between(
      obstacle.x,
      obstacle.y,
      player.x,
      player.y
    );
    const pushDistance = 150;
    const safeDistance = 50; // Distance to place in front of obstacle

    // Calculate push deltas
    const dx = Math.cos(angle) * pushDistance;
    const dy = Math.sin(angle) * pushDistance;

    // Check if bounce position would be in a valid region
    const movementManager = this.scene.playerSystem.movementManager;
    const currentWorldPos = movementManager.screenToWorld(player.x, player.y);
    const nextWorldPos = {
      x: currentWorldPos.x + dx,
      y: currentWorldPos.y + dy,
    };

    // Try bounce first
    // if (movementManager.isPositionInAnyRegion(nextWorldPos)) {
    //   movementManager.updateSceneElements(dx, dy);
    //   movementManager.worldOffset.x += dx;
    //   movementManager.worldOffset.y += dy;
    // } else {
    // If bounce fails, place in front of obstacle
    const safeDx = Math.cos(angle) * safeDistance;
    const safeDy = Math.sin(angle) * safeDistance;
    const safeWorldPos = {
      x: currentWorldPos.x + safeDx,
      y: currentWorldPos.y + safeDy,
    };

    // Verify safe position is in bounds
    if (movementManager.isPositionInAnyRegion(safeWorldPos)) {
      movementManager.updateSceneElements(safeDx, safeDy);
      movementManager.worldOffset.x += safeDx;
      movementManager.worldOffset.y += safeDy;
    }
    // }

    // Stop movement
    this.gameState.update("speed", 0);
    this.scene.sounds.skid.play();

    // Update region system
    const playerWorldPos = movementManager.screenToWorld(player.x, player.y);
    this.scene.regionSystem?.update(
      playerWorldPos,
      movementManager.worldOffset
    );

    // Calculate collision point for effects
    const collisionPoint = {
      x: (player.x + obstacle.x) / 2,
      y: (player.y + obstacle.y) / 2,
    };

    // Emit collision event
    this.scene.events.emit("playerHit", collisionPoint);
    // this.scene.events.emit("playerHit", collisionPoint);
  }

  setupCollisions(player) {
    this.scene.physics.add.collider(
      player,
      this.obstacles,
      this.handleCollision,
      null,
      this
    );
  }
}
export { ObstacleSystem };
