import * as THREE from 'three';
import { ParticleSystem } from './ParticleSystem';

interface EnemyProjectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  active: boolean;
  life: number;
}

export class EnemyProjectileManager {
  scene: THREE.Scene;
  projectiles: EnemyProjectile[] = [];
  speed = 60;
  poolSize = 30;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initPool();
  }

  initPool() {
    const geometry = new THREE.SphereGeometry(0.105, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xff4400 });
    
    for (let i = 0; i < this.poolSize; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      this.scene.add(mesh);
      
      this.projectiles.push({
        mesh,
        velocity: new THREE.Vector3(),
        active: false,
        life: 0
      });
    }
  }

  shoot(from: THREE.Vector3, target: THREE.Vector3) {
    for (const p of this.projectiles) {
      if (!p.active) {
        p.active = true;
        p.mesh.visible = true;
        p.mesh.position.copy(from);
        
        const direction = new THREE.Vector3();
        direction.subVectors(target, from);
        direction.normalize();
        p.velocity.copy(direction).multiplyScalar(this.speed);
        
        p.life = 5.0;
        break;
      }
    }
  }

  update(dt: number, playerPosition: THREE.Vector3, playerMesh: THREE.Group, particleSystem: ParticleSystem): boolean {
    const playerBox = new THREE.Box3().setFromObject(playerMesh);
    let hitPlayer = false;

    for (const p of this.projectiles) {
      if (p.active) {
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          p.mesh.visible = false;
          continue;
        }

        p.mesh.position.addScaledVector(p.velocity, dt);

        const projectileBox = new THREE.Box3().setFromObject(p.mesh);
        if (playerBox.intersectsBox(projectileBox)) {
          p.active = false;
          p.mesh.visible = false;
          particleSystem.createExplosion(p.mesh.position, 20, 0xff4400);
          hitPlayer = true;
        }

        if (p.mesh.position.z > playerPosition.z + 10) {
          p.active = false;
          p.mesh.visible = false;
        }
      }
    }
    return hitPlayer;
  }
  
  reset() {
    for (const p of this.projectiles) {
      p.active = false;
      p.mesh.visible = false;
    }
  }
}

