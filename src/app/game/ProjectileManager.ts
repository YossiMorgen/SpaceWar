import * as THREE from 'three';
import { ObstacleManager } from './ObstacleManager';
import { ParticleSystem } from './ParticleSystem';
import { BaseEnemy } from './entities/enemies/BaseEnemy';

interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  active: boolean;
  life: number;
}

export class ProjectileManager {
  scene: THREE.Scene;
  projectiles: Projectile[] = [];
  speed = 100;
  poolSize = 20;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initPool();
  }

  initPool() {
    const geometry = new THREE.CylinderGeometry(0.07, 0.07, 1.4);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    geometry.rotateX(-Math.PI / 2); // Point forward

    for (let i = 0; i < this.poolSize; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      this.scene.add(mesh);
      
      this.projectiles.push({
        mesh,
        velocity: new THREE.Vector3(0, 0, -this.speed),
        active: false,
        life: 0
      });
    }
  }

  shoot(position: THREE.Vector3) {
    for (const p of this.projectiles) {
      if (!p.active) {
        p.active = true;
        p.mesh.visible = true;
        p.mesh.position.copy(position);
        p.life = 2.0; // 2 seconds life
        break;
      }
    }
  }

  update(dt: number, obstacleManager: ObstacleManager, particleSystem: ParticleSystem): { hit: boolean; enemy?: BaseEnemy } {
    let hitResult: { hit: boolean; enemy?: BaseEnemy } = { hit: false };

    for (const p of this.projectiles) {
      if (p.active) {
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          p.mesh.visible = false;
          continue;
        }

        p.mesh.position.z -= this.speed * dt;

        const collisionResult = obstacleManager.checkProjectileCollision(p.mesh.position);
        if (collisionResult.hit) {
          p.active = false;
          p.mesh.visible = false;
          
          particleSystem.createExplosion(p.mesh.position, 30, 0xff0000);
          
          hitResult = collisionResult;
        }
      }
    }
    return hitResult;
  }
  
  checkBossCollision(boss: any, particleSystem: ParticleSystem): boolean {
    const bossBox = boss.getBoundingBox();
    
    for (const p of this.projectiles) {
      if (p.active) {
        const projectileBox = new THREE.Box3().setFromObject(p.mesh);
        if (bossBox.intersectsBox(projectileBox)) {
          p.active = false;
          p.mesh.visible = false;
          return true;
        }
      }
    }
    return false;
  }

  reset() {
      for (const p of this.projectiles) {
          p.active = false;
          p.mesh.visible = false;
      }
  }
}
