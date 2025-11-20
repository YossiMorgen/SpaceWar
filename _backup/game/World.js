import * as THREE from 'three';

export class World {
  constructor(scene) {
    this.scene = scene;
    this.chunkSize = 100;
    this.gridSize = 1000;

    this.setupLights();
    this.setupGrid();
    this.setupBackground();
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xff00ff, 1);
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);

    // Fog for depth/synthwave vibe
    this.scene.fog = new THREE.FogExp2(0x000000, 0.015);
  }

  setupGrid() {
    // Create a large grid helper
    // We will move this grid to follow the player's Z position
    this.grid = new THREE.GridHelper(this.gridSize, 100, 0xff00ff, 0x220022);
    this.scene.add(this.grid);

    // Add a floor plane below for reflections or just to block view
    const geometry = new THREE.PlaneGeometry(this.gridSize, this.gridSize);
    const material = new THREE.MeshBasicMaterial({ color: 0x050005, side: THREE.DoubleSide });
    this.floor = new THREE.Mesh(geometry, material);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -0.1; // Slightly below grid
    this.scene.add(this.floor);
  }

  setupBackground() {
    this.scene.background = new THREE.Color(0x050010);
  }

  update(playerZ) {
    // Snap grid to player position to create infinite illusion
    // We only care about Z movement for the infinite effect
    const snapZ = Math.floor(playerZ / 10) * 10;
    this.grid.position.z = snapZ;
    this.floor.position.z = snapZ;
  }
}
