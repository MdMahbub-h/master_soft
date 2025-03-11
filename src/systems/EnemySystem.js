// Create EnemySystem.js
class EnemySystem {
  constructor(scene, gameState) {
    this.scene = scene;
    this.enemies = scene.physics.add.group();
    this.spawnTime = 0;
    this.config = {
      speed: 5,
      spawnInterval: 3000,
      maxEnemies: 10,
    };
    this.gameState = gameState;
  }

  update(time) {
    if (
      time > this.spawnTime &&
      this.enemies.countActive(true) < this.config.maxEnemies
    ) {
      this.spawnEnemy();
      this.spawnTime = time + this.config.spawnInterval;
    }

    // Check and destroy off-screen enemies
    this.enemies.getChildren().forEach((enemy) => {
      if (this.isEnemyOutOfBounds(enemy)) {
        enemy.destroy();
      }
    });
  }

  isEnemyOutOfBounds(enemy) {
    const { width, height } = this.scene.physics.world.bounds;
    const padding = 100; // Add some padding to ensure enemies are fully out of bounds

    return (
      enemy.x < -padding ||
      enemy.x > width + padding ||
      enemy.y < -padding ||
      enemy.y > height + padding
    );
  }

  setupCollisions(player) {
    this.scene.physics.add.overlap(
      player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );
  }

  handleCollision(player, enemy) {
    enemy.destroy();
    const collisionPoint = {
      x: (player.x + enemy.x) / 2,
      y: (player.y + enemy.y) / 2,
    };

    this.scene.events.emit("playerHit", collisionPoint);
  }
  spawnEnemy() {
    const { width, height } = this.scene.physics.world.bounds;
    const edge = Phaser.Math.Between(0, 3);
    let x, y, angle;

    switch (edge) {
      case 0: // Top
        x = Phaser.Math.Between(0, width);
        y = 0;
        angle = 90;
        break;
      case 1: // Right
        x = width;
        y = Phaser.Math.Between(0, height);
        angle = 180;
        break;
      case 2: // Bottom
        x = Phaser.Math.Between(0, width);
        y = height;
        angle = 270;
        break;
      case 3: // Left
        x = 0;
        y = Phaser.Math.Between(0, height);
        angle = 0;
        break;
    }

    const enemy = this.enemies.create(x, y, "enemy").setAngle(angle);

    const velocity = this.scene.physics.velocityFromAngle(
      angle,
      this.config.speed * 100
    );
    enemy.setVelocity(velocity.x, velocity.y);
  }
}
export { EnemySystem };
