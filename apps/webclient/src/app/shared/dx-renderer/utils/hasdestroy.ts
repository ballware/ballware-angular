import { Subject } from "rxjs";

export interface HasDestroy {
  destroy$: Subject<void>;
}
