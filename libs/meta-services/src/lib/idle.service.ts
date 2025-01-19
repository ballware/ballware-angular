import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface IdleService {
  get idle$(): Observable<boolean>;
  renewBusy(): void;
}

export const IDLE_SERVICE = new InjectionToken<IdleService>('Idle service');