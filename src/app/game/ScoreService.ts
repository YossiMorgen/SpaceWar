import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private currentScoreSubject = new BehaviorSubject<number>(0);
  private previousScoreSubject = new BehaviorSubject<number>(0);
  private finalScoreSubject = new BehaviorSubject<number>(0);
  
  currentScore$: Observable<number> = this.currentScoreSubject.asObservable();
  previousScore$: Observable<number> = this.previousScoreSubject.asObservable();
  finalScore$: Observable<number> = this.finalScoreSubject.asObservable();
  
  private scoreAccumulator = 0;
  private lastScoreUpdate = 0;
  
  get currentScore(): number {
    return this.currentScoreSubject.value;
  }
  
  get previousScore(): number {
    return this.previousScoreSubject.value;
  }
  
  get finalScore(): number {
    return this.finalScoreSubject.value;
  }
  
  addScore(amount: number): void {
    this.scoreAccumulator += amount;
  }
  
  updateScoreFromTime(dt: number, currentTime: number): boolean {
    this.scoreAccumulator += dt * 10;
    
    if (currentTime - this.lastScoreUpdate >= 0.1) {
      if (this.scoreAccumulator > 0) {
        const newScore = this.currentScoreSubject.value + this.scoreAccumulator;
        this.currentScoreSubject.next(newScore);
        this.scoreAccumulator = 0;
        this.lastScoreUpdate = currentTime;
        return true;
      }
      this.lastScoreUpdate = currentTime;
    }
    return false;
  }
  
  finalizeScore(): void {
    const finalScore = Math.floor(this.currentScoreSubject.value + this.scoreAccumulator);
    this.currentScoreSubject.next(finalScore);
    this.scoreAccumulator = 0;
    this.finalScoreSubject.next(finalScore);
  }
  
  saveAsPrevious(): void {
    const finalScore = Math.floor(this.currentScoreSubject.value + this.scoreAccumulator);
    this.previousScoreSubject.next(finalScore);
  }
  
  reset(): void {
    this.saveAsPrevious();
    this.currentScoreSubject.next(0);
    this.scoreAccumulator = 0;
    this.lastScoreUpdate = 0;
  }
  
  startNewGame(): void {
    this.currentScoreSubject.next(0);
    this.finalScoreSubject.next(0);
    this.scoreAccumulator = 0;
    this.lastScoreUpdate = 0;
  }
}

