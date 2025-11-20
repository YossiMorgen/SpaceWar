import * as THREE from 'three';
import { BaseEnemy } from './entities/enemies/BaseEnemy';
import { EnemyFactory } from './entities/enemies/EnemyFactory';
import { EnemyProjectileManager } from './EnemyProjectileManager';

export class ObstacleManager {
  scene: THREE.Scene;
  enemies: BaseEnemy[];
  stars: THREE.Group[];
  spawnDistance: number;
  removeDistance: number;
  spawnTimer: number;
  spawnInterval: number;
  private projectileManager?: EnemyProjectileManager;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.enemies = [];
    this.stars = [];
    this.spawnDistance = 100;
    this.removeDistance = 20;
    this.spawnTimer = 0;
    this.spawnInterval = 1.0;
  }

  setProjectileManager(manager: EnemyProjectileManager): void {
    this.projectileManager = manager;
  }

  update(dt: number, playerPosition: THREE.Vector3) {
    this.spawnTimer += dt;

    if (this.spawnTimer > this.spawnInterval) {
      if (Math.random() < 0.3) {
        this.spawnStar(playerPosition.z - this.spawnDistance);
      } else {
        const enemyType = EnemyFactory.getRandomEnemyType();
        const enemy = EnemyFactory.createEnemy(this.scene, enemyType, playerPosition.z - this.spawnDistance, this.projectileManager);
        this.enemies.push(enemy);
      }
      this.spawnTimer = 0;
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      if (!enemy.active) {
        this.enemies.splice(i, 1);
        continue;
      }

      if (enemy.metadata['enemyType'] === 'chaser' || enemy.metadata['enemyType'] === 'shooter') {
        const enemyWithPosition = enemy as any;
        if (enemyWithPosition.setPlayerPosition) {
          enemyWithPosition.setPlayerPosition(playerPosition);
        }
      }

      enemy.update(dt);

      if (enemy.getPosition().z > playerPosition.z + this.removeDistance) {
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
    }

    for (let i = this.stars.length - 1; i >= 0; i--) {
      const star = this.stars[i];
      if (star.position.z > playerPosition.z + this.removeDistance) {
        this.scene.remove(star);
        this.stars.splice(i, 1);
      } else if (star.userData['update']) {
        star.userData['update'](dt);
      }
    }
  }

  spawnStar(zPos: number) {
    const group = new THREE.Group();
    group.userData = { type: 'star' };

    const geometry = new THREE.IcosahedronGeometry(0.35, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      emissive: 0xffaa00,
      emissiveIntensity: 2,
      roughness: 0.1,
      metalness: 1.0
    });
    const star = new THREE.Mesh(geometry, material);

    const light = new THREE.PointLight(0xffaa00, 1, 5);
    star.add(light);

    group.add(star);

    const xPos = (Math.random() - 0.5) * 20;
    const yPos = 1 + Math.random() * 8;
    group.position.set(xPos, yPos, zPos);

    group.userData['update'] = (dt: number) => {
      star.rotation.y += dt * 2;
      star.rotation.z += dt;
    };

    this.scene.add(group);
    this.stars.push(group);
  }

  checkCollision(playerMesh: THREE.Group): { type: 'score' | 'game_over' | 'none', object?: THREE.Group | BaseEnemy } {
    const playerBox = new THREE.Box3().setFromObject(playerMesh);

    for (let i = this.stars.length - 1; i >= 0; i--) {
      const star = this.stars[i];
      const starBox = new THREE.Box3().setFromObject(star);

      if (playerBox.intersectsBox(starBox)) {
        this.scene.remove(star);
        this.stars.splice(i, 1);
        return { type: 'score', object: star };
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.checkCollision(playerMesh)) {
        return { type: 'game_over', object: enemy };
      }
    }

    return { type: 'none' };
  }

  checkProjectileCollision(projectilePos: THREE.Vector3): { hit: boolean; enemy?: BaseEnemy } {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      if (enemy.getPosition().distanceTo(projectilePos) < 2.0) {
        const destroyed = enemy.takeDamage(1);
        if (destroyed) {
          const destroyedEnemy = enemy;
          this.enemies.splice(i, 1);
          return { hit: true, enemy: destroyedEnemy };
        }
        return { hit: true, enemy: enemy };
      }
    }
    return { hit: false };
  }

  applyMagnet(playerPosition: THREE.Vector3, magnetStrength: number, dt: number): void {
    for (const star of this.stars) {
      const distance = star.position.distanceTo(playerPosition);
      if (distance < 15 && distance > 0.5) {
        const direction = new THREE.Vector3();
        direction.subVectors(playerPosition, star.position);
        direction.normalize();
        const pullForce = magnetStrength * dt * (15 - distance) / 15;
        star.position.addScaledVector(direction, pullForce);
      }
    }
  }

  removeEnemy(enemy: BaseEnemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }

  reset() {
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.enemies = [];
    
    for (const star of this.stars) {
      this.scene.remove(star);
    }
    this.stars = [];
    this.spawnTimer = 0;
  }
}
