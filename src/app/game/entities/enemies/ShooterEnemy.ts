import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy';
import { EnemyType, ENEMY_CONFIGS } from './EnemyTypes';
import { EnemyProjectileManager } from '../../EnemyProjectileManager';

export class ShooterEnemy extends BaseEnemy {
  private shootTimer: number;
  private shootInterval: number;
  private playerPosition: THREE.Vector3 | null;
  private projectileManager: EnemyProjectileManager;

  constructor(scene: THREE.Scene, zPos: number, projectileManager: EnemyProjectileManager) {
    super(scene, EnemyType.SHOOTER, ENEMY_CONFIGS[EnemyType.SHOOTER], zPos);
    this.shootTimer = 0;
    this.shootInterval = 2.0 + Math.random() * 1.0;
    this.playerPosition = null;
    this.projectileManager = projectileManager;
  }

  setPlayerPosition(position: THREE.Vector3): void {
    this.playerPosition = position;
  }

  createMesh(): THREE.Group {
    const group = new THREE.Group();

    const bodyGeom = new THREE.ConeGeometry(0.6 * this.config.size, 2 * this.config.size, 4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.config.color,
      emissive: this.config.color * 0.25,
      roughness: 0.2,
      metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const wingGeom = new THREE.BoxGeometry(2 * this.config.size, 0.1, 0.5 * this.config.size);
    const wingMat = new THREE.MeshStandardMaterial({ color: this.config.color * 0.7 });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    group.add(wings);

    const cannonGeom = new THREE.CylinderGeometry(0.2 * this.config.size, 0.2 * this.config.size, 0.8 * this.config.size, 8);
    const cannonMat = new THREE.MeshStandardMaterial({ color: this.config.color * 0.9 });
    const cannon = new THREE.Mesh(cannonGeom, cannonMat);
    cannon.rotation.x = Math.PI / 2;
    cannon.position.z = -1.2;
    group.add(cannon);

    const engineGeom = new THREE.SphereGeometry(0.3 * this.config.size);
    const engineMat = new THREE.MeshBasicMaterial({ color: this.config.color * 0.8 });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.position.z = -1;
    group.add(engine);

    return group;
  }

  updateBehavior(dt: number): void {
    this.shootTimer += dt;
    
    if (this.playerPosition && this.shootTimer >= this.shootInterval) {
      const shootPosition = this.mesh.position.clone();
      shootPosition.z += 1;
      this.projectileManager.shoot(shootPosition, this.playerPosition);
      this.shootTimer = 0;
      this.shootInterval = 2.0 + Math.random() * 1.0;
    }
  }
}

