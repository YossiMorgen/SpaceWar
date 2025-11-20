import * as THREE from 'three';
import { BaseEntity } from '../BaseEntity';
import { EntityType } from '../EntityType';
import { EnemyType, EnemyConfig } from './EnemyTypes';

export abstract class BaseEnemy extends BaseEntity {
  enemyType: EnemyType;
  config: EnemyConfig;
  health: number;
  maxHealth: number;
  baseZ: number;
  timeAlive: number;

  constructor(scene: THREE.Scene, enemyType: EnemyType, config: EnemyConfig, zPos: number) {
    super(scene, EntityType.ENEMY);
    this.enemyType = enemyType;
    this.config = config;
    this.maxHealth = config.health;
    this.health = config.health;
    this.baseZ = zPos;
    this.timeAlive = 0;
    
    this.initializeMesh();
    
    const xPos = (Math.random() - 0.5) * 20;
    const yPos = 1 + Math.random() * 8;
    this.mesh.position.set(xPos, yPos, zPos);
    
    this.metadata['enemyType'] = enemyType;
    this.metadata['health'] = this.health;
    this.metadata['maxHealth'] = this.maxHealth;
  }

  takeDamage(amount: number = 1): boolean {
    this.health -= amount;
    this.metadata['health'] = this.health;
    
    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  update(dt: number): void {
    if (!this.active) return;
    
    this.timeAlive += dt;
    this.updateBehavior(dt);
  }

  abstract updateBehavior(dt: number): void;

  protected override onDestroy(): void {
  }
}

