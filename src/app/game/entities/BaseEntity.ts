import * as THREE from 'three';
import { EntityType, EntityMetadata } from './EntityType';

export abstract class BaseEntity {
  scene: THREE.Scene;
  mesh!: THREE.Group;
  type: EntityType;
  active: boolean;
  metadata: EntityMetadata;

  constructor(scene: THREE.Scene, type: EntityType) {
    this.scene = scene;
    this.type = type;
    this.active = true;
    this.metadata = { type };
  }

  protected initializeMesh(): void {
    if (!this.mesh) {
      this.mesh = this.createMesh();
      this.mesh.userData = this.metadata;
      this.scene.add(this.mesh);
    }
  }

  abstract createMesh(): THREE.Group;

  abstract update(dt: number): void;

  getPosition(): THREE.Vector3 {
    return this.mesh.position;
  }

  getBoundingBox(): THREE.Box3 {
    return new THREE.Box3().setFromObject(this.mesh);
  }

  checkCollision(other: BaseEntity | THREE.Group): boolean {
    const thisBox = this.getBoundingBox();
    const otherBox = other instanceof BaseEntity 
      ? other.getBoundingBox() 
      : new THREE.Box3().setFromObject(other);
    return thisBox.intersectsBox(otherBox);
  }

  destroy(): void {
    this.active = false;
    if (this.mesh.parent) {
      this.scene.remove(this.mesh);
    }
    this.onDestroy();
  }

  protected onDestroy(): void {
  }
}

