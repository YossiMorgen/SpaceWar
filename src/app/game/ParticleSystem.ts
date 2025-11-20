import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
}

export class ParticleSystem {
  scene: THREE.Scene;
  particles: Particle[] = [];
  poolSize = 200;
  
  // Reusable geometry and material for performance
  geometry: THREE.SphereGeometry;
  material: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.geometry = new THREE.SphereGeometry(0.56, 8, 8);
    this.material = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      transparent: true,
      opacity: 1.0
    });
    
    this.initPool();
  }

  initPool() {
    for (let i = 0; i < this.poolSize; i++) {
      const mesh = new THREE.Mesh(this.geometry, this.material.clone());
      mesh.visible = false;
      this.scene.add(mesh);
      
      this.particles.push({
        mesh,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0,
        active: false
      });
    }
  }

  createExplosion(position: THREE.Vector3, count: number = 40, color: number = 0xffff00) {
    let spawned = 0;
    for (const p of this.particles) {
      if (!p.active) {
        p.active = true;
        p.mesh.visible = true;
        p.mesh.position.copy(position);
        
        const mat = p.mesh.material as THREE.MeshBasicMaterial;
        mat.color.setHex(color);
        mat.opacity = 1.0;
        
        // Random velocity in a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 10 + Math.random() * 15;
        
        p.velocity.set(
          speed * Math.sin(phi) * Math.cos(theta),
          speed * Math.sin(phi) * Math.sin(theta),
          speed * Math.cos(phi)
        );
        
        p.life = 2.0;
        p.maxLife = 2.0;
        p.mesh.scale.setScalar(2.1);
        
        spawned++;
        if (spawned >= count) break;
      }
    }
  }

  update(dt: number) {
    for (const p of this.particles) {
      if (p.active) {
        p.life -= dt;
        
        if (p.life <= 0) {
          p.active = false;
          p.mesh.visible = false;
          continue;
        }
        
        // Physics
        p.mesh.position.addScaledVector(p.velocity, dt);
        p.velocity.multiplyScalar(0.95); // Drag
        
        // Scale down and fade
        const lifeRatio = p.life / p.maxLife;
        p.mesh.scale.setScalar(2.1 * lifeRatio);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = Math.min(1.0, lifeRatio * 1.2);
      }
    }
  }
  
  reset() {
      for (const p of this.particles) {
          p.active = false;
          p.mesh.visible = false;
      }
  }
}
