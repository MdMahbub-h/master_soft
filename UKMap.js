// First, create a class to handle the UK map boundaries
class UKMapBoundary {
    constructor(mapImage, scene, debug = false) {
        this.debug = debug;
        this.scene = scene
        this.mapImage = mapImage;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.initialize();
    }

    initialize() {
        // Set canvas size to match map image
        this.canvas.width = this.mapImage.width;
        this.canvas.height = this.mapImage.height;

        // Draw the map to the canvas
        this.ctx.drawImage(this.mapImage, 0, 0);

        // Get the image data to check for boundaries
        this.imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        if (this.debug)
            this.drawBoundaryOutline();
    }

    // Check if a point is within the map boundaries
    isPointInBounds(x, y) {
        // Convert coordinates to integer
        x = Math.floor(x);
        y = Math.floor(y);

        // Check if point is within canvas bounds
        if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
            return false;
        }

        // Get pixel alpha value at point (4 channels: r,g,b,a)
        const index = (y * this.canvas.width + x) * 4;
        const alpha = this.imageData.data[index + 3];

        // Point is in bounds if pixel is not transparent
        return alpha > 0;
    }

    // Constrain a point to stay within bounds
    constrainPoint(x, y) {
        // Convert game coordinates to image coordinates
        const imageX = (x - this.boundaryOffset.x) / this.boundaryScale;
        const imageY = (y - this.boundaryOffset.y) / this.boundaryScale;

        if (this.isPointInBounds(imageX, imageY)) {
            return { x, y };
        }

        // Find closest valid point
        // Increase search radius to match scale
        const radius = 20 * this.boundaryScale;
        for (let r = 1; r <= radius; r++) {
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
                const testX = imageX + Math.cos(angle) * r;
                const testY = imageY + Math.sin(angle) * r;

                if (this.isPointInBounds(testX, testY)) {
                    // Convert back to game coordinates
                    return {
                        x: testX * this.boundaryScale + this.boundaryOffset.x,
                        y: testY * this.boundaryScale + this.boundaryOffset.y
                    };
                }
            }
        }

        return { x, y };
    }
    
    // drawBoundaryOutline() {
    //     const boundaryCanvas = document.createElement('canvas');
    //     const boundaryCtx = boundaryCanvas.getContext('2d');
    //     boundaryCanvas.width = this.scene.game.config.width;
    //     boundaryCanvas.height = this.scene.game.config.height;

    //     const scaleX = boundaryCanvas.width / this.canvas.width;
    //     const scaleY = boundaryCanvas.height / this.canvas.height;
    //     const scale = Math.min(scaleX, scaleY);

    //     const offsetX = (boundaryCanvas.width - this.canvas.width * scale) / 2;
    //     const offsetY = (boundaryCanvas.height - this.canvas.height * scale) / 2;

    //     boundaryCtx.translate(offsetX, offsetY);
    //     boundaryCtx.scale(scale, scale);

    //     // Find edge pixels
    //     const edgePixels = [];
    //     for (let y = 1; y < this.canvas.height - 1; y++) {
    //         for (let x = 1; x < this.canvas.width - 1; x++) {
    //             if (this.isEdgePixel(x, y)) {
    //                 edgePixels.push({ x, y });
    //             }
    //         }
    //     }

    //     const connectedPixels = new Set();
    //     const stack = [];

    //     // Find leftmost and rightmost pixels for each row at edges
    //     const topPixels = edgePixels.filter(p => p.y <= 3);
    //     const bottomPixels = edgePixels.filter(p => p.y >= this.canvas.height - 4);

    //     if (topPixels.length > 0) {
    //         topPixels.forEach(p => {
    //             stack.push(p);
    //             connectedPixels.add(`${p.x},${p.y}`);
    //         });
    //     }

    //     if (bottomPixels.length > 0) {
    //         bottomPixels.forEach(p => {
    //             stack.push(p);
    //             connectedPixels.add(`${p.x},${p.y}`);
    //         });
    //     }
    //     if (edgePixels.length > 0) {
    //         stack.push(edgePixels[0]);
    //         connectedPixels.add(`${edgePixels[0].x},${edgePixels[0].y}`);
    //     }

    //     while (stack.length > 0) {
    //         const current = stack.pop();
    //         for (let dy = -3; dy <= 3; dy++) {
    //             for (let dx = -3; dx <= 3; dx++) {
    //                 const nextPixel = edgePixels.find(p =>
    //                     p.x === current.x + dx &&
    //                     p.y === current.y + dy
    //                 );
    //                 if (nextPixel && !connectedPixels.has(`${nextPixel.x},${nextPixel.y}`)) {
    //                     stack.push(nextPixel);
    //                     connectedPixels.add(`${nextPixel.x},${nextPixel.y}`);
    //                 }
    //             }
    //         }
    //     }

    //     // Filter and sort connected pixels
    //     const filteredEdgePixels = edgePixels
    //         .filter(p => connectedPixels.has(`${p.x},${p.y}`))
    //         .sort((a, b) => a.x - b.x || a.y - b.y);

    //     // Draw outline
    //     boundaryCtx.strokeStyle = '#000000';
    //     boundaryCtx.lineWidth = 2;
    //     boundaryCtx.beginPath();

    //     const maxDistance = 3;
    //     if (filteredEdgePixels.length > 0) {
    //         boundaryCtx.moveTo(filteredEdgePixels[0].x, filteredEdgePixels[0].y);
    //         for (let i = 1; i < filteredEdgePixels.length; i++) {
    //             const prev = filteredEdgePixels[i - 1];
    //             const curr = filteredEdgePixels[i];
    //             if (Math.hypot(curr.x - prev.x, curr.y - prev.y) < maxDistance) {
    //                 boundaryCtx.lineTo(curr.x, curr.y);
    //             } else {
    //                 boundaryCtx.moveTo(curr.x, curr.y);
    //             }
    //         }
    //     }

    //     boundaryCtx.stroke();

    //     const visualScale = 3.5; // Store the visual scaling factor

    //     // Update boundary info for collision BEFORE drawing
    //     this.boundaryScale = scale * visualScale;
    //     this.boundaryOffset = { 
    //         x: offsetX * visualScale, 
    //         y: offsetY * visualScale 
    //     };

    //     const texture = this.scene.textures.createCanvas('boundaryTexture', boundaryCanvas.width, boundaryCanvas.height);
    //     texture.draw(0, 0, boundaryCanvas);
    //     texture.refresh();

    //     this.scene.add.image(0, 0, 'boundaryTexture').setOrigin(0).setScale(visualScale);
    // }

    drawBoundaryOutline() {
        const boundaryCanvas = document.createElement('canvas');
        const boundaryCtx = boundaryCanvas.getContext('2d');
        boundaryCanvas.width = this.scene.worldSize.width;
        boundaryCanvas.height = this.scene.worldSize.height;

        const scaleX = boundaryCanvas.width / this.canvas.width;
        const scaleY = boundaryCanvas.height / this.canvas.height;
        const scale = Math.min(scaleX, scaleY);

        const offsetX = (boundaryCanvas.width - this.canvas.width * scale) / 2;
        const offsetY = (boundaryCanvas.height - this.canvas.height * scale) / 2;

        boundaryCtx.save();
        boundaryCtx.translate(offsetX, offsetY);
        boundaryCtx.scale(scale, scale);

        // Draw edges
        boundaryCtx.strokeStyle = '#000000';
        boundaryCtx.lineWidth = 2;
        boundaryCtx.beginPath();

        // Edge detection and drawing
        const edgePixels = [];
        for (let y = 1; y < this.canvas.height - 1; y++) {
            for (let x = 1; x < this.canvas.width - 1; x++) {
                if (this.isEdgePixel(x, y)) {
                    edgePixels.push({ x, y });
                }
            }
        }

        if (edgePixels.length > 0) {
            boundaryCtx.moveTo(edgePixels[0].x, edgePixels[0].y);
            for (let i = 1; i < edgePixels.length; i++) {
                boundaryCtx.lineTo(edgePixels[i].x, edgePixels[i].y);
            }
        }

        boundaryCtx.stroke();
        boundaryCtx.restore();

        // Store for collision detection
        this.boundaryScale = scale;
        this.boundaryOffset = { x: offsetX, y: offsetY };

        // Create world-space boundary
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(2, 0x000000);

        edgePixels.forEach((pixel, i) => {
            const worldX = pixel.x * scale + offsetX;
            const worldY = pixel.y * scale + offsetY;

            if (i === 0) {
                graphics.moveTo(worldX, worldY);
            } else {
                graphics.lineTo(worldX, worldY);
            }
        });

        graphics.strokePath();
    }
    isEdgePixel(x, y) {
        const isCurrentPixelOpaque = this.isPointInBounds(x, y);

        // Check surrounding pixels
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;

                const neighborOpaque = this.isPointInBounds(x + dx, y + dy);
                // If current pixel and neighbor have different opacity, it's an edge
                if (isCurrentPixelOpaque !== neighborOpaque) {
                    return true;
                }
            }
        }
        return false;
    }

    findClosestEdgePoint(x, y) {
        let closestX = x;
        let closestY = y;
        let closestDist = Infinity;

        // Search along the edges of the current position
        for (let testX = x - 20; testX <= x + 20; testX++) {
            for (let testY = y - 20; testY <= y + 20; testY++) {
                if (this.isPointInBounds(testX, testY)) {
                    const dist = Math.hypot(testX - x, testY - y);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestX = testX;
                        closestY = testY;
                    }
                }
            }
        }

        return { x: closestX, y: closestY };
    }
}

// // Example usage in Phaser 3:
// class GameScene extends Phaser.Scene {
//     constructor() {
//         super({ key: 'GameScene' });
//         this.mapBoundary = null;
//     }

//     preload() {
//         this.load.image('uk-map', 'assets/map.png');
//         this.load.image('player', 'assets/car.png');
//     }

//     create() {
//         // Load map image but don't add it to scene
//         const mapTexture = this.textures.get('uk-map');
//         if (!mapTexture) {
//             console.error('Map texture not loaded');
//             return;
//         }
//         const mapImage = mapTexture.getSourceImage();
//         console.log('Map dimensions:', mapImage.width, mapImage.height);
//         // Initialize boundary system with debug mode
//         this.mapBoundary = new UKMapBoundary(mapImage, this, true);

//         // Create player
//         this.player = this.add.sprite(400, 300, 'player').setScale(0.15);;

//         // Set up movement controls
//         this.cursors = this.input.keyboard.createCursorKeys();
//     }

//     update() {
//         // Handle player movement
//         const speed = 5;
//         let newX = this.player.x;
//         let newY = this.player.y;

//         if (this.cursors.left.isDown) {
//             newX -= speed;
//         }
//         if (this.cursors.right.isDown) {
//             newX += speed;
//         }
//         if (this.cursors.up.isDown) {
//             newY -= speed;
//         }
//         if (this.cursors.down.isDown) {
//             newY += speed;
//         }

//         // Constrain player position to map boundaries
//         const constrained = this.mapBoundary.constrainPoint(newX, newY);
//         this.player.setPosition(constrained.x, constrained.y);
//     }
// }
