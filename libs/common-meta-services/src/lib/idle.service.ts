import { IdleService } from "@ballware/meta-services";
import { BehaviorSubject, distinctUntilChanged, Observable, tap } from "rxjs";

export class DefaultIdleService implements IdleService {

  get idle$(): Observable<boolean> {
    return this.idleSubject.asObservable().pipe(distinctUntilChanged());
  }

  private idleTimer = 0;
  private readonly idleSubject = new BehaviorSubject(false);

  constructor() {
    this.idle$
        .subscribe((idle) => console.log(`User idle ${idle}`));
  }

  renewBusy() {    
    setTimeout(() => this.idleSubject.next(false));

    if (this.idleTimer > 0) {
        clearTimeout(this.idleTimer);        
    }

    this.idleTimer = setTimeout(() => this.idleSubject.next(true), 1000 * 60 * 5);
  }
}
