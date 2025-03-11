class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: "LoadingScene" });
  }

  preload() {
    // Load all assets
    [
      //bg
      "splashScreen",
      "dot_pattern",
      //players
      "car",
      "enemy",
      //collectibles
      "fuel",
      "case",
      //obstacles
      "tree",
      "rock",
      "missile",
      "steel",
      "building",
      "complete",
      "map",
      "ukMap",
    ].forEach((asset) => {
      this.load.image(asset, `assets/${asset}.png`);
    });

    //Add audio assets
    const audioFiles = [
      "accelerate",
      "braking",
      "crash",
      "idle",
      "refuel",
      "topspeed",
      "skid",
      "overheating",
      "blowup",
    ];
    audioFiles.forEach((audio) => {
      this.load.audio(audio, `assets/audio/${audio}.mp3`);
    });

    //Add Sprtiesheet assets
    const spriteSheets = ["explosion"];
    spriteSheets.forEach((spriteSheet) => {
      this.load.spritesheet(spriteSheet, `assets/${spriteSheet}.png`, {
        frameWidth: 75,
        frameHeight: 49,
      });
    });

    // Loading bar
    const progress = this.add.graphics();
    this.load.on("progress", (value) => {
      progress.clear();
      progress.fillStyle(0xffffff, 1);
      progress.fillRect(
        0,
        this.sys.game.config.height / 2,
        this.sys.game.config.width * value,
        60
      );
    });
  }

  create() {
    this.scene.stop();
    this.scene.start("MenuScene");
    // this.scene.start("GameScene");
  }
}
export { LoadingScene };
