import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { GameObjectsDialogComponent } from '../game-objects-dialog/game-objects-dialog.component';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Player } from '../game/Player';
import { World } from '../game/World';
import { ObstacleManager } from '../game/ObstacleManager';
import { ProjectileManager } from '../game/ProjectileManager';
import { ParticleSystem } from '../game/ParticleSystem';
import { AudioManager } from '../game/AudioManager';
import { ScoreService } from '../game/ScoreService';
import { PowerUpManager } from '../game/powerups/PowerUpManager';
import { EffectManager } from '../game/effects/EffectManager';
import { HealthSystem } from '../game/HealthSystem';
import { ComboSystem } from '../game/ComboSystem';
import { EffectType } from '../game/effects/EffectType';
import { PowerUpType, POWERUP_CONFIGS } from '../game/powerups/PowerUpType';
import { EnemyProjectileManager } from '../game/EnemyProjectileManager';
import { BossManager } from '../game/BossManager';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer!: THREE.WebGLRenderer;
  composer!: EffectComposer;
  clock!: THREE.Clock;

  world!: World;
  player!: Player;
  obstacleManager!: ObstacleManager;
  projectileManager!: ProjectileManager;
  enemyProjectileManager!: EnemyProjectileManager;
  bossManager!: BossManager;
  particleSystem!: ParticleSystem;
  audioManager!: AudioManager;
  powerUpManager!: PowerUpManager;
  comboSystem!: ComboSystem;

  isPlaying = false;
  isGameOver = false;
  isPaused = false;
  isMobile = false;
  
  shootCooldown = 0;
  cameraShake = 0;
  private isShooting = false;

  private animationId: number | null = null;

  constructor(
    private ngZone: NgZone,
    public scoreService: ScoreService,
    private dialog: MatDialog
  ) {}

  ngAfterViewInit() {
    this.detectMobile();
    this.initThree();
    this.initGame();
    this.setupEventListeners();
    this.preventTouchDefaults();
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }
    window.removeEventListener('resize', this.onWindowResize);
  }

  getCameraFOV(): number {
    if (window.innerWidth <= 768) {
      return 90;
    }
    return 75;
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.getCameraFOV(), window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);

    this.setupCamera();
    this.setupPostProcessing();
  }

  initGame() {
    this.clock = new THREE.Clock();
    this.world = new World(this.scene);
    this.player = new Player(this.scene);
    this.obstacleManager = new ObstacleManager(this.scene);
    this.particleSystem = new ParticleSystem(this.scene);
    this.projectileManager = new ProjectileManager(this.scene);
    this.enemyProjectileManager = new EnemyProjectileManager(this.scene);
    this.bossManager = new BossManager(this.scene, this.enemyProjectileManager);
    this.audioManager = new AudioManager();
    this.powerUpManager = new PowerUpManager(this.scene);
    this.comboSystem = new ComboSystem();
    
    this.obstacleManager.setProjectileManager(this.enemyProjectileManager);

    this.player.healthSystem.onDeath(() => {
      this.ngZone.run(() => {
        this.gameOver();
      });
    });
  }

  setupCamera() {
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 1, 0);
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.4,
      0.85
    );
    this.composer.addPass(bloomPass);
  }

  detectMobile() {
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    (window.innerWidth <= 768 && 'ontouchstart' in window);
  }

  preventTouchDefaults() {
    document.addEventListener('touchstart', (e) => {
      const target = e.target as HTMLElement;
      if (target.id !== 'shoot-button' && target.closest('#shoot-button') === null && 
          target.id !== 'pause-button' && target.closest('#pause-button') === null &&
          target.closest('.screen') === null) {
        e.preventDefault();
      }
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
      const target = e.target as HTMLElement;
      if (target.id !== 'shoot-button' && target.closest('#shoot-button') === null && 
          target.id !== 'pause-button' && target.closest('#pause-button') === null &&
          target.closest('.screen') === null) {
        e.preventDefault();
      }
    }, { passive: false });
    
    document.addEventListener('touchend', (e) => {
      const target = e.target as HTMLElement;
      if (target.id !== 'shoot-button' && target.closest('#shoot-button') === null && 
          target.id !== 'pause-button' && target.closest('#pause-button') === null &&
          target.closest('.screen') === null) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  onShootTouchStart(event: TouchEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isShooting = true;
    if (this.player) {
      this.player.input.shoot = true;
    }
  }

  onShootTouchEnd(event: TouchEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isShooting = false;
    if (this.player) {
      this.player.input.shoot = false;
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.fov = this.getCameraFOV();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  startGame() {
    this.isPlaying = true;
    this.isGameOver = false;
    this.isPaused = false;
    this.scoreService.startNewGame();
    this.cameraShake = 0;
    
    this.player.reset();
    this.obstacleManager.reset();
    this.projectileManager.reset();
    this.enemyProjectileManager.reset();
    this.bossManager.reset();
    this.particleSystem.reset();
    this.powerUpManager.reset();
    this.comboSystem.reset();
    
    this.clock.start();
  }

  togglePause() {
    if (this.isPlaying && !this.isGameOver) {
      this.isPaused = !this.isPaused;
    }
  }

  toggleGameObjectsMenu() {
    this.dialog.open(GameObjectsDialogComponent, {
      width: '90vw',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'game-objects-dialog',
      disableClose: false
    });
  }

  gameOver() {
    this.isPlaying = false;
    this.isGameOver = true;
    this.scoreService.finalizeScore();
  }

  resetToStartScreen() {
    this.isPlaying = false;
    this.isGameOver = false;
    this.scoreService.saveAsPrevious();
    this.scoreService.reset();
    this.cameraShake = 0;
    
    this.player.reset();
    this.obstacleManager.reset();
    this.projectileManager.reset();
    this.enemyProjectileManager.reset();
    this.bossManager.reset();
    this.particleSystem.reset();
    this.powerUpManager.reset();
    this.comboSystem.reset();
  }

  animate() {
    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        this.animationId = requestAnimationFrame(loop);
        
        if (this.isPlaying) {
          if (!this.isPaused) {
            const dt = this.clock.getDelta();
            
            this.player.update(dt);
            this.world.update(this.player.mesh.position.z);
            this.obstacleManager.update(dt, this.player.mesh.position);
            this.bossManager.update(dt, this.scoreService.currentScore, this.player.mesh.position);
            
            if (this.player.effectManager.hasMagnet()) {
              this.obstacleManager.applyMagnet(this.player.mesh.position, 25.0, dt);
            }
            
            const enemyProjectileHit = this.enemyProjectileManager.update(dt, this.player.mesh.position, this.player.mesh, this.particleSystem);
            if (enemyProjectileHit) {
              if (this.player.effectManager.hasShield()) {
                this.player.effectManager.clear();
                this.audioManager.playCollect();
              } else {
                const died = this.player.healthSystem.takeDamage(1);
                if (died) {
                  this.particleSystem.createExplosion(this.player.mesh.position, 50, 0x00ffff);
                  this.audioManager.playCrash();
                  this.cameraShake = 2.0;
                  this.ngZone.run(() => {
                    this.gameOver();
                  });
                } else {
                  this.particleSystem.createExplosion(this.player.mesh.position, 30, 0xff8800);
                  this.audioManager.playCrash();
                  this.cameraShake = 1.0;
                }
              }
            }
            
            this.particleSystem.update(dt);
            this.powerUpManager.update(dt, this.player.mesh.position, this.player.effectManager.hasMagnet());
            this.comboSystem.update(dt);
            
            const collectedPowerUp = this.powerUpManager.checkCollection(this.player.mesh);
            if (collectedPowerUp) {
              const config = POWERUP_CONFIGS[collectedPowerUp.powerUpType];
              if (collectedPowerUp.powerUpType === PowerUpType.HEALTH) {
                this.player.healthSystem.heal(1);
              } else {
                const effectType = this.mapPowerUpToEffectType(collectedPowerUp.powerUpType);
                if (effectType) {
                  this.player.effectManager.addEffect(effectType, config.duration);
                }
              }
              this.audioManager.playCollect();
              this.particleSystem.createExplosion(collectedPowerUp.getPosition(), 20, config.color);
            }
            
            if (this.shootCooldown > 0) this.shootCooldown -= dt;
            const shootCooldownTime = this.player.getShootCooldown();
            if (this.player.input.shoot && this.shootCooldown <= 0) {
              if (this.player.effectManager.hasMultiShot()) {
                const offset = 0.5;
                this.projectileManager.shoot(new THREE.Vector3(this.player.mesh.position.x - offset, this.player.mesh.position.y, this.player.mesh.position.z));
                this.projectileManager.shoot(this.player.mesh.position);
                this.projectileManager.shoot(new THREE.Vector3(this.player.mesh.position.x + offset, this.player.mesh.position.y, this.player.mesh.position.z));
              } else {
                this.projectileManager.shoot(this.player.mesh.position);
              }
              this.audioManager.playLaser();
              this.shootCooldown = shootCooldownTime;
            }
            
            const collisionResult = this.projectileManager.update(dt, this.obstacleManager, this.particleSystem);
            if (collisionResult.hit && collisionResult.enemy) {
              const baseScore = collisionResult.enemy.config.scoreValue;
              const comboMultiplier = this.comboSystem.getScoreMultiplier();
              const effectMultiplier = this.player.effectManager.getScoreMultiplier();
              const finalScore = Math.floor(baseScore * comboMultiplier * effectMultiplier);
              
              const previousCombo = this.comboSystem.getCombo();
              this.comboSystem.addKill();
              const newCombo = this.comboSystem.getCombo();
              
              if (newCombo > previousCombo && newCombo % 5 === 0) {
                this.particleSystem.createExplosion(this.player.mesh.position, 40, 0xffff00);
              }
              
              this.scoreService.addScore(finalScore);
              this.audioManager.playExplosion();
              this.cameraShake = 0.5;
            }

            const boss = this.bossManager.getBoss();
            if (boss && boss.active) {
              const bossHit = this.projectileManager.checkBossCollision(boss, this.particleSystem);
              if (bossHit) {
                const destroyed = boss.takeDamage(1);
                if (destroyed) {
                  const bossScore = 1000 * this.comboSystem.getScoreMultiplier() * this.player.effectManager.getScoreMultiplier();
                  this.scoreService.addScore(Math.floor(bossScore));
                  this.particleSystem.createExplosion(boss.getPosition(), 100, 0xff0088);
                  this.audioManager.playExplosion();
                  this.cameraShake = 1.5;
                } else {
                  this.particleSystem.createExplosion(boss.getPosition(), 30, 0xff0088);
                  this.audioManager.playExplosion();
                  this.cameraShake = 0.3;
                }
              }

              if (boss.checkCollision(this.player.mesh)) {
                if (this.player.effectManager.hasShield()) {
                  this.player.effectManager.clear();
                  this.audioManager.playCollect();
                } else {
                  const died = this.player.healthSystem.takeDamage(2);
                  if (died) {
                    this.particleSystem.createExplosion(this.player.mesh.position, 50, 0x00ffff);
                    this.audioManager.playCrash();
                    this.cameraShake = 2.0;
                    this.ngZone.run(() => {
                      this.gameOver();
                    });
                  } else {
                    this.particleSystem.createExplosion(this.player.mesh.position, 40, 0xff8800);
                    this.audioManager.playCrash();
                    this.cameraShake = 1.5;
                  }
                }
              }
            }
            
            this.cameraShake = Math.max(0, this.cameraShake - dt * 2);
            
            const collisionResult2 = this.obstacleManager.checkCollision(this.player.mesh);
            
            if (collisionResult2.type === 'game_over') {
              const enemy = collisionResult2.object as any;
              
              if (this.player.effectManager.hasShield()) {
                if (enemy && enemy.destroy) {
                  enemy.destroy();
                  this.obstacleManager.removeEnemy(enemy);
                }
                this.player.effectManager.clear();
                this.audioManager.playCollect();
                this.particleSystem.createExplosion(this.player.mesh.position, 30, 0x0088ff);
              } else {
                const died = this.player.healthSystem.takeDamage(1);
                
                if (enemy && enemy.destroy) {
                  enemy.destroy();
                  this.obstacleManager.removeEnemy(enemy);
                }
                
                if (died) {
                  this.particleSystem.createExplosion(this.player.mesh.position, 50, 0x00ffff);
                  
                  if (enemy) {
                    const pos = enemy.getPosition ? enemy.getPosition() : enemy.position;
                    if (pos) {
                      this.particleSystem.createExplosion(pos, 50, 0xff0000);
                    }
                  }

                  this.audioManager.playCrash();
                  this.cameraShake = 2.0;
                  
                  this.ngZone.run(() => {
                    this.gameOver();
                  });
                } else {
                  this.particleSystem.createExplosion(this.player.mesh.position, 30, 0xff8800);
                  this.audioManager.playCrash();
                  this.cameraShake = 1.0;
                }
              }
            } else if (collisionResult2.type === 'score') {
              const baseScore = 500;
              const effectMultiplier = this.player.effectManager.getScoreMultiplier();
              const finalScore = Math.floor(baseScore * effectMultiplier);
              this.scoreService.addScore(finalScore);
              this.audioManager.playCollect();
            }
            
            const currentTime = this.clock.getElapsedTime();
            const scoreUpdated = this.scoreService.updateScoreFromTime(dt, currentTime);
            if (scoreUpdated) {
              this.ngZone.run(() => {});
            }
          }
          
          this.world.update(this.player.mesh.position.z);
          this.camera.position.z = this.player.mesh.position.z + 10;
          if (!this.isPaused) {
            this.camera.position.x = (this.player.mesh.position.x * 0.3) + (Math.random() - 0.5) * this.cameraShake;
            this.camera.position.y = 5 + (Math.random() - 0.5) * this.cameraShake;
          } else {
            this.camera.position.x = this.player.mesh.position.x * 0.3;
            this.camera.position.y = 5;
          }
        } else {
          if (this.player && this.player.mesh) {
            this.world.update(this.player.mesh.position.z);
            this.camera.position.z = this.player.mesh.position.z + 10;
            this.camera.position.x = this.player.mesh.position.x * 0.3;
            this.camera.position.y = 5;
            this.camera.lookAt(this.player.mesh.position);
          }
        }

        this.composer.render();
      };
      loop();
    });
  }

  private mapPowerUpToEffectType(powerUpType: PowerUpType): EffectType | null {
    switch (powerUpType) {
      case PowerUpType.SHIELD:
        return EffectType.SHIELD;
      case PowerUpType.RAPID_FIRE:
        return EffectType.RAPID_FIRE;
      case PowerUpType.MULTI_SHOT:
        return EffectType.MULTI_SHOT;
      case PowerUpType.SPEED_BOOST:
        return EffectType.SPEED_BOOST;
      case PowerUpType.MAGNET:
        return EffectType.MAGNET;
      case PowerUpType.SCORE_MULTIPLIER:
        return EffectType.SCORE_MULTIPLIER;
      default:
        return null;
    }
  }

  getHealthHearts(): boolean[] {
    const health = this.player.healthSystem.getHealth();
    const maxHealth = this.player.healthSystem.getMaxHealth();
    return Array(maxHealth).fill(false).map((_, i) => i < health);
  }

  getEffectIcon(effectType: EffectType): string {
    switch (effectType) {
      case EffectType.SHIELD:
        return '🛡️';
      case EffectType.RAPID_FIRE:
        return '⚡';
      case EffectType.MULTI_SHOT:
        return '💥';
      case EffectType.SPEED_BOOST:
        return '🚀';
      case EffectType.MAGNET:
        return '🧲';
      case EffectType.SCORE_MULTIPLIER:
        return '⭐';
      default:
        return '✨';
    }
  }

  getEffectName(effectType: EffectType): string {
    switch (effectType) {
      case EffectType.SHIELD:
        return 'Shield';
      case EffectType.RAPID_FIRE:
        return 'Rapid Fire';
      case EffectType.MULTI_SHOT:
        return 'Multi Shot';
      case EffectType.SPEED_BOOST:
        return 'Speed Boost';
      case EffectType.MAGNET:
        return 'Magnet';
      case EffectType.SCORE_MULTIPLIER:
        return 'Score Multiplier';
      default:
        return 'Effect';
    }
  }
}

