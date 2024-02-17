import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

export enum SCREEN_SIZE {
  XS,
  SM,
  MD,
  LG,
  XL
}


@Injectable({
  providedIn: 'root'
})
export class ResponsiveService {

  get onResize$(): Observable<SCREEN_SIZE> {
    return this.resizeSubject.asObservable().pipe(distinctUntilChanged());
  }

  private resizeSubject = new BehaviorSubject(SCREEN_SIZE.LG);

  onResize(size: SCREEN_SIZE) {
    setInterval(() => this.resizeSubject.next(size));
  }
}
