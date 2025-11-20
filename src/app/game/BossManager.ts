import * as THREE from 'three';
import { BossEnemy } from './entities/enemies/BossEnemy';
import { EnemyProjectileManager } from './EnemyProjectileManager';

export class BossManager {
  scene: THREE.Scene;
  currentBoss: BossEnemy | null;
  bossSpawnScore: number;
  nextBossScore: number;
  projectileManager: EnemyProjectileManager;

  constructor(scene: THREE.Scene, projectileManager: EnemyProjectileManager) {
    this.scene = scene;
    this.currentBoss = null;
    this.bossSpawnScore = 10000;
    this.nextBossScore = 10000;
    this.projectileManager = projectileManager;
  }

  update(dt: number, currentScore: number, playerPosition: THREE.Vector3): void {
    if (this.currentBoss) {
      if (!this.currentBoss.active) {
        this.currentBoss = null;
        this.nextBossScore = currentScore + this.bossSpawnScore;
      } else {
        this.currentBoss.setPlayerPosition(playerPosition);
        this.currentBoss.update(dt);
      }
    } else if (currentScore >= this.nextBossScore) {
      this.spawnBoss(playerPosition.z - 100);
    }
  }

  spawnBoss(zPos: number): void {
    if (this.currentBoss) return;
    
    this.currentBoss = new BossEnemy(this.scene, zPos, this.projectileManager);
  }

  hasActiveBoss(): boolean {
    return this.currentBoss !== null && this.currentBoss.active;
  }

  getBoss(): BossEnemy | null {
    return this.currentBoss;
  }

  reset(): void {
    if (this.currentBoss) {
      this.currentBoss.destroy();
      this.currentBoss = null;
    }
    this.nextBossScore = this.bossSpawnScore;
  }
}

