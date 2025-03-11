class SoundManager {
  constructor(sounds) {
    this.sounds = sounds;
  }

  playEngineSound(currentSpeed, maxSpeed, controls) {
    if (currentSpeed === 0) {
      this.handleIdleSound();
    } else {
      this.handleDrivingSounds(currentSpeed, maxSpeed, controls);
    }
  }

  handleIdleSound() {
    this.stopEngineSounds(["accelerate", "braking", "topspeed"]);
    if (!this.sounds.idle.isPlaying) {
      this.sounds.idle.play();
    }
  }

  handleDrivingSounds(currentSpeed, maxSpeed, controls) {
    this.sounds.idle.stop();
    this.handleAcceleration(currentSpeed, maxSpeed, controls);
    this.handleTopSpeed(currentSpeed, maxSpeed, controls);
    this.handleBraking(currentSpeed, controls);
  }

  handleAcceleration(currentSpeed, maxSpeed, controls) {
    if (controls.accelerate.isDown && Math.round(currentSpeed) < maxSpeed) {
      if (
        !this.sounds.accelerate.isPlaying &&
        !this.sounds.topspeed.isPlaying
      ) {
        this.sounds.accelerate.play();
      }
    } else {
      this.sounds.accelerate.stop();
    }
  }

  handleTopSpeed(currentSpeed, maxSpeed, controls) {
    if (Math.round(currentSpeed) === maxSpeed) {
      this.sounds.accelerate.stop();
      if (!this.sounds.topspeed.isPlaying && controls.accelerate.isDown) {
        this.sounds.topspeed.play({ loop: true });
      }
    } else if (Math.round(currentSpeed) < maxSpeed) {
      this.sounds.topspeed.stop();
    }
  }

  handleBraking(currentSpeed, controls) {
    if (
      controls.brake.isDown ||
      (!controls.accelerate.isDown && currentSpeed > 0)
    ) {
      if (!this.sounds.braking.isPlaying) {
        this.sounds.braking.play();
      }
    } else {
      this.sounds.braking.stop();
    }
  }

  stopEngineSounds(soundKeys) {
    soundKeys.forEach((key) => this.sounds[key].stop());
  }
}
export { SoundManager };
