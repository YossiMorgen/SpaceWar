import { BehaviorSubject, Observable } from 'rxjs';
import { Effect } from './Effect';
import { EffectType } from './EffectType';

export class EffectManager {
  private effects: Map<EffectType, Effect>;
  private effectsSubject: BehaviorSubject<Effect[]>;

  effects$: Observable<Effect[]>;

  constructor() {
    this.effects = new Map();
    this.effectsSubject = new BehaviorSubject<Effect[]>([]);
    this.effects$ = this.effectsSubject.asObservable();
  }

  addEffect(type: EffectType, duration: number): void {
    const existing = this.effects.get(type);
    if (existing) {
      existing.extend(duration);
    } else {
      this.effects.set(type, new Effect(type, duration));
    }
    this.notifyEffectsChange();
  }

  update(dt: number): void {
    for (const [type, effect] of this.effects.entries()) {
      effect.update(dt);
      if (!effect.isActive) {
        this.effects.delete(type);
      }
    }
    this.notifyEffectsChange();
  }

  hasEffect(type: EffectType): boolean {
    const effect = this.effects.get(type);
    return effect ? effect.isActive : false;
  }

  getEffect(type: EffectType): Effect | null {
    const effect = this.effects.get(type);
    return effect && effect.isActive ? effect : null;
  }

  getAllActiveEffects(): Effect[] {
    return Array.from(this.effects.values()).filter(e => e.isActive);
  }

  clear(): void {
    this.effects.clear();
    this.notifyEffectsChange();
  }

  private notifyEffectsChange(): void {
    this.effectsSubject.next(this.getAllActiveEffects());
  }

  getShootCooldownMultiplier(): number {
    return this.hasEffect(EffectType.RAPID_FIRE) ? 0.3 : 1.0;
  }

  getSpeedMultiplier(): number {
    return this.hasEffect(EffectType.SPEED_BOOST) ? 1.5 : 1.0;
  }

  getScoreMultiplier(): number {
    return this.hasEffect(EffectType.SCORE_MULTIPLIER) ? 2.0 : 1.0;
  }

  hasShield(): boolean {
    return this.hasEffect(EffectType.SHIELD);
  }

  hasMagnet(): boolean {
    return this.hasEffect(EffectType.MAGNET);
  }

  hasMultiShot(): boolean {
    return this.hasEffect(EffectType.MULTI_SHOT);
  }
}

