import { EditLayoutItem } from "@ballware/meta-model";
import { EDIT_SERVICE, EditItemRef, EditService } from "@ballware/meta-services";
import { cloneDeep } from "lodash";
import { BehaviorSubject, Observable, Subject, combineLatest, map, takeUntil, tap } from 'rxjs';
import { Directive, Inject, Input, OnInit } from "@angular/core";
import { Destroy } from "./destroy";

@Directive({
  standalone: true
})
export class EditItemLivecycle implements OnInit, EditItemRef {
  @Input() initialLayoutItem!: EditLayoutItem|undefined;

  private readonly _optionRegistry = new Array<{ option: string, getter: () => unknown, setter: (value: unknown) => void }>();
  private _preparedLayoutItem$ = new BehaviorSubject<EditLayoutItem|undefined>(undefined);

  private _editorEntered$ = new Subject<void>();
  private _editorEvent$ = new Subject<{ event: string }>();

  layoutItem: EditLayoutItem|undefined;

  get preparedLayoutItem$(): Observable<EditLayoutItem|undefined> {
    return this._preparedLayoutItem$;
  }

  readonly registerOption = (option: string, getter: () => unknown, setter: (value: unknown) => void) => {

    const registeredOption = this._optionRegistry.find(o => o.option === option);

    if (registeredOption) {
      registeredOption.getter = getter;
      registeredOption.setter = setter;
    } else {
      this._optionRegistry.push({ option, getter, setter });
    }
  }

  readonly onEntered = () => this._editorEntered$.next();
  readonly onEvent = (event: string) => this._editorEvent$.next({ event });

  readonly getOption = (option: string): unknown => {

    const registeredOption = this._optionRegistry.find(o => o.option === option);

    if (registeredOption) {
      return registeredOption.getter();
    }

    throw new Error(`Unsupported option <${option}>`);
  }

  readonly setOption = (option: string, value: unknown) => {

    const registeredOption = this._optionRegistry.find(o => o.option === option);

    if (registeredOption) {
      registeredOption.setter(value);

      return;
    }

    throw new Error(`Unsupported option <${option}>`);
  }

  constructor(private destroy: Destroy, @Inject(EDIT_SERVICE) private editService: EditService ) {}

  ngOnInit(): void {
    if (this.initialLayoutItem && this.initialLayoutItem?.options?.dataMember) {
      const preparedLayoutItem = cloneDeep(this.initialLayoutItem);

      this.editService.editorPreparing({ dataMember: this.initialLayoutItem.options.dataMember, layoutItem: preparedLayoutItem })
        .pipe(
          takeUntil(this.destroy.destroy$),
          tap((preparedLayoutItem) => this._preparedLayoutItem$.next(preparedLayoutItem)),
          tap((preparedLayoutItem: EditLayoutItem) => {
            if (preparedLayoutItem.options?.dataMember) {
              this.editService.editorInitialized({ dataMember: preparedLayoutItem.options.dataMember, ref: this });
            }
          })
        )
        .subscribe(preparedLayoutItem => this.layoutItem = preparedLayoutItem);

      this._editorEntered$
        .pipe(takeUntil(this.destroy.destroy$))
        .subscribe(() => {
          if (this.initialLayoutItem?.options?.dataMember) {
            this.editService.editorEntered({ dataMember: this.initialLayoutItem.options.dataMember });
          }
        });

      this._editorEvent$
        .pipe(takeUntil(this.destroy.destroy$))
        .subscribe(({ event }) => {
          if (this.initialLayoutItem?.options?.dataMember) {
            this.editService.editorEvent({ dataMember: this.initialLayoutItem.options.dataMember, event });
          }
        });
    }
  }
}
