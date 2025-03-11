// class GameScene extends Phaser.Scene {
//     constructor() {
//         super({ key: 'GameScene' });
//         // Add this at the top of constructor
//         this.worldSize = {
//             width: 2400,
//             height: 2400
//         };
//         this.dots = {};
//         this.itemsConfig = {
//             player: { size: 1 },
//             enemy: { size: 1 },
//             fuel: { size: 1, density: 11 },
//             dot: { size: 1, density: 1000 },
//             case: { size: 1, density: 11 },
//         }
//         this.lastUpdateTime = 0
//         this.worldBounds = {
//             minX: 0,
//             maxX: this.worldSize.width,
//             minY: 0,
//             maxY: this.worldSize.height
//         };
//         this.mapBoundary = null;
//         this.minimap = null;
//         this.playerDot = null;

//         this.enemySpawnTime = 0;
//         this.enemies = null;
//         this.includeEnemy = true;
//         this.enemyConfig = {
//             speed: 5,
//             spawnInterval: 3000, // milliseconds
//             maxEnemies: 10
//         };

//         this.collectibleTypes = {
//             fuel: {
//                 sprite: 'fuel',
//                 scale: 0.75,
//                 density: 11, // Number of obstacles to create
//                 distribution: {
//                     minDistance: 100, // Minimum distance between obstacles
//                     margin: 50 // Margin from edges
//                 }
//             },
//             case: {
//                 sprite: 'case',
//                 scale: 0.2,
//                 density: 10,
//                 distribution: {
//                     minDistance: 120,
//                     margin: 50
//                 }
//             }
//         };
//         this.obstacleTypes = {
//             tree: {
//                 sprite: 'tree',
//                 scale: 0.75,
//                 density: 10, // Number of obstacles to create
//                 distribution: {
//                     minDistance: 100, // Minimum distance between obstacles
//                     margin: 50 // Margin from edges
//                 }
//             },
//             missile: {
//                 sprite: 'missile',
//                 scale: 0.75,
//                 density: 10, // Number of obstacles to create
//                 distribution: {
//                     minDistance: 100, // Minimum distance between obstacles
//                     margin: 50 // Margin from edges
//                 }
//             },
//             rock: {
//                 sprite: 'rock',
//                 scale: 0.75,
//                 density: 8,
//                 distribution: {
//                     minDistance: 100,
//                     margin: 50
//                 }
//             }
//         };

//         this.gameState = {
//             score: 0,
//             fuel: 100,
//             temp: 50,
//             speed: 0,
//             maxSpeed: 10,
//             acceleration: 0.2,
//             deceleration: 0.2,
//             canRotate: true,
//             casesCollected: 0,
//             lives: 3,
//             // Modular system for different types of damage
//             damageConditions: {
//                 fuelEmpty: {
//                     check: (state) => state.fuel <= 0,
//                     reset: (state) => {
//                         state.fuel = 100;
//                         return 'Out of fuel!';
//                     }
//                 },
//                 overheat: {
//                     check: (state) => state.temp >= 130,
//                     reset: (state) => {
//                         state.temp = 50;
//                         return 'Engine overheated!';
//                     }
//                 }
//                 // New damage conditions can be added here
//             }
//         };
//     }

//     preload() {
//         ['car', 'enemy', 'map', ...Object.keys(this.collectibleTypes), ...Object.keys(this.obstacleTypes)].forEach(asset => {
//             this.load.image(asset, `assets/${asset}.png`);
//         });
//     }

//     create() {
//         this.initializeWorld();
//         this.initializePlayer();
//         this.initializeCollectibles();
//         this.initializeObstacles();
//         if (this.includeEnemy) {
//             this.initializeEnemies();
//         }
//         this.createMinimap();
//         this.setupControls();
//         this.updateUIElements(); // Initial UI update
//     }

//     // Add this new method
//     initializeWorld() {
//         this.physics.world.setBounds(0, 0, this.worldSize.width, this.worldSize.height);
//         const background = this.add.rectangle(0, 0, this.worldSize.width, this.worldSize.height, 0xFFFF00).setOrigin(0, 0);

//         // Add random dots
//         const dots = this.add.graphics();
//         dots.fillStyle(0x000000, this.itemsConfig.dot.size);
//         for (let i = 0; i < this.itemsConfig.dot.density; i++) {
//             const x = Phaser.Math.Between(50, this.worldSize.width - 50);
//             const y = Phaser.Math.Between(50, this.worldSize.height - 50);
//             dots.fillCircle(x, y, 2);
//         }

//         // Add visible boundary
//         const boundary = this.add.graphics();
//         boundary.lineStyle(8, 0xFF0000);
//         boundary.strokeRect(0, 0, this.worldSize.width, this.worldSize.height);

//         // Make boundary and dots move with world
//         this.boundary = boundary;
//         this.dots = dots;

//         this.cameras.main.setBounds(0, 0, this.worldSize.width, this.worldSize.height);
//     }

//     initializePlayer() {
//         this.player = this.physics.add.sprite(
//             this.worldSize.width / 2,
//             this.worldSize.height / 2,
//             'car'
//         ).setScale(this.itemsConfig.player.size);

//         this.player.setCollideWorldBounds(true);
//         this.player.angle = 180;
//         this.cameras.main.startFollow(this.player, true, 1, 1);
//     }

//     initializeEnemies() {
//         this.enemies = this.physics.add.group();
//         this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, null, this);
//     }
//     // Add enemy spawn method
//     spawnEnemy() {
//         if (this.enemies.countActive(true) >= this.enemyConfig.maxEnemies) return;

//         // Spawn from edge of world
//         const edge = Phaser.Math.Between(0, 3);
//         let x, y, angle;

//         switch (edge) {
//             case 0: // Top
//                 x = Phaser.Math.Between(0, this.worldSize.width);
//                 y = 0;
//                 angle = Phaser.Math.Between(45, 135);
//                 break;
//             case 1: // Right
//                 x = this.worldSize.width;
//                 y = Phaser.Math.Between(0, this.worldSize.height);
//                 angle = Phaser.Math.Between(135, 225);
//                 break;
//             case 2: // Bottom
//                 x = Phaser.Math.Between(0, this.worldSize.width);
//                 y = this.worldSize.height;
//                 angle = Phaser.Math.Between(225, 315);
//                 break;
//             case 3: // Left
//                 x = 0;
//                 y = Phaser.Math.Between(0, this.worldSize.height);
//                 angle = Phaser.Math.Between(-45, 45);
//                 break;
//         }

//         const enemy = this.enemies.create(x, y, 'enemy').setScale(this.itemsConfig.enemy.size);
//         enemy.angle = angle;
//         enemy.setVelocity(
//             Math.cos(Phaser.Math.DegToRad(angle)) * this.enemyConfig.speed * 100,
//             Math.sin(Phaser.Math.DegToRad(angle)) * this.enemyConfig.speed * 100
//         );
//     }
//     // Add new method
//     createMinimap() {
//         const minimapContainer = this.add.container(100, 600);
//         const mapBg = this.add.rectangle(0, 0, 200, 200, 0x333333).setOrigin(0.5);
//         this.playerDot = this.add.circle(0, 0, 4, 0xff0000);
//         minimapContainer.add([mapBg, this.playerDot]);
//         minimapContainer.setScrollFactor(0);
//         this.minimap = minimapContainer;

//         // Track world offset
//         this.worldOffset = {
//             x: this.worldSize.width / 2,
//             y: this.worldSize.height / 2
//         };
//     }

//     updateMinimap() {
//         // Scale position to minimap size (200x200)
//         const x = (this.worldOffset.x / this.worldSize.width) * 200;
//         const y = (this.worldOffset.y / this.worldSize.height) * 200;

//         // Constrain dot within minimap bounds
//         this.playerDot.x = Phaser.Math.Clamp(x - 100, -100, 100);
//         this.playerDot.y = Phaser.Math.Clamp(y - 100, -100, 100);
//     }
//     // Add collision handler
//     handleEnemyCollision(player, enemy) {
//         enemy.destroy();
//         this.handleDamage('Crashed into enemy car!');
//     }

//     initializeCollectibles() {
//         this.collectibles = this.physics.add.group();
//         const placedPositions = [];
//         // Place obstacles for each type
//         Object.entries(this.collectibleTypes).forEach(([type, config]) => {

//             const position = this.getValidCollectiblePosition(config.distribution.margin, config.distribution.minDistance, placedPositions);

//             if (position) {
//                 this.collectibles.create(position.x, position.y, type)
//                     .setScale(config.scale);
//                 placedPositions.push(position);
//             }
//         });

//         this.physics.add.overlap(this.player, this.collectibles, this.collectItem, null, this);
//     }

//     getValidCollectiblePosition(margin, minDistance, existingPositions) {
//         const maxAttempts = 50;
//         let attempts = 0;

//         while (attempts < maxAttempts) {
//             const x = Phaser.Math.Between(margin, this.worldSize.width - margin);
//             const y = Phaser.Math.Between(margin, this.worldSize.height - margin);

//             // Check distance from other collectibles
//             const isTooClose = existingPositions.some(pos => {
//                 const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
//                 return distance < minDistance;
//             });

//             // Check distance from player start position
//             const distanceFromStart = Phaser.Math.Distance.Between(
//                 x, y,
//                 this.worldSize.width / 2,
//                 this.worldSize.height / 2
//             );

//             if (!isTooClose && distanceFromStart > 150) {
//                 return { x, y };
//             }

//             attempts++;
//         }

//         if (minDistance > 50) {
//             return this.getValidCollectiblePosition(margin, minDistance * 0.8, existingPositions);
//         }

//         return null;
//     }

//     setupControls() {
//         this.cursors = this.input.keyboard.addKeys({
//             left: Phaser.Input.Keyboard.KeyCodes.O,
//             right: Phaser.Input.Keyboard.KeyCodes.P,
//             accelerate: Phaser.Input.Keyboard.KeyCodes.Q,
//             brake: Phaser.Input.Keyboard.KeyCodes.A
//         });

//         ['O', 'P'].forEach(key => {
//             this.input.keyboard.on(`keyup-${key}`, () => {
//                 this.gameState.canRotate = true;
//             });
//         });
//     }

//     collectItem(player, collectible) {
//         if (collectible.texture.key === 'fuel') {
//             // Add score
//             this.gameState.score += 10;

//             // Replenish fuel
//             if (this.gameState.fuel < 100) {
//                 this.gameState.fuel = Math.min(100, this.gameState.fuel * 1.25);
//             }
//         } else if (collectible.texture.key === 'case') {
//             // Increment cases collected
//             this.gameState.casesCollected++;
//             collectible.destroy();
//         }
//         this.updateUIElements();
//     }

//     update(time) {
//         if (time > this.lastUpdateTime + 16) { // 60fps cap
//             this.handlePlayerMovement();
//             this.updateGameState();
//             this.updateUIElements();
//             this.updateMinimap();
//             if (this.includeEnemy && time > this.enemySpawnTime) {
//                 this.spawnEnemy();
//                 this.enemySpawnTime = time + this.enemyConfig.spawnInterval;

//                 // Cleanup enemies in batches
//                 if (this.enemies.getLength() > this.enemyConfig.maxEnemies * 1.5) {
//                     this.cleanupEnemies();
//                 }
//             }
//             this.lastUpdateTime = time;
//         }

//     }

//     handlePlayerMovement() {
//         if (this.gameState.canRotate) {
//             if (this.cursors.left.isDown) {
//                 this.player.angle -= 30;
//                 this.gameState.canRotate = false;
//             } else if (this.cursors.right.isDown) {
//                 this.player.angle += 30;
//                 this.gameState.canRotate = false;
//             }
//         }

//         this.updateSpeed();
//         this.moveWorld();
//     }

//     updateSpeed() {
//         const { acceleration, deceleration, maxSpeed } = this.gameState;

//         if (this.cursors.accelerate.isDown && this.gameState.speed < maxSpeed) {
//             this.gameState.speed += acceleration;
//         } else if (this.cursors.brake.isDown && this.gameState.speed > 0) {
//             this.gameState.speed -= deceleration * 2;
//         } else if (this.gameState.speed > 0) {
//             this.gameState.speed -= deceleration;
//         }

//         this.gameState.speed = Phaser.Math.Clamp(this.gameState.speed, 0, maxSpeed);
//     }

//     moveWorld() {
//         if (this.gameState.speed > 0) {
//             const rad = Phaser.Math.DegToRad(this.player.angle + 90);
//             const dx = Math.cos(rad) * this.gameState.speed;
//             const dy = Math.sin(rad) * this.gameState.speed;

//             // Check if movement would exceed bounds
//             const newX = this.worldOffset.x + dx;
//             const newY = this.worldOffset.y + dy;
//             if (newX >= this.worldBounds.minX &&
//                 newX <= this.worldBounds.maxX &&
//                 newY >= this.worldBounds.minY &&
//                 newY <= this.worldBounds.maxY) {

//                 this.worldOffset.x = newX;
//                 this.worldOffset.y = newY;

//                 this.collectibles.children.iterate(child => {
//                     if (child) {
//                         child.x -= dx;
//                         child.y -= dy;
//                     }
//                 });
//                 this.obstacles.children.iterate(child => {
//                     if (child) {
//                         child.x -= dx;
//                         child.y -= dy;
//                     }
//                 });
//                 if (this.includeEnemy) {
//                     this.enemies.children.iterate(child => {
//                         if (child) {
//                             child.x -= dx;
//                             child.y -= dy;
//                         }
//                     });
//                 }
//                 this.boundary.x -= dx;
//                 this.boundary.y -= dy;
//                 this.dots.x -= dx;
//                 this.dots.y -= dy;
//             }

//         }
//     }

//     updateGameState() {
//         const delta = this.game.loop.delta / 1000;
//         const currentSpeed = Math.round(this.gameState.speed);

//         // Update temperature
//         const tempChangeRate = this.getTempChangeRate(currentSpeed);
//         this.gameState.temp = Phaser.Math.Clamp(
//             this.gameState.temp + (tempChangeRate * delta),
//             50,
//             130
//         );

//         // Update fuel
//         const fuelConsumptionRate = this.getFuelConsumptionRate(currentSpeed);
//         this.gameState.fuel = Math.max(0, this.gameState.fuel - fuelConsumptionRate);

//         // Check all damage conditions
//         this.checkDamageConditions();
//         // Check for obstacle collisions
//         this.physics.overlap(this.player, this.obstacles, this.handleObstacleCollision, null, this);
//     }

//     checkDamageConditions() {
//         for (const [type, condition] of Object.entries(this.gameState.damageConditions)) {
//             if (condition.check(this.gameState)) {
//                 this.handleDamage(condition.reset(this.gameState));
//                 break; // Handle one damage condition at a time
//             }
//         }
//     }

//     handleDamage(message) {
//         this.gameState.lives--;
//         this.updateLives();

//         if (this.gameState.lives <= 0) {
//             this.gameOver();
//         } else {
//             // Move back 100 pixels in opposite direction of current angle
//             const angle = Phaser.Math.DegToRad(this.player.angle - 90);
//             this.player.x += Math.cos(angle) * 100;
//             this.player.y += Math.sin(angle) * 100;
//             this.gameState.speed = 0;

//             // Optional: Add temporary invulnerability or pause
//             this.scene.pause();
//             alert(`${message} Lives remaining: ${this.gameState.lives}`);
//             this.scene.resume();
//         }
//     }

//     updateLives() {
//         // Update life icons in the UI
//         const lifeIcons = document.querySelectorAll('.life-icon');
//         lifeIcons.forEach((icon, index) => {
//             icon.style.opacity = index < this.gameState.lives ? '1' : '0.2';
//         });
//     }

//     updateUIElements() {
//         const { speed, temp, fuel, score, casesCollected } = this.gameState;

//         // Update score
//         document.getElementById('score').textContent = `Score: ${score}`;

//         // Update speed
//         document.getElementById('speed-text').textContent = `${Math.round(speed)}`;
//         document.getElementById('speed-fill').style.width = `${(speed / this.gameState.maxSpeed) * 100}%`;
//         document.getElementById('speed-fill').style.backgroundColor =
//             speed > this.gameState.maxSpeed * 0.8 ? '#ff0000' : '#00ff00';

//         // Update temperature
//         document.getElementById('temp-text').textContent = `${Math.round(temp)}°C`;
//         document.getElementById('temp-fill').style.width = `${(temp / 130) * 100}%`;
//         document.getElementById('temp-fill').style.backgroundColor = this.getTemperatureColor(temp);

//         // Update fuel
//         document.getElementById('fuel-text').textContent = `${Math.round(fuel)}%`;
//         document.getElementById('fuel-fill').style.width = `${fuel}%`;
//         document.getElementById('fuel-fill').style.backgroundColor =
//             fuel < 25 ? '#ff0000' : '#00ff00';
//         // Update cases collected
//         document.getElementById('cases-collected').textContent = casesCollected;

//         // Update lives display
//         this.updateLives();
//     }
//     // Add new damage condition
//     addDamageCondition(name, checkFn, resetFn) {
//         this.gameState.damageConditions[name] = {
//             check: checkFn,
//             reset: resetFn
//         };
//     }

//     // Remove damage condition
//     removeDamageCondition(name) {
//         delete this.gameState.damageConditions[name];
//     }

//     getTempChangeRate(speed) {
//         const rates = {
//             0: -3, 1: -1, 2: -0.5, 3: -0.2, 4: 0.5,
//             5: 0.6, 6: 1.0, 7: 1.2, 8: 1.5, 9: 1.6, 10: 2.5
//         };
//         return rates[speed] || 0;
//     }

//     getFuelConsumptionRate(speed) {
//         const ratios = {
//             0: 1 / 240, 1: 1 / 120, 2: 1 / 96, 3: 1 / 90, 4: 1 / 84,
//             5: 1 / 72, 6: 1 / 60, 7: 1 / 54, 8: 1 / 48, 9: 1 / 42, 10: 1 / 30
//         };
//         return ratios[speed] || 0;
//     }

//     getTemperatureColor(temp) {
//         if (temp > 100) return '#ff0000';
//         if (temp > 80) return '#ffa500';
//         return '#00ff00';
//     }

//     gameOver() {
//         this.scene.pause();
//         alert('Game Over!');
//     }

//     initializeObstacles() {
//         // Create obstacle group
//         this.obstacles = this.physics.add.group();

//         // Place obstacles for each type
//         Object.entries(this.obstacleTypes).forEach(([type, config]) => {
//             this.placeObstacles(type, config);
//         });
//     }

//     placeObstacles(type, config) {
//         const { sprite, scale, density, distribution } = config;
//         const { minDistance, margin } = distribution;
//         const placedPositions = [];

//         for (let i = 0; i < density; i++) {
//             let position = this.getValidObstaclePosition(margin, minDistance, placedPositions);

//             if (position) {
//                 const obstacle = this.obstacles.create(position.x, position.y, sprite).setScale(scale);
//                 placedPositions.push(position);
//             }
//         }
//     }

//     getValidObstaclePosition(margin, minDistance, existingPositions) {
//         const maxAttempts = 50;
//         let attempts = 0;

//         while (attempts < maxAttempts) {
//             const x = Phaser.Math.Between(margin, this.worldSize.width - margin);
//             const y = Phaser.Math.Between(margin, this.worldSize.height - margin);

//             // Check distance from other obstacles
//             const isTooCloseToObstacles = existingPositions.some(pos => {
//                 const distance = Phaser.Math.Distance.Between(x, y, pos.x, pos.y);
//                 return distance < minDistance;
//             });

//             // Check distance from collectibles
//             const isTooCloseToCollectibles = this.collectibles.getChildren().some(collectible => {
//                 const distance = Phaser.Math.Distance.Between(x, y, collectible.x, collectible.y);
//                 return distance < minDistance;
//             });

//             // Check distance from player start position
//             const distanceFromStart = Phaser.Math.Distance.Between(
//                 x, y,
//                 this.worldSize.width / 2,
//                 this.worldSize.height / 2
//             );

//             if (!isTooCloseToObstacles && !isTooCloseToCollectibles && distanceFromStart > 200) {
//                 return { x, y };
//             }

//             attempts++;
//         }

//         // If we couldn't find a valid position after max attempts, try with a smaller safe distance
//         if (minDistance > 50) {
//             return this.getValidObstaclePosition(margin, minDistance * 0.8, existingPositions);
//         }

//         return null;
//     }

//     handleObstacleCollision(player, obstacle) {
//         this.handleDamage('Crashed into obstacle!');
//         // Optional: Add particles or effects here
//     }

//     // Add new obstacle type at runtime
//     addObstacleType(name, config) {
//         this.obstacleTypes[name] = config;
//         // Optionally place new obstacles immediately
//         this.placeObstacles(name, config);
//     }

//     // Remove obstacle type
//     removeObstacleType(name) {
//         if (this.obstacleTypes[name]) {
//             // Remove all obstacles of this type
//             this.obstacles.children.iterate(child => {
//                 if (child && child.texture.key === this.obstacleTypes[name].sprite) {
//                     child.destroy();
//                 }
//             });
//             delete this.obstacleTypes[name];
//         }
//     }
// }

// // Game configuration
// const config = {
//     type: Phaser.AUTO,
//     parent: 'game-container',
//     width: 824, // 1024 - 200 (sidebar width)
//     height: 768,
//     backgroundColor: '#FFFF00',
//     scene: GameScene,
//     physics: {
//         default: 'arcade',
//         arcade: {
//             gravity: { y: 0 },
//             debug: true
//         }
//     }
// };

// // Initialize game
// new Phaser.Game(config);
