import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-game-objects-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule
  ],
  templateUrl: './game-objects-dialog.component.html',
  styleUrl: './game-objects-dialog.component.scss'
})
export class GameObjectsDialogComponent {
  gameObjects: Array<{
    category: string;
    items: Array<{
      name: string;
      icon: string;
      description: string;
      expanded?: boolean;
    }>;
  }> = [
    {
      category: 'Player',
      items: [
        {
          name: 'Player Ship',
          icon: '🚀',
          description: 'Your cyan spaceship. Use Arrow Keys or WASD to move, Spacebar to shoot. You have 3 health points and can collect power-ups to enhance your abilities.',
          expanded: false
        }
      ]
    },
    {
      category: 'Enemies',
      items: [
        {
          name: 'Basic Enemy',
          icon: '🔴',
          description: 'Standard red enemy ship. Takes 1 hit to destroy, worth 100 points. Moves straight toward you.',
          expanded: false
        },
        {
          name: 'Fast Enemy',
          icon: '🟠',
          description: 'Orange enemy that zigzags unpredictably. Faster than basic enemies, worth 150 points. Harder to hit due to erratic movement.',
          expanded: false
        },
        {
          name: 'Tank Enemy',
          icon: '🟥',
          description: 'Large dark red enemy with heavy armor. Takes 3 hits to destroy, worth 300 points. Moves slowly but is very durable.',
          expanded: false
        },
        {
          name: 'Swarmer Enemy',
          icon: '🟣',
          description: 'Small purple enemy that moves in erratic patterns. Fast and hard to predict, worth 120 points. Often spawns in groups.',
          expanded: false
        },
        {
          name: 'Shooter Enemy',
          icon: '🟧',
          description: 'Orange enemy equipped with cannons. Fires projectiles at you periodically. Takes 2 hits to destroy, worth 200 points. Keep moving to dodge its shots!',
          expanded: false
        },
        {
          name: 'Chaser Enemy',
          icon: '🟢',
          description: 'Green enemy that actively pursues your position. Uses AI to track and follow you, worth 180 points. More dangerous than basic enemies.',
          expanded: false
        },
        {
          name: 'Boss Enemy',
          icon: '👾',
          description: 'Massive pink boss ship that appears every 10,000 points. Has 15 health and multiple attack patterns. Defeating it rewards 1000 points. Watch for its charge attacks and multi-directional shots!',
          expanded: false
        }
      ]
    },
    {
      category: 'Collectibles',
      items: [
        {
          name: 'Yellow Star',
          icon: '⭐',
          description: 'Collectible star that gives you 500 points. Rotates and glows, making it easy to spot. Collect as many as possible to boost your score!',
          expanded: false
        }
      ]
    },
    {
      category: 'Power-Ups',
      items: [
        {
          name: 'Shield',
          icon: '🛡️',
          description: 'Blue shield power-up that grants temporary invincibility for 10 seconds. Absorbs one enemy collision or projectile hit. The shield appears as a rotating blue sphere around your ship.',
          expanded: false
        },
        {
          name: 'Rapid Fire',
          icon: '⚡',
          description: 'Pink power-up that increases your firing rate by 70% for 8 seconds. Shoot faster to take down enemies more quickly!',
          expanded: false
        },
        {
          name: 'Multi-Shot',
          icon: '💥',
          description: 'Green power-up that enables triple-shot mode for 10 seconds. Each shot fires three projectiles in a spread pattern, increasing your damage output significantly.',
          expanded: false
        },
        {
          name: 'Speed Boost',
          icon: '🚀',
          description: 'Yellow power-up that increases your forward speed by 50% for 6 seconds. Creates visible speed trails behind your ship. Move faster to escape danger or chase enemies!',
          expanded: false
        },
        {
          name: 'Magnet',
          icon: '🧲',
          description: 'Orange power-up that pulls stars and power-ups toward you for 12 seconds. Creates a magnetic field visible as orbiting particles. Makes collecting items much easier!',
          expanded: false
        },
        {
          name: 'Score Multiplier',
          icon: '⭐',
          description: 'Purple power-up that doubles all score gains for 15 seconds. Combined with combos, this can massively increase your score. Perfect for high-score runs!',
          expanded: false
        },
        {
          name: 'Health',
          icon: '❤️',
          description: 'Green health pickup that restores 1 health point. Essential for survival! Collect these to extend your run and survive longer.',
          expanded: false
        }
      ]
    },
    {
      category: 'Projectiles',
      items: [
        {
          name: 'Player Projectile',
          icon: '💨',
          description: 'Cyan laser bolts fired from your ship. Travels forward and destroys enemies on contact. With Multi-Shot, fires three projectiles at once.',
          expanded: false
        },
        {
          name: 'Enemy Projectile',
          icon: '🔥',
          description: 'Orange fireballs fired by Shooter enemies and Bosses. These can damage you if they hit. Use your shield or dodge them to avoid taking damage!',
          expanded: false
        }
      ]
    },
    {
      category: 'Effects',
      items: [
        {
          name: 'Explosions',
          icon: '💥',
          description: 'Particle explosions that occur when enemies are destroyed or when you take damage. Different colors indicate different events - red for enemy destruction, cyan for player damage.',
          expanded: false
        },
        {
          name: 'Speed Trails',
          icon: '✨',
          description: 'Yellow trails that appear behind your ship when Speed Boost is active. Visual indicator of your increased speed.',
          expanded: false
        },
        {
          name: 'Magnet Particles',
          icon: '🌀',
          description: 'Orbiting orange particles that appear around your ship when Magnet power-up is active. Shows the magnetic field pulling collectibles toward you.',
          expanded: false
        }
      ]
    }
  ];

  constructor(private dialogRef: MatDialogRef<GameObjectsDialogComponent>) {}

  close(): void {
    this.dialogRef.close();
  }
}

