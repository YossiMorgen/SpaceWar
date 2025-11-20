import { EffectType } from './EffectType';

export class Effect {
  type: EffectType;
  duration: number;
  remainingTime: number;
  isActive: boolean;
  startTime: number;

  constructor(type: EffectType, duration: number) {
    this.type = type;
    this.duration = duration;
    this.remainingTime = duration;
    this.isActive = true;
    this.startTime = Date.now();
  }

  update(dt: number): void {
    if (!this.isActive) return;
    
    this.remainingTime -= dt;
    if (this.remainingTime <= 0) {
      this.isActive = false;
    }
  }

  extend(duration: number): void {
    this.remainingTime += duration;
    this.duration += duration;
  }

  getProgress(): number {
    return Math.max(0, this.remainingTime / this.duration);
  }
}

