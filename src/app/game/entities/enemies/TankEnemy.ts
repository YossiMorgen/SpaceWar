import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy';
import { EnemyType, ENEMY_CONFIGS } from './EnemyTypes';

export class TankEnemy extends BaseEnemy {
  constructor(scene: THREE.Scene, zPos: number) {
    super(scene, EnemyType.TANK, ENEMY_CONFIGS[EnemyType.TANK], zPos);
  }

  createMesh(): THREE.Group {
    const group = new THREE.Group();

    const bodyGeom = new THREE.ConeGeometry(0.8 * this.config.size, 2.5 * this.config.size, 6);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.config.color,
      emissive: this.config.color * 0.15,
      roughness: 0.3,
      metalness: 0.7
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const wingGeom = new THREE.BoxGeometry(2.5 * this.config.size, 0.15, 0.7 * this.config.size);
    const wingMat = new THREE.MeshStandardMaterial({ color: this.config.color * 0.6 });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    group.add(wings);

    const armorGeom = new THREE.BoxGeometry(1.2 * this.config.size, 1.2 * this.config.size, 0.3 * this.config.size);
    const armorMat = new THREE.MeshStandardMaterial({ color: this.config.color * 0.5 });
    const armor = new THREE.Mesh(armorGeom, armorMat);
    armor.position.z = -0.5;
    group.add(armor);

    const engineGeom = new THREE.SphereGeometry(0.4 * this.config.size);
    const engineMat = new THREE.MeshBasicMaterial({ color: this.config.color * 0.7 });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.position.z = -1.2;
    group.add(engine);

    return group;
  }

  updateBehavior(dt: number): void {
  }
}

