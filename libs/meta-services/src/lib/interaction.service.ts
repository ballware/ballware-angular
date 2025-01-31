import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface InteractionService {
  get keyboardLine$(): Observable<string>;

  triggerKeyPress(key: string): void;
}

export const INTERACTION_SERVICE = new InjectionToken<InteractionService>('Interaction service');