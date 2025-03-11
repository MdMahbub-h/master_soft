class GameState extends Phaser.Events.EventEmitter {
  constructor() {
    super();
    this.initializeState();
  }
  initializeState() {
    this.state = {
      score: 0,
      fuel: 100,
      temp: 50,
      speed: 0,
      lives: 3,
      currentRegion: "None",
      casesCollected: 0,
    };
    this.emit("stateChange", this.state);
  }

  // Add reset method
  reset() {
    this.initializeState();
  }
  update(key, value) {
    this.state[key] = value;
    this.emit("stateChange", this.state);
  }

  get(key) {
    return this.state[key];
  }
}
export { GameState };
