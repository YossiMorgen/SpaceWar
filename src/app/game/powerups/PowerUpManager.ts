import * as THREE from 'three';
import { PowerUp } from './PowerUp';
import { PowerUpType, POWERUP_CONFIGS } from './PowerUpType';

export class PowerUpManager {
  scene: THREE.Scene;
  powerUps: PowerUp[];
  spawnDistance: number;
  removeDistance: number;
  spawnTimer: number;
  spawnInterval: number;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.powerUps = [];
    this.spawnDistance = 100;
    this.removeDistance = 20;
    this.spawnTimer = 0;
    this.spawnInterval = 8.0;
  }

  update(dt: number, playerPosition: THREE.Vector3, hasMagnet: boolean = false): PowerUp | null {
    this.spawnTimer += dt;

    if (this.spawnTimer > this.spawnInterval) {
      const powerUpType = this.getRandomPowerUpType();
      const config = POWERUP_CONFIGS[powerUpType];
      const powerUp = new PowerUp(this.scene, powerUpType, config, playerPosition.z - this.spawnDistance);
      this.powerUps.push(powerUp);
      this.spawnTimer = 0;
    }

    if (hasMagnet) {
      this.applyMagnet(playerPosition, 25.0, dt);
    }

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      if (!powerUp.active) {
        this.powerUps.splice(i, 1);
        continue;
      }

      powerUp.update(dt);

      if (powerUp.getPosition().z > playerPosition.z + this.removeDistance) {
        powerUp.destroy();
        this.powerUps.splice(i, 1);
      }
    }

    return null;
  }

  applyMagnet(playerPosition: THREE.Vector3, magnetStrength: number, dt: number): void {
    for (const powerUp of this.powerUps) {
      const distance = powerUp.getPosition().distanceTo(playerPosition);
      if (distance < 15 && distance > 0.5) {
        const direction = new THREE.Vector3();
        direction.subVectors(playerPosition, powerUp.getPosition());
        direction.normalize();
        const pullForce = magnetStrength * dt * (15 - distance) / 15;
        powerUp.mesh.position.addScaledVector(direction, pullForce);
      }
    }
  }

  checkCollection(playerMesh: THREE.Group): PowerUp | null {
    const playerBox = new THREE.Box3().setFromObject(playerMesh);

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      if (powerUp.checkCollision(playerMesh)) {
        const collected = powerUp;
        powerUp.destroy();
        this.powerUps.splice(i, 1);
        return collected;
      }
    }

    return null;
  }

  private getRandomPowerUpType(): PowerUpType {
    const types = Object.values(PowerUpType);
    const weights = [0.2, 0.2, 0.15, 0.15, 0.1, 0.15, 0.05];
    const rand = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        return types[i];
      }
    }
    return PowerUpType.SHIELD;
  }

  reset(): void {
    for (const powerUp of this.powerUps) {
      powerUp.destroy();
    }
    this.powerUps = [];
    this.spawnTimer = 0;
  }
}

