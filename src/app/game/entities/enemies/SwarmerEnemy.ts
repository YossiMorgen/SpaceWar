import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy';
import { EnemyType, ENEMY_CONFIGS } from './EnemyTypes';

export class SwarmerEnemy extends BaseEnemy {
  private erraticPhase: number;
  private erraticSpeed: number;
  private baseX: number;
  private baseY: number;

  constructor(scene: THREE.Scene, zPos: number) {
    super(scene, EnemyType.SWARMER, ENEMY_CONFIGS[EnemyType.SWARMER], zPos);
    this.erraticPhase = Math.random() * Math.PI * 2;
    this.erraticSpeed = 5.0;
    this.baseX = this.mesh.position.x;
    this.baseY = this.mesh.position.y;
  }

  createMesh(): THREE.Group {
    const group = new THREE.Group();

    const bodyGeom = new THREE.ConeGeometry(0.4 * this.config.size, 1.5 * this.config.size, 4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.config.color,
      emissive: this.config.color * 0.4,
      roughness: 0.1,
      metalness: 0.9
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.x = Math.PI / 2;
    group.add(body);

    const wingGeom = new THREE.BoxGeometry(1.2 * this.config.size, 0.08, 0.3 * this.config.size);
    const wingMat = new THREE.MeshStandardMaterial({ color: this.config.color * 0.8 });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    group.add(wings);

    const engineGeom = new THREE.SphereGeometry(0.2 * this.config.size);
    const engineMat = new THREE.MeshBasicMaterial({ color: this.config.color });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.position.z = -0.8;
    group.add(engine);

    return group;
  }

  updateBehavior(dt: number): void {
    this.erraticPhase += this.erraticSpeed * dt;
    
    const xOffset = Math.sin(this.erraticPhase) * 2 + Math.cos(this.erraticPhase * 1.3) * 1.5;
    const yOffset = Math.cos(this.erraticPhase * 0.7) * 1.5 + Math.sin(this.erraticPhase * 1.1) * 1;
    
    this.mesh.position.x = this.baseX + xOffset;
    this.mesh.position.y = this.baseY + yOffset;
    
    this.mesh.rotation.z = Math.sin(this.erraticPhase) * 0.4;
    this.mesh.rotation.x = Math.cos(this.erraticPhase * 0.8) * 0.2;
  }
}

