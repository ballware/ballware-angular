import { EditLayoutItem } from "@ballware/meta-model";
import { EditItemRef, EditService } from "@ballware/meta-services";
import { cloneDeep } from "lodash";
import { BehaviorSubject, Subject, combineLatest, map, takeUntil } from "rxjs";
import { HasDestroy } from "./hasdestroy";
import { HasEditItemLifecycle } from "./hasedititemlifecycle";

type Constructor<T> = new(...args: any[]) => T;

export function WithEditItemLifecycle<T extends Constructor<HasDestroy>>(Base: T = (class {} as any)) {
    return class extends Base implements HasEditItemLifecycle {

      public preparedLayoutItem$ = new BehaviorSubject<EditLayoutItem|undefined>(undefined);
      
      public editorEntered$ = new Subject<void>();
      public editorEvent$ = new Subject<{ event: string }>();

      readonly onEntered = () => this.editorEntered$.next();
      readonly onEvent = (event: string) => this.editorEvent$.next({ event });

      initLifecycle(layoutItem: EditLayoutItem, editService: EditService, ref: EditItemRef): void {
        combineLatest([editService.editorPreparing$])
          .pipe(takeUntil(this.destroy$))
          .pipe(map(([editorPreparing]) => {
              if (editorPreparing && layoutItem.options?.dataMember) {
                const preparedLayoutItem = cloneDeep(layoutItem);

                editorPreparing({ dataMember: layoutItem.options.dataMember, layoutItem: preparedLayoutItem });

                return preparedLayoutItem;
              }

              return undefined;
            }
          ))
          .subscribe((preparedLayoutItem) => this.preparedLayoutItem$.next(preparedLayoutItem));

        combineLatest([this.preparedLayoutItem$, editService.editorInitialized$])
          .pipe(takeUntil(this.destroy$))
          .subscribe(([layoutItem, editorInitialized]) => {
            if (layoutItem && editorInitialized && layoutItem.options?.dataMember) {
              editorInitialized({ dataMember: layoutItem.options.dataMember, ref });
            }
          });

        combineLatest([editService.editorEntered$, this.editorEntered$])
          .pipe(takeUntil(this.destroy$))
          .subscribe(([editorEntered,]) => {
            if (editorEntered && layoutItem.options?.dataMember) {
              editorEntered({ dataMember: layoutItem.options.dataMember });
            }
          });

        combineLatest([editService.editorEvent$, this.editorEvent$])
          .pipe(takeUntil(this.destroy$))
          .subscribe(([editorEvent, { event }]) => {
            if (editorEvent && layoutItem.options?.dataMember) {
              editorEvent({ dataMember: layoutItem.options.dataMember, event });
            }
          });
      }
    }
}
