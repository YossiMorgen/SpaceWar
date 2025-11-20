import * as THREE from 'three';

export class ObstacleManager {
  constructor(scene) {
    this.scene = scene;
    this.obstacles = [];
    this.spawnDistance = 100;
    this.removeDistance = 20; // Behind player
    this.spawnTimer = 0;
    this.spawnInterval = 1.0; // Seconds
  }

  update(dt, playerPosition) {
    this.spawnTimer += dt;
    
    // Spawn new obstacles/stars
    if (this.spawnTimer > this.spawnInterval) {
      // 30% chance to spawn a star, 70% enemy ship
      if (Math.random() < 0.3) {
        this.spawnStar(playerPosition.z - this.spawnDistance);
      } else {
        this.spawnEnemyShip(playerPosition.z - this.spawnDistance);
      }
      this.spawnTimer = 0;
    }
    
    // Remove old obstacles
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.position.z > playerPosition.z + this.removeDistance) {
        this.scene.remove(obs);
        this.obstacles.splice(i, 1);
      }
    }
  }
  
  spawnStar(zPos) {
    const group = new THREE.Group();
    group.userData = { type: 'star' }; // Tag as star

    // Star Shape (Icosahedron)
    const geometry = new THREE.IcosahedronGeometry(0.5, 0);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xffff00, 
      emissive: 0xffaa00,
      emissiveIntensity: 2,
      roughness: 0.1,
      metalness: 1.0
    });
    const star = new THREE.Mesh(geometry, material);
    
    // Add a point light to the star
    const light = new THREE.PointLight(0xffaa00, 1, 5);
    star.add(light);
    
    group.add(star);

    // Random X and Y position
    const xPos = (Math.random() - 0.5) * 20;
    const yPos = 1 + Math.random() * 8; // Height variation
    group.position.set(xPos, yPos, zPos);

    // Animate rotation
    group.userData.update = (dt) => {
      star.rotation.y += dt * 2;
      star.rotation.z += dt;
    };

    this.scene.add(group);
    this.obstacles.push(group);
  }

  spawnEnemyShip(zPos) {
    const group = new THREE.Group();
    group.userData = { type: 'enemy' }; // Tag as enemy
    
    // Enemy Body (Spiky)
    const bodyGeom = new THREE.ConeGeometry(0.6, 2, 4);
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: 0xff0000, 
      emissive: 0x440000,
      roughness: 0.2, 
      metalness: 0.8 
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.x = Math.PI / 2; // Point towards player
    group.add(body);
    
    // Wings
    const wingGeom = new THREE.BoxGeometry(2, 0.1, 0.5);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0xaa0000 });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    group.add(wings);
    
    // Engine Glow
    const engineGeom = new THREE.SphereGeometry(0.3);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.position.z = -1;
    group.add(engine);

    // Random X and Y position
    const xPos = (Math.random() - 0.5) * 20;
    const yPos = 1 + Math.random() * 8;
    group.position.set(xPos, yPos, zPos);
    
    this.scene.add(group);
    this.obstacles.push(group);
  }
  
  checkCollision(playerMesh) {
    const playerBox = new THREE.Box3().setFromObject(playerMesh);
    
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      const obsBox = new THREE.Box3().setFromObject(obs);
      
      if (playerBox.intersectsBox(obsBox)) {
        const type = obs.userData.type;
        
        if (type === 'star') {
          // Remove star
          this.scene.remove(obs);
          this.obstacles.splice(i, 1);
          return 'score';
        } else {
          return 'game_over';
        }
      }
    }
    return 'none';
  }
  
  reset() {
    for (const obs of this.obstacles) {
      this.scene.remove(obs);
    }
    this.obstacles = [];
    this.spawnTimer = 0;
  }
}
