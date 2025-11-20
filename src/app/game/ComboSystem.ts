import { BehaviorSubject, Observable } from 'rxjs';

export class ComboSystem {
  private currentCombo: number;
  private maxCombo: number;
  private comboTimeout: number;
  private timeSinceLastKill: number;
  private readonly COMBO_TIMEOUT_DURATION = 3.0;
  private comboSubject: BehaviorSubject<{ combo: number; multiplier: number }>;
  private onComboChangeCallback?: (combo: number, multiplier: number) => void;

  combo$: Observable<{ combo: number; multiplier: number }>;

  constructor() {
    this.currentCombo = 0;
    this.maxCombo = 0;
    this.comboTimeout = this.COMBO_TIMEOUT_DURATION;
    this.timeSinceLastKill = 0;
    this.comboSubject = new BehaviorSubject({ combo: 0, multiplier: 1.0 });
    this.combo$ = this.comboSubject.asObservable();
  }

  addKill(): void {
    this.currentCombo++;
    this.maxCombo = Math.max(this.maxCombo, this.currentCombo);
    this.timeSinceLastKill = 0;
    this.notifyComboChange();
  }

  update(dt: number): void {
    if (this.currentCombo > 0) {
      this.timeSinceLastKill += dt;
      if (this.timeSinceLastKill >= this.comboTimeout) {
        this.resetCombo();
      }
    }
  }

  resetCombo(): void {
    if (this.currentCombo > 0) {
      this.currentCombo = 0;
      this.timeSinceLastKill = 0;
      this.notifyComboChange();
    }
  }

  getCombo(): number {
    return this.currentCombo;
  }

  getMaxCombo(): number {
    return this.maxCombo;
  }

  getMultiplier(): number {
    if (this.currentCombo === 0) return 1.0;
    if (this.currentCombo < 5) return 1.0 + (this.currentCombo * 0.1);
    if (this.currentCombo < 10) return 1.5 + ((this.currentCombo - 5) * 0.1);
    return 2.0 + Math.min((this.currentCombo - 10) * 0.05, 1.0);
  }

  getScoreMultiplier(): number {
    return this.getMultiplier();
  }

  onComboChange(callback: (combo: number, multiplier: number) => void): void {
    this.onComboChangeCallback = callback;
  }

  reset(): void {
    this.currentCombo = 0;
    this.timeSinceLastKill = 0;
    this.notifyComboChange();
  }

  private notifyComboChange(): void {
    const multiplier = this.getMultiplier();
    this.comboSubject.next({ combo: this.currentCombo, multiplier });
    if (this.onComboChangeCallback) {
      this.onComboChangeCallback(this.currentCombo, multiplier);
    }
  }
}

