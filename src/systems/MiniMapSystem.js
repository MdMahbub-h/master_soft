class MinimapSystem {
  constructor(scene, movementManager, boundingBox, spawnPoint) {
    this.scene = scene;
    this.movementManager = movementManager; // Use MovementManager for position calculations
    this.boundingBox = boundingBox;
    this.mapImageKey = "ukMap"; // Key of the map image loaded in Phaser
    this.mapWidth = 200; // Full map width (200)
    this.mapHeight = 373; // Full map height (373)
    this.minimapWidth = 200; // Width of the minimap container
    this.minimapHeight = 200; // Height of the minimap container
    this.spawnPoint = spawnPoint; // Initial spawn point of the player

    // Get the minimap canvas and context
    this.minimapCanvas = document.getElementById("minimap-canvas");
    this.minimapContext = this.minimapCanvas.getContext("2d");

    // Set canvas size to match the minimap container
    this.minimapCanvas.width = 200;
    this.minimapCanvas.height = 200;

    // Load the map image
    this.mapImage = this.scene.textures.get(this.mapImageKey).getSourceImage();

    // Initialize the minimap
    this.drawMinimap();
  }

  drawMinimap() {
    // Clear the canvas
    this.minimapContext.clearRect(0, 0, this.minimapWidth, this.minimapHeight);

    // Get the player's world position
    const playerWorldPos = this.movementManager.screenToWorld(
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY
    );

    // Calculate scaling factors
    const worldWidth = this.boundingBox.width; // Total world width (e.g., 2400)
    const worldHeight = this.boundingBox.height; // Total world height (e.g., 2400)
    const scaleX = this.minimapWidth / worldWidth; // Scaling factor for X
    const scaleY = this.minimapHeight / worldHeight; // Scaling factor for Y

    // Calculate the player's position on the minimap
    const playerMinimapX = (playerWorldPos.x - this.boundingBox.x) * scaleX; // Scale X position
    const playerMinimapY = (playerWorldPos.y - this.boundingBox.y) * scaleY; // Scale Y position

    // Calculate the vertical scroll position based on the player's Y position
    const scrollRatio = (playerWorldPos.y - this.boundingBox.y) / worldHeight; // Ratio of player's Y position to world height
    const scrollY = scrollRatio * (this.mapHeight - this.minimapHeight); // Scroll offset

    // Draw the visible portion of the map
    this.minimapContext.drawImage(
      this.mapImage, // Map image
      0, // Source X (start from left)
      scrollY, // Source Y (scroll vertically)
      this.mapWidth, // Source width (full map width)
      this.minimapHeight, // Source height (visible height)
      0, // Destination X
      0, // Destination Y
      this.minimapWidth, // Destination width
      this.minimapHeight // Destination height
    );

    // Draw the player's position as a red dot
    this.minimapContext.fillStyle = "#ff0000"; // Red dot
    this.minimapContext.beginPath();
    this.minimapContext.arc(playerMinimapX, playerMinimapY, 3, 0, 2 * Math.PI); // Dot size
    this.minimapContext.fill();
  }
  update() {
    // Redraw the minimap with the updated player position
    this.drawMinimap();
  }

  destroy() {
    // Clear the canvas
    this.minimapContext.clearRect(0, 0, this.minimapWidth, this.minimapHeight);
  }
}

export { MinimapSystem };
// class MinimapSystem {
//   constructor(scene, movementManager, boundingBox) {
//     this.scene = scene;
//     this.movementManager = movementManager;
//     this.dot = document.querySelector(".map > .dot");
//     this.regionScale = 25;
//     this.scaleX = 200 / boundingBox.width;
//     this.scaleY = 250 / boundingBox.height;
//     this.XOffset = boundingBox.x
//     this.YOffset = boundingBox.y
//   }

//   update() {
//     const worldPoint = this.movementManager.screenToWorld(
//       this.scene.cameras.main.centerX,
//       this.scene.cameras.main.centerY
//     );
//     this.dot.style.left = `${(worldPoint.x - this.XOffset) * this.scaleX}px`;
//     this.dot.style.top = `${(worldPoint.y - this.YOffset) * this.scaleY + 4}px`;
//   }
// }
// export { MinimapSystem };
