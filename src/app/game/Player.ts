import * as THREE from 'three';
import { HealthSystem } from './HealthSystem';
import { EffectManager } from './effects/EffectManager';
import { EffectType } from './effects/EffectType';

export class Player {
  scene: THREE.Scene;
  mesh: THREE.Group;
  speed: number;
  horizontalSpeed: number;
  verticalSpeed: number;
  maxX: number;
  maxY: number;
  minY: number;
  velocity: THREE.Vector3;
  input: { left: boolean; right: boolean; up: boolean; down: boolean; shoot: boolean };
  healthSystem: HealthSystem;
  effectManager: EffectManager;
  shieldMesh?: THREE.Mesh;
  speedTrail: THREE.Line[] = [];
  magnetParticles: THREE.Mesh[] = [];
  private touchStartX: number = 0;
  private touchStartY: number = 0;
  private isTouching: boolean = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.mesh = this.createShip();
    this.scene.add(this.mesh);

    this.speed = 30;
    this.horizontalSpeed = 20;
    this.verticalSpeed = 15;
    this.maxX = 15;
    this.maxY = 10;
    this.minY = 1;

    this.velocity = new THREE.Vector3();
    this.input = { left: false, right: false, up: false, down: false, shoot: false };

    this.healthSystem = new HealthSystem(3);
    this.effectManager = new EffectManager();

    this.setupInput();
    this.setupShield();
    this.setupSpeedTrail();
    this.setupMagnetParticles();
  }

  setupSpeedTrail() {
    for (let i = 0; i < 5; i++) {
      const points: THREE.Vector3[] = [];
      points.push(new THREE.Vector3(0, 0, 0));
      points.push(new THREE.Vector3(0, 0, 0));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.3 - i * 0.05,
        linewidth: 2
      });
      const line = new THREE.Line(geometry, material);
      line.visible = false;
      this.scene.add(line);
      this.speedTrail.push(line);
    }
  }

  setupMagnetParticles() {
    for (let i = 0; i < 12; i++) {
      const geometry = new THREE.SphereGeometry(0.07, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff8800,
        transparent: true,
        opacity: 0.6
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.visible = false;
      this.scene.add(particle);
      this.magnetParticles.push(particle);
    }
  }

  createShip(): THREE.Group {
    const group = new THREE.Group();

    // Main Body
    const bodyGeom = new THREE.ConeGeometry(0.35, 1.4, 8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      roughness: 0.4,
      metalness: 0.8,
      emissive: 0x0044aa,
      emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.rotation.x = -Math.PI / 2; // Point forward
    group.add(body);

    // Wings
    const wingGeom = new THREE.BoxGeometry(1.75, 0.07, 0.7);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0088ff,
      roughness: 0.5,
      metalness: 0.7
    });
    const wings = new THREE.Mesh(wingGeom, wingMat);
    wings.position.z = 0.35;
    group.add(wings);

    // Cockpit
    const cockpitGeom = new THREE.SphereGeometry(0.21, 8, 8);
    const cockpitMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 1.0,
      transparent: true,
      opacity: 0.7
    });
    const cockpit = new THREE.Mesh(cockpitGeom, cockpitMat);
    cockpit.position.set(0, 0.21, -0.14);
    group.add(cockpit);

    // Engine Glow
    const engineGeom = new THREE.CylinderGeometry(0.14, 0.28, 0.35, 8);
    const engineMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const engine = new THREE.Mesh(engineGeom, engineMat);
    engine.rotation.x = Math.PI / 2;
    engine.position.z = 0.7;
    group.add(engine);

    // Engine Light
    const light = new THREE.PointLight(0x00ffff, 1, 5);
    light.position.z = 1.05;
    group.add(light);

    return group;
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.input.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') this.input.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w') this.input.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') this.input.down = true;
      if (e.key === ' ') this.input.shoot = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this.input.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') this.input.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w') this.input.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') this.input.down = false;
      if (e.key === ' ') this.input.shoot = false;
    });

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.screen')) {
        return;
      }
      if (e.touches.length > 0) {
        this.isTouching = true;
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!this.isTouching || e.touches.length === 0) return;
      
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('.screen')) {
        return;
      }
      
      e.preventDefault();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      
      const threshold = 10;
      const normalizedX = Math.max(-1, Math.min(1, deltaX / 100));
      const normalizedY = Math.max(-1, Math.min(1, deltaY / 100));
      
      this.input.left = normalizedX < -0.1;
      this.input.right = normalizedX > 0.1;
      this.input.up = normalizedY < -0.1;
      this.input.down = normalizedY > 0.1;
      
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      this.isTouching = false;
      this.input.left = false;
      this.input.right = false;
      this.input.up = false;
      this.input.down = false;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
  }

  setupShield() {
    const shieldGeometry = new THREE.SphereGeometry(1.05, 16, 16);
    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.3,
      emissive: 0x0088ff,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide
    });
    this.shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    this.shieldMesh.visible = false;
    this.mesh.add(this.shieldMesh);
  }

  update(dt: number) {
    this.effectManager.update(dt);

    const speedMultiplier = this.effectManager.getSpeedMultiplier();
    this.mesh.position.z -= this.speed * speedMultiplier * dt;

    if (this.input.left) {
      this.mesh.position.x -= this.horizontalSpeed * dt;
      this.mesh.rotation.z = Math.min(this.mesh.rotation.z + 5 * dt, 0.5);
    } else if (this.input.right) {
      this.mesh.position.x += this.horizontalSpeed * dt;
      this.mesh.rotation.z = Math.max(this.mesh.rotation.z - 5 * dt, -0.5);
    } else {
      this.mesh.rotation.z *= (1 - 5 * dt);
    }

    if (this.input.up) {
      this.mesh.position.y += this.verticalSpeed * dt;
      this.mesh.rotation.x = Math.min(this.mesh.rotation.x + 5 * dt, 0.2);
    } else if (this.input.down) {
      this.mesh.position.y -= this.verticalSpeed * dt;
      this.mesh.rotation.x = Math.max(this.mesh.rotation.x - 5 * dt, -0.2);
    } else {
      this.mesh.rotation.x *= (1 - 5 * dt);
    }

    this.mesh.position.x = Math.max(-this.maxX, Math.min(this.maxX, this.mesh.position.x));
    this.mesh.position.y = Math.max(this.minY, Math.min(this.maxY, this.mesh.position.y));

    if (this.shieldMesh) {
      this.shieldMesh.visible = this.effectManager.hasShield();
      if (this.shieldMesh.visible) {
        this.shieldMesh.rotation.y += dt * 2;
        this.shieldMesh.rotation.x += dt;
      }
    }

    if (this.effectManager.hasEffect(EffectType.SPEED_BOOST)) {
      this.updateSpeedTrail(dt);
    } else {
      for (const trail of this.speedTrail) {
        trail.visible = false;
      }
    }

    if (this.effectManager.hasMagnet()) {
      this.updateMagnetParticles(dt);
    } else {
      for (const particle of this.magnetParticles) {
        particle.visible = false;
      }
    }
  }

  private updateSpeedTrail(dt: number) {
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < this.speedTrail.length; i++) {
      const offset = i * 0.3;
      const zPos = this.mesh.position.z + offset;
      positions.push(new THREE.Vector3(this.mesh.position.x, this.mesh.position.y, zPos));
    }

    for (let i = 0; i < this.speedTrail.length; i++) {
      const line = this.speedTrail[i];
      line.visible = true;
      const geometry = line.geometry as THREE.BufferGeometry;
      const posArray = geometry.attributes['position'].array as Float32Array;
      
      if (i === 0) {
        posArray[0] = this.mesh.position.x;
        posArray[1] = this.mesh.position.y;
        posArray[2] = this.mesh.position.z;
        posArray[3] = positions[0].x;
        posArray[4] = positions[0].y;
        posArray[5] = positions[0].z;
      } else {
        posArray[0] = positions[i - 1].x;
        posArray[1] = positions[i - 1].y;
        posArray[2] = positions[i - 1].z;
        posArray[3] = positions[i].x;
        posArray[4] = positions[i].y;
        posArray[5] = positions[i].z;
      }
      geometry.attributes['position'].needsUpdate = true;
    }
  }

  private updateMagnetParticles(dt: number) {
    const radius = 2.0;
    for (let i = 0; i < this.magnetParticles.length; i++) {
      const particle = this.magnetParticles[i];
      particle.visible = true;
      const angle = (i / this.magnetParticles.length) * Math.PI * 2 + Date.now() * 0.001;
      particle.position.x = this.mesh.position.x + Math.cos(angle) * radius;
      particle.position.y = this.mesh.position.y + Math.sin(angle) * radius;
      particle.position.z = this.mesh.position.z;
      particle.rotation.y += dt * 3;
    }
  }

  getShootCooldown(): number {
    const baseCooldown = 0.2;
    return baseCooldown * this.effectManager.getShootCooldownMultiplier();
  }

  reset() {
    this.mesh.position.set(0, 1, 0);
    this.mesh.rotation.set(0, 0, 0);
    this.healthSystem.reset();
    this.effectManager.clear();
    if (this.shieldMesh) {
      this.shieldMesh.visible = false;
    }
  }
}
