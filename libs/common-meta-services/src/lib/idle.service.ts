import { IdleService } from "@ballware/meta-services";
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";

export class DefaultIdleService implements IdleService {

  get idle$(): Observable<boolean> {
    return this.idleSubject.asObservable().pipe(distinctUntilChanged());
  }

  private idleTimer: ReturnType<typeof setTimeout>|undefined = undefined;
  private readonly idleSubject = new BehaviorSubject(false);

  constructor() {
    this.idle$
        .subscribe((idle) => console.log(`User idle ${idle}`));
  }

  renewBusy() {
    setTimeout(() => this.idleSubject.next(false));

    if (this.idleTimer) {
        clearTimeout(this.idleTimer);
    }

    this.idleTimer = setTimeout(() => this.idleSubject.next(true), 1000 * 60 * 5);
  }
}
