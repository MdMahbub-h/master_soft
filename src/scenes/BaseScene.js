class BaseScene extends Phaser.Scene {
  constructor(key) {
    super(key);
  }

  updateUI(gameState) {
    document.getElementById("score").textContent = `Score: ${gameState.score}`;
    document.getElementById("speed-text").textContent = `${Math.round(
      gameState.speed
    )}`;
    document.getElementById("temp-text").textContent = `${Math.round(
      gameState.temp
    )}°C`;
    document.getElementById("fuel-text").textContent = `${Math.round(
      gameState.fuel
    )}%`;
    document.getElementById("cases-collected").textContent =
      gameState.casesCollected || 0;

    // Update gauge fills
    document.getElementById("speed-fill").style.width = `${
      (gameState.speed / 10) * 100
    }%`;
    document.getElementById("temp-fill").style.width = `${
      (gameState.temp / 130) * 100
    }%`;
    document.getElementById("fuel-fill").style.width = `${gameState.fuel}%`;

    // Update speed
    document.getElementById("speed-fill").style.backgroundColor =
      gameState.speed > 10 * 0.8 ? "#ff0000" : "#00ff00";

    // Update temperature
    document.getElementById("temp-fill").style.backgroundColor =
      this.getTemperatureColor(gameState.temp);

    // Update fuel
    document.getElementById("fuel-fill").style.backgroundColor =
      gameState.fuel < 25 ? "#ff0000" : "#00ff00";

    // // Update Region
    // document.getElementById(
    //   "current-region"
    // ).textContent = `Current Region: ${gameState.currentRegion}`;

    // Update lives
    const lifeIcons = document.querySelectorAll(".life-icon");
    lifeIcons.forEach((icon, index) => {
      icon.style.opacity = index < gameState.lives ? "1" : "0.2";
    });
  }

  getTemperatureColor(temp) {
    if (temp > 100) return "#ff0000";
    if (temp > 80) return "#ffa500";
    return "#00ff00";
  }
}
export { BaseScene };
