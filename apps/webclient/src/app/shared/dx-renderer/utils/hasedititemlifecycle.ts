import { Observable } from "rxjs";
import { EditLayoutItem } from "@ballware/meta-model";

export interface HasEditItemLifecycle {
  preparedLayoutItem$: Observable<EditLayoutItem|undefined>;
}
