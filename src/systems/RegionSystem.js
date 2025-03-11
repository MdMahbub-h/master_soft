import { regionPaths } from "../../regionPath.js";
class RandomPolygonPoint {
  constructor(vertices) {
    if (vertices.length < 3) {
      throw new Error("Polygon must have at least 3 vertices");
    }
    this.triangles = [];
    this.totalArea = 0;
    this.triangulate(vertices);
  }

  /**
   * Triangulates the polygon using the fan method from the first vertex
   */
  triangulate(vertices) {
    const baseVertex = vertices[0];

    // Create triangles using the fan method
    for (let i = 1; i < vertices.length - 1; i++) {
      const triangle = {
        vertices: [baseVertex, vertices[i], vertices[i + 1]],
        area: this.calculateTriangleArea(
          baseVertex,
          vertices[i],
          vertices[i + 1]
        ),
      };

      this.triangles.push(triangle);
      this.totalArea += triangle.area;
    }
  }

  /**
   * Calculates the area of a triangle using the shoelace formula
   */
  calculateTriangleArea(p1, p2, p3) {
    return Math.abs(
      (p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2
    );
  }

  /**
   * Selects a random triangle weighted by area
   */
  selectRandomTriangle() {
    let randomArea = Math.random() * this.totalArea;
    let accumulatedArea = 0;

    for (const triangle of this.triangles) {
      accumulatedArea += triangle.area;
      if (randomArea <= accumulatedArea) {
        return triangle;
      }
    }

    // Fallback to last triangle (shouldn't happen due to floating point precision)
    return this.triangles[this.triangles.length - 1];
  }

  /*
   * Generates a random point within a triangle using barycentric coordinates
   */
  generatePointInTriangle(triangle) {
    // isInRegion;
    // Generate barycentric coordinates
    let r1 = Math.random() / 2 + 2.5;
    let r2 = Math.random() / 2 + 2.5;

    // Square root method for uniform distribution
    r1 = Math.sqrt(r1);

    const [p1, p2, p3] = triangle.vertices;
    const a = 1 - r1;
    const b = r1 * (1 - r2);
    const c = r1 * r2;

    // let point = {};
    // point.x = a * p1.x + b * p2.x + c * p3.x;
    // point.y = a * p1.y + b * p2.y + c * p3.y;
    // for (const region of ) {
    //   if (isInRegion(point, region)) {
    //     console.log("true");
    //   }
    // }
    // console.log(a * p1.x + b * p2.x + c * p3.x, a * p1.y + b * p2.y + c * p3.y);

    // Convert barycentric coordinates to Cartesian coordinates
    return {
      x: a * p1.x + b * p2.x + c * p3.x,
      y: a * p1.y + b * p2.y + c * p3.y,
    };
  }

  /**
   * Generates a random point within the polygon
   */
  generatePoint() {
    const selectedTriangle = this.selectRandomTriangle();
    return this.generatePointInTriangle(selectedTriangle);
  }
}

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
class RegionSystem {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;
    this.regions = [];
    this.scale = 20;
    this.setupRegions();
    this.setupDebugGraphics();
  }

  cleanup() {
    // Clean up debug graphics
    if (this.debugContainer) {
      this.debugContainer.destroy();
    }
    if (this.debugGraphics) {
      this.debugGraphics.destroy();
    }
    this.debugTexts.forEach((text) => text.destroy());
    this.debugTexts = [];

    // Clean up regions
    this.regions.forEach((region) => region.destroy());
    this.regions = [];
  }

  getBoundingBox(polygon) {
    return Phaser.Geom.Polygon.GetAABB(polygon);
  }
  // Helper function for simpler usage
  generateRandomPointInPolygon(polygon) {
    const generator = new RandomPolygonPoint(polygon.points);
    return generator.generatePoint();
  }

  setupRegions() {
    Object.entries(regionPaths).forEach(([name, details]) => {
      this.regions.push({
        name: details.name,
        polygon: new Phaser.Geom.Polygon(
          parseSVGPathToPolygon(details.path).map(([x, y]) => ({
            x: x * this.scale,
            y: y * this.scale,
          }))
        ),
        color: details.color,
      });
    });
  }

  setupDebugGraphics() {
    this.debugContainer = this.scene.add.container(0, 0);
    this.debugContainer.setDepth(0);
    this.debugGraphics = this.scene.add.graphics();
    this.debugContainer.add(this.debugGraphics);
    this.debugTexts = [];
    this.drawRegions();
  }
  getBoundingBoxOfAll() {
    const allBoundingBoxes = this.regions.map((region) =>
      this.getBoundingBox(region.polygon)
    );
    return allBoundingBoxes.reduce(
      (acc, box) => ({
        x: Math.min(acc.x, box.x),
        y: Math.min(acc.y, box.y),
        width: Math.max(acc.right, box.right) - Math.min(acc.x, box.x),
        height: Math.max(acc.bottom, box.bottom) - Math.min(acc.y, box.y),
        type: box.type,
        bottom: Math.max(acc.bottom, box.bottom),
        centerX: (Math.min(acc.x, box.x) + Math.max(acc.right, box.right)) / 2,
        centerY:
          (Math.min(acc.y, box.y) + Math.max(acc.bottom, box.bottom)) / 2,
        left: Math.min(acc.x, box.x),
        right: Math.max(acc.right, box.right),
        top: Math.min(acc.y, box.y),
      }),
      allBoundingBoxes[0]
    );
  }
  drawRegions() {
    this.debugGraphics.clear();
    this.debugTexts.forEach((text) => text.destroy());
    this.debugTexts = [];

    this.regions.forEach((region) => {
      // region.polygon = Phaser.Geom.Polygon.Simplify(region.polygon)
      this.debugGraphics.lineStyle(2, region.color || 0xff0000);
      this.debugGraphics.fillStyle(region.color || 0xff0000, 0.5); // 0.2 is alpha/opacity
      this.debugGraphics.beginPath();
      this.debugGraphics.moveTo(
        region.polygon.points[0].x,
        region.polygon.points[0].y
      );
      region.polygon.points.forEach((point) => {
        this.debugGraphics.lineTo(point.x, point.y);
      });
      this.debugGraphics.closePath();
      this.debugGraphics.fillPath();
      this.debugGraphics.strokePath();

      const bounds = this.getBoundingBox(region.polygon);
      if (region.name == "South East") {
        const text = this.scene.add.text(
          bounds.centerX * 0.95,
          bounds.centerY,
          region.name,
          {
            font: "16px Arial",
            fill: "#ff0000",
          }
        );
        this.debugContainer.add(text);
        this.debugTexts.push(text);
      } else {
        const text = this.scene.add.text(
          bounds.centerX,
          bounds.centerY,
          region.name,
          {
            font: "16px Arial",
            fill: "#ff0000",
          }
        );
        this.debugContainer.add(text);
        this.debugTexts.push(text);
      }
    });
  }

  update(playerWorldPos, worldOffset) {
    if (worldOffset) {
      this.debugContainer.setPosition(-worldOffset.x, -worldOffset.y);
    }

    for (const region of this.regions) {
      if (this.isInRegion(playerWorldPos, region)) {
        if (this.gameState.get("currentRegion") !== region.name) {
          this.gameState.update("currentRegion", region.name);
          this.scene.events.emit("updateRegion");
        }
        return;
      }
    }
    // this.scene.start();
    this.gameState.update("currentRegion", "Unknown");
    this.scene.events.emit("updateRegion");
  }

  getRandomSpawnPoint() {
    const region = Phaser.Utils.Array.GetRandom(this.regions);
    return this.generateRandomPointInPolygon(region.polygon);
  }

  isInRegion(position, region) {
    //   if (
    //     Phaser.Geom.Polygon.Contains(region.polygon, position.x, position.y) &&
    //     Phaser.Geom.Polygon.Contains(
    //       region.polygon,
    //       position.x + 150,
    //       position.y + 150
    //     ) &&
    //     Phaser.Geom.Polygon.Contains(
    //       region.polygon,
    //       position.x - 150,
    //       position.y - 150
    //     ) &&
    //     Phaser.Geom.Polygon.Contains(
    //       region.polygon,
    //       position.x - 150,
    //       position.y + 150
    //     ) &&
    //     Phaser.Geom.Polygon.Contains(
    //       region.polygon,
    //       position.x + 150,
    //       position.y - 150
    //     )
    //   ) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // }
    return Phaser.Geom.Polygon.Contains(region.polygon, position.x, position.y);
  }
  // pointInRegion(point) {
  //   let point = this.getRandomSpawnPoint()
  //   for (const region of this.regions) {
  //     while (!this.isInRegion(point, region)) {
  //       point = this.getRandomSpawnPoint();
  //     }
  //     return point;
  //   }
  // }
}

export { RegionSystem };
