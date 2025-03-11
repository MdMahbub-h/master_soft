import { regionPaths, regionColors } from "./regionPath.js";

function parseSVGPathToPolygon(path) {
  const polygons = [];
  let currentPolygon = [];
  let currentX = 0,
    currentY = 0;
  let startX = 0,
    startY = 0;
  const jumpThreshold = 50;

  const parts = path.trim().split(/(?=[mMlLhHvVcCsSqQtTaAzZ])/);

  parts.forEach((part) => {
    const command = part[0];
    const numbers = part
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    switch (command) {
      case "m":
      case "M": {
        const isRelative = command === "m";
        const [x, y] = numbers;

        if (Math.abs(x) > jumpThreshold || Math.abs(y) > jumpThreshold) {
          if (currentPolygon.length > 0) {
            polygons.push(currentPolygon);
            currentPolygon = [];
          }
        }

        if (isRelative) {
          currentX += x;
          currentY += y;
        } else {
          currentX = x;
          currentY = y;
        }

        startX = currentX;
        startY = currentY;
        currentPolygon.push([currentX, currentY]);

        for (let i = 2; i < numbers.length; i += 2) {
          currentX += numbers[i];
          currentY += numbers[i + 1];
          currentPolygon.push([currentX, currentY]);
        }
        break;
      }

      case "l":
      case "L": {
        const isRelative = command === "l";
        for (let i = 0; i < numbers.length; i += 2) {
          if (isRelative) {
            currentX += numbers[i];
            currentY += numbers[i + 1];
          } else {
            currentX = numbers[i];
            currentY = numbers[i + 1];
          }
          currentPolygon.push([currentX, currentY]);
        }
        break;
      }

      case "z":
      case "Z":
        if (currentPolygon.length > 0) {
          currentPolygon.push([startX, startY]);
          polygons.push(currentPolygon);
          currentPolygon = [];
        }
        break;
    }
  });

  if (currentPolygon.length > 0) {
    polygons.push(currentPolygon);
  }

  return polygons.reduce(
    (largest, current) => (current.length > largest.length ? current : largest),
    polygons[0]
  );
}

// MainScene.js
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.regions = [];
    this.scale = 10;
  }

  create() {
    // Test polygon
    this.graphics = this.add.graphics();
    this.graphics.lineStyle(2, 0xff0000);

    Object.entries(regionPaths).forEach(([name, path]) => {
      const coords = parseSVGPathToPolygon(path);

      const polygon = new Phaser.Geom.Polygon(coords);

      polygon.points = polygon.points.map((point) => ({
        x: (point.x - 300) * 2, // Center around origin
        y: (point.y - 800) * 2,
      }));

      this.regions.push({
        name,
        polygon,
        color: regionColors[name],
      });
    });

    this.regions.forEach((region) => {
      this.graphics.lineStyle(2, region.color);
      this.graphics.strokePoints(region.polygon.points, true);
    });

    // Add player for testing
    this.player = this.add.circle(400, 300, 10, 0x00ff00);
    this.physics.add.existing(this.player);

    // Movement controls
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const speed = 5;
    if (this.cursors.left.isDown) this.player.x -= speed;
    if (this.cursors.right.isDown) this.player.x += speed;
    if (this.cursors.up.isDown) this.player.y -= speed;
    if (this.cursors.down.isDown) this.player.y += speed;

    // Check if player is in any region
    let inRegion = false;
    this.regions.forEach((region) => {
      if (
        Phaser.Geom.Polygon.Contains(
          region.polygon,
          this.player.x,
          this.player.y
        )
      ) {
        this.player.fillColor = region.color;
        inRegion = true;
        console.log(`In region: ${region.name}`);
      }
    });
    if (!inRegion) {
      this.player.fillColor = 0x00ff00;
    }
  }
}

// config.js
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: { debug: true },
  },
  scene: MainScene,
};

new Phaser.Game(config);
