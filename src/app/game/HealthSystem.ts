import { BehaviorSubject, Observable } from 'rxjs';

export class HealthSystem {
  private maxHealth: number;
  private currentHealth: number;
  private healthSubject: BehaviorSubject<{ health: number; maxHealth: number }>;
  private onHealthChangeCallback?: (health: number, maxHealth: number) => void;
  private onDeathCallback?: () => void;

  health$: Observable<{ health: number; maxHealth: number }>;

  constructor(maxHealth: number = 3) {
    this.maxHealth = maxHealth;
    this.currentHealth = maxHealth;
    this.healthSubject = new BehaviorSubject({ health: this.currentHealth, maxHealth: this.maxHealth });
    this.health$ = this.healthSubject.asObservable();
  }

  getHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getHealthRatio(): number {
    return this.currentHealth / this.maxHealth;
  }

  isAlive(): boolean {
    return this.currentHealth > 0;
  }

  takeDamage(amount: number = 1): boolean {
    if (this.currentHealth <= 0) return false;
    
    this.currentHealth = Math.max(0, this.currentHealth - amount);
    this.notifyHealthChange();
    
    if (this.currentHealth <= 0) {
      this.notifyDeath();
      return true;
    }
    
    return false;
  }

  heal(amount: number = 1): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    this.notifyHealthChange();
  }

  setMaxHealth(maxHealth: number): void {
    this.maxHealth = maxHealth;
    this.currentHealth = Math.min(this.currentHealth, this.maxHealth);
    this.notifyHealthChange();
  }

  reset(): void {
    this.currentHealth = this.maxHealth;
    this.notifyHealthChange();
  }

  onHealthChange(callback: (health: number, maxHealth: number) => void): void {
    this.onHealthChangeCallback = callback;
  }

  onDeath(callback: () => void): void {
    this.onDeathCallback = callback;
  }

  private notifyHealthChange(): void {
    this.healthSubject.next({ health: this.currentHealth, maxHealth: this.maxHealth });
    if (this.onHealthChangeCallback) {
      this.onHealthChangeCallback(this.currentHealth, this.maxHealth);
    }
  }

  private notifyDeath(): void {
    if (this.onDeathCallback) {
      this.onDeathCallback();
    }
  }
}

