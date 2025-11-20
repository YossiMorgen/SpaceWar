import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy';
import { EnemyType, EnemyConfig } from './EnemyTypes';
import { EnemyProjectileManager } from '../../EnemyProjectileManager';

const BOSS_CONFIG: EnemyConfig = {
  health: 15,
  speed: 0.5,
  scoreValue: 1000,
  color: 0xff0088,
  size: 1.4
};

export class BossEnemy extends BaseEnemy {
  private shootTimer: number;
  private shootInterval: number;
  private playerPosition: THREE.Vector3 | null;
  private projectileManager: EnemyProjectileManager;
  private phase: number;
  private phaseTimer: number;
  private chargeDirection: THREE.Vector3 | null;

  constructor(scene: THREE.Scene, zPos: number, projectileManager: EnemyProjectileManager) {
    super(scene, EnemyType.BASIC, BOSS_CONFIG, zPos);
    this.maxHealth = BOSS_CONFIG.health;
    this.health = BOSS_CONFIG.health;
    this.shootTimer = 0;
    this.shootInterval = 1.5;
    this.playerPosition = null;
    this.projectileManager = projectileManager;
    this.phase = 0;
    this.phaseTimer = 0;
    this.chargeDirection = null;
  }

  setPlayerPosition(position: THREE.Vector3): void {
    this.playerPosition = position;
  }

  createMesh(): THREE.Group {
    const group = new THREE.Group();

    const bodyGeom = new THREE.ConeGeometry(1.2 * this.config.size, 3 * this.config.size, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.config.color,
      emissive: this.config.color * 0.3,
      roughness: 0.2,
      metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const wingGeom = new THREE.BoxGeometry(4 * this.config.size, 0.2, 1 * this.config.size);
    const wingMat = new THREE.MeshStandardMaterial({ color: this.config.color * 0.7 });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    group.add(wings);

    for (let i = 0; i < 4; i++) {
      const cannonGeom = new THREE.CylinderGeometry(0.3 * this.config.size, 0.3 * this.config.size, 1.2 * this.config.size, 8);
      const cannonMat = new THREE.MeshStandardMaterial({ color: this.config.color * 0.9 });
      const cannon = new THREE.Mesh(cannonGeom, cannonMat);
      cannon.rotation.x = Math.PI / 2;
      const angle = (i / 4) * Math.PI * 2;
      cannon.position.set(
        Math.cos(angle) * 1.5 * this.config.size,
        Math.sin(angle) * 0.5 * this.config.size,
        -1.5
      );
      group.add(cannon);
    }

    const engineGeom = new THREE.SphereGeometry(0.6 * this.config.size);
    const engineMat = new THREE.MeshBasicMaterial({ color: this.config.color });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.position.z = -2;
    group.add(engine);

    const light = new THREE.PointLight(this.config.color, 2, 10);
    group.add(light);

    return group;
  }

  updateBehavior(dt: number): void {
    this.phaseTimer += dt;
    this.shootTimer += dt;

    const healthRatio = this.health / this.maxHealth;
    
    if (healthRatio < 0.5) {
      this.phase = 2;
      this.shootInterval = 0.8;
    } else if (healthRatio < 0.75) {
      this.phase = 1;
      this.shootInterval = 1.0;
    }

    if (this.playerPosition) {
      if (this.phase === 2 && this.phaseTimer > 3.0) {
        this.chargeAttack(dt);
        if (this.chargeDirection) {
          this.mesh.position.addScaledVector(this.chargeDirection, dt * 10);
        }
      } else {
        const direction = new THREE.Vector3();
        direction.subVectors(this.playerPosition, this.mesh.position);
        direction.normalize();
        this.mesh.position.x += direction.x * dt * 2;
        this.mesh.position.y += direction.y * dt * 2;
      }

      if (this.shootTimer >= this.shootInterval) {
        this.shootPattern();
        this.shootTimer = 0;
      }
    }
  }

  private chargeAttack(dt: number): void {
    if (!this.playerPosition) return;
    
    if (!this.chargeDirection) {
      this.chargeDirection = new THREE.Vector3();
      this.chargeDirection.subVectors(this.playerPosition, this.mesh.position);
      this.chargeDirection.normalize();
      this.phaseTimer = 0;
    }
    
    if (this.phaseTimer > 1.0) {
      this.chargeDirection = null;
      this.phaseTimer = 0;
    }
  }

  private shootPattern(): void {
    if (!this.playerPosition) return;
    
    const shootPosition = this.mesh.position.clone();
    shootPosition.z += 2;

    if (this.phase === 0) {
      this.projectileManager.shoot(shootPosition, this.playerPosition);
    } else if (this.phase === 1) {
      for (let i = 0; i < 3; i++) {
        const offset = (i - 1) * 2;
        const target = this.playerPosition.clone();
        target.x += offset;
        this.projectileManager.shoot(shootPosition, target);
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const target = this.playerPosition.clone();
        target.x += Math.cos(angle) * 5;
        target.y += Math.sin(angle) * 5;
        this.projectileManager.shoot(shootPosition, target);
      }
    }
  }
}

