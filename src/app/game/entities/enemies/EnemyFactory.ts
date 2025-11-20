import * as THREE from 'three';
import { BaseEnemy } from './BaseEnemy';
import { EnemyType, ENEMY_CONFIGS } from './EnemyTypes';
import { BasicEnemy } from './BasicEnemy';
import { FastEnemy } from './FastEnemy';
import { TankEnemy } from './TankEnemy';
import { SwarmerEnemy } from './SwarmerEnemy';
import { ChaserEnemy } from './ChaserEnemy';
import { ShooterEnemy } from './ShooterEnemy';
import { EnemyProjectileManager } from '../../EnemyProjectileManager';

export class EnemyFactory {
  static createEnemy(scene: THREE.Scene, enemyType: EnemyType, zPos: number, projectileManager?: EnemyProjectileManager): BaseEnemy {
    switch (enemyType) {
      case EnemyType.BASIC:
        return new BasicEnemy(scene, zPos);
      case EnemyType.FAST:
        return new FastEnemy(scene, zPos);
      case EnemyType.TANK:
        return new TankEnemy(scene, zPos);
      case EnemyType.SWARMER:
        return new SwarmerEnemy(scene, zPos);
      case EnemyType.CHASER:
        return new ChaserEnemy(scene, zPos);
      case EnemyType.SHOOTER:
        if (projectileManager) {
          return new ShooterEnemy(scene, zPos, projectileManager);
        }
        return new BasicEnemy(scene, zPos);
      default:
        return new BasicEnemy(scene, zPos);
    }
  }

  static getRandomEnemyType(): EnemyType {
    const types = Object.values(EnemyType);
    const weights = [0.35, 0.25, 0.15, 0.12, 0.08, 0.05];
    const rand = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < types.length; i++) {
      cumulative += weights[i];
      if (rand < cumulative) {
        return types[i];
      }
    }
    return EnemyType.BASIC;
  }

  static getConfig(enemyType: EnemyType) {
    return ENEMY_CONFIGS[enemyType];
  }
}

