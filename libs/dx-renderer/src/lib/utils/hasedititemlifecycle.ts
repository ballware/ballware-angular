import { Observable } from "rxjs";
import { EditLayoutItem } from "@ballware/meta-model";
import { EditItemRef } from "@ballware/meta-services";

export interface HasEditItemLifecycle extends EditItemRef {
  preparedLayoutItem$: Observable<EditLayoutItem|undefined>;

  registerOption(option: string, getter: () => unknown, setter: (value: unknown) => void): void;
}
