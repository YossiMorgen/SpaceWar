import * as THREE from 'three';
import { BaseEntity } from '../entities/BaseEntity';
import { EntityType } from '../entities/EntityType';
import { PowerUpType, PowerUpConfig } from './PowerUpType';

export class PowerUp extends BaseEntity {
  powerUpType: PowerUpType;
  config: PowerUpConfig;
  rotationSpeed: number;

  constructor(scene: THREE.Scene, powerUpType: PowerUpType, config: PowerUpConfig, zPos: number) {
    super(scene, EntityType.POWERUP);
    this.powerUpType = powerUpType;
    this.config = config;
    this.rotationSpeed = 2.0;
    
    this.initializeMesh();
    
    const xPos = (Math.random() - 0.5) * 20;
    const yPos = 1 + Math.random() * 8;
    this.mesh.position.set(xPos, yPos, zPos);
    
    this.metadata['powerUpType'] = powerUpType;
  }

  createMesh(): THREE.Group {
    const group = new THREE.Group();

    const geometry = new THREE.OctahedronGeometry(0.42, 0);
    const material = new THREE.MeshStandardMaterial({
      color: this.config.color,
      emissive: this.config.color,
      emissiveIntensity: 0.5,
      roughness: 0.1,
      metalness: 0.9
    });
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    const light = new THREE.PointLight(this.config.color, 1, 5);
    group.add(light);

    const ringGeometry = new THREE.TorusGeometry(0.56, 0.035, 8, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: this.config.color,
      transparent: true,
      opacity: 0.6
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    return group;
  }

  update(dt: number): void {
    if (!this.active) return;
    
    this.mesh.rotation.y += this.rotationSpeed * dt;
    this.mesh.rotation.x += this.rotationSpeed * 0.5 * dt;
    
    const bobAmount = Math.sin(this.mesh.rotation.y * 2) * 0.2;
    this.mesh.position.y += bobAmount * dt;
  }

  protected override onDestroy(): void {
  }
}

