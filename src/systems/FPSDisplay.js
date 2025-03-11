class FPSDisplay {
    constructor(scene) {
      this.scene = scene;
      this.text = scene.add.text(10, 10, 'FPS: 0', {
        font: '16px Arial',
        fill: '#00ff00'
      });
      this.text.setScrollFactor(0);
      this.text.setDepth(999);
      
      // Update every 100ms instead of every frame
      this.timer = scene.time.addEvent({
        delay: 100,
        callback: this.updateFPS,
        callbackScope: this,
        loop: true
      });
    }
  
    updateFPS() {
      this.text.setText(`FPS: ${Math.round(this.scene.game.loop.actualFps)}`);
    }
  
    destroy() {
      if (this.timer) this.timer.destroy();
      if (this.text) this.text.destroy();
    }
  }
  
  export { FPSDisplay };