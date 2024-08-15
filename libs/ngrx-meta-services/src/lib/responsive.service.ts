import { ResponsiveService, SCREEN_SIZE } from "@ballware/meta-services";
import { BehaviorSubject, distinctUntilChanged, Observable } from "rxjs";

export class ResponsiveServiceImplementation implements ResponsiveService {

  get onResize$(): Observable<SCREEN_SIZE> {
    return this.resizeSubject.asObservable().pipe(distinctUntilChanged());
  }

  private resizeSubject = new BehaviorSubject(SCREEN_SIZE.LG);

  onResize(size: SCREEN_SIZE) {
    setTimeout(() => this.resizeSubject.next(size));
  }
}
