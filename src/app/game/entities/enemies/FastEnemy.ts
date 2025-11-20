import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy';
import { EnemyType, ENEMY_CONFIGS } from './EnemyTypes';

export class FastEnemy extends BaseEnemy {
  private zigzagPhase: number;
  private zigzagSpeed: number;
  private baseX: number;

  constructor(scene: THREE.Scene, zPos: number) {
    super(scene, EnemyType.FAST, ENEMY_CONFIGS[EnemyType.FAST], zPos);
    this.zigzagPhase = Math.random() * Math.PI * 2;
    this.zigzagSpeed = 3.0;
    this.baseX = this.mesh.position.x;
  }

  createMesh(): THREE.Group {
    const group = new THREE.Group();

    const bodyGeom = new THREE.ConeGeometry(0.6 * this.config.size, 2 * this.config.size, 4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.config.color,
      emissive: this.config.color * 0.3,
      roughness: 0.2,
      metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const wingGeom = new THREE.BoxGeometry(1.6 * this.config.size, 0.1, 0.4 * this.config.size);
    const wingMat = new THREE.MeshStandardMaterial({ color: this.config.color * 0.7 });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    group.add(wings);

    const engineGeom = new THREE.SphereGeometry(0.25 * this.config.size);
    const engineMat = new THREE.MeshBasicMaterial({ color: this.config.color * 0.9 });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.position.z = -1;
    group.add(engine);

    return group;
  }

  updateBehavior(dt: number): void {
    this.zigzagPhase += this.zigzagSpeed * dt;
    const zigzagAmount = Math.sin(this.zigzagPhase) * 3;
    this.mesh.position.x = this.baseX + zigzagAmount;
    this.mesh.rotation.z = Math.sin(this.zigzagPhase) * 0.3;
  }
}

