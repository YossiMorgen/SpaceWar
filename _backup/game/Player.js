import * as THREE from 'three';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.mesh = this.createShip();
    this.scene.add(this.mesh);
    
    this.speed = 30; // Faster for space
    this.horizontalSpeed = 20;
    this.verticalSpeed = 15;
    this.maxX = 15; 
    this.maxY = 10;
    this.minY = 1;
    
    this.velocity = new THREE.Vector3();
    this.input = { left: false, right: false, up: false, down: false };
    
    this.setupInput();
  }

  // ... createShip() ...

  setupInput() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.input.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') this.input.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') this.input.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') this.input.down = true;
    });
    
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.input.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') this.input.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') this.input.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') this.input.down = false;
    });
  }

  update(dt) {
    // Constant forward movement
    this.mesh.position.z -= this.speed * dt;
    
    // Horizontal movement
    if (this.input.left) {
      this.mesh.position.x -= this.horizontalSpeed * dt;
      this.mesh.rotation.z = Math.min(this.mesh.rotation.z + 5 * dt, 0.5); // Bank left
    } else if (this.input.right) {
      this.mesh.position.x += this.horizontalSpeed * dt;
      this.mesh.rotation.z = Math.max(this.mesh.rotation.z - 5 * dt, -0.5); // Bank right
    } else {
      // Return to level
      this.mesh.rotation.z *= (1 - 5 * dt);
    }
    
    // Vertical movement
    if (this.input.up) {
      this.mesh.position.y += this.verticalSpeed * dt;
      this.mesh.rotation.x = Math.min(this.mesh.rotation.x + 5 * dt, 0.2); // Pitch up
    } else if (this.input.down) {
      this.mesh.position.y -= this.verticalSpeed * dt;
      this.mesh.rotation.x = Math.max(this.mesh.rotation.x - 5 * dt, -0.2); // Pitch down
    } else {
      this.mesh.rotation.x *= (1 - 5 * dt);
    }

    // Bounds
    this.mesh.position.x = Math.max(-this.maxX, Math.min(this.maxX, this.mesh.position.x));
    this.mesh.position.y = Math.max(this.minY, Math.min(this.maxY, this.mesh.position.y));
  }
  
  reset() {
    this.mesh.position.set(0, 1, 0);
    this.mesh.rotation.set(0, 0, 0);
  }
}
