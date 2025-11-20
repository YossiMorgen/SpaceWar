import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { Player } from './game/Player.js';
import { World } from './game/World.js';
import { ObstacleManager } from './game/ObstacleManager.js';
import './style.css';

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    // document.body.appendChild(this.renderer.domElement);
    document.getElementById('app').appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.isPlaying = false;
    this.score = 0;

    // Game Components
    this.world = new World(this.scene);
    this.player = new Player(this.scene);
    this.obstacleManager = new ObstacleManager(this.scene);

    // UI Elements
    this.scoreEl = document.getElementById('score');
    this.finalScoreEl = document.getElementById('final-score');
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.startBtn = document.getElementById('start-btn');
    this.restartBtn = document.getElementById('restart-btn');

    this.setupCamera();
    this.setupPostProcessing();
    this.setupEventListeners();
    this.animate();
  }

  setupCamera() {
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, -10);
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // strength
      0.4, // radius
      0.85 // threshold
    );
    this.composer.addPass(bloomPass);
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize(), false);
    this.startBtn.addEventListener('click', () => this.startGame());
    this.restartBtn.addEventListener('click', () => this.startGame());
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  startGame() {
    this.isPlaying = true;
    this.score = 0;
    this.scoreEl.innerText = '0';
    
    this.player.reset();
    this.obstacleManager.reset();
    
    this.startScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    
    this.clock.start();
  }

  gameOver() {
    this.isPlaying = false;
    this.finalScoreEl.innerText = Math.floor(this.score);
    this.gameOverScreen.classList.remove('hidden');
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.isPlaying) {
      const dt = this.clock.getDelta();
      
      this.player.update(dt);
      this.world.update(this.player.mesh.position.z);
      this.obstacleManager.update(dt, this.player.mesh.position);
      
      // Camera follow
      this.camera.position.z = this.player.mesh.position.z + 10;
      this.camera.position.x = this.player.mesh.position.x * 0.3; // Slight follow
      
      // Collision Check
      const collisionType = this.obstacleManager.checkCollision(this.player.mesh);
      
      if (collisionType === 'game_over') {
        this.gameOver();
      } else if (collisionType === 'score') {
        this.score += 500; // Bonus points!
        // Visual feedback could go here
      }
      
      // Score update (based on distance traveled)
      this.score += dt * 10; // 10 points per second approx
      this.scoreEl.innerText = Math.floor(this.score);
    }

    this.composer.render();
    // this.renderer.render(this.scene, this.camera);
  }
}

// Initialize Game
new Game();
