import { EditLayoutItem } from "@ballware/meta-model";
import { EDIT_SERVICE, EditItemRef, EditService } from "@ballware/meta-services";
import { BehaviorSubject, Observable, Subject, combineLatest, map } from 'rxjs';
import { DestroyRef, Directive, Inject, Input, OnInit } from '@angular/core';
import { Breadcrumb } from './breadcrumb';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  hostDirectives: [Breadcrumb],
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

  constructor(private destroy: DestroyRef, @Inject(EDIT_SERVICE) private editService: EditService, private breadcrumb: Breadcrumb ) {}

  ngOnInit(): void {
    if (this.initialLayoutItem) {
      combineLatest([this.editService.editorPreparing$]).pipe(
        takeUntilDestroyed(this.destroy),
        map(([editorPreparing]) => {
            if (editorPreparing) {
              if (this.initialLayoutItem?.options?.dataMember) {
                return editorPreparing({ dataMember: this.initialLayoutItem.options.dataMember, layoutItem: this.initialLayoutItem });
              } else {
                return this.initialLayoutItem;
              }
            }

            return undefined;
          }
        ))
        .subscribe((preparedLayoutItem) => this._preparedLayoutItem$.next(preparedLayoutItem));

      combineLatest([this.preparedLayoutItem$, this.editService.editorInitialized$]).pipe(
        takeUntilDestroyed(this.destroy)
      ).subscribe(([layoutItem, editorInitialized]) => {
        if (layoutItem && editorInitialized && layoutItem.options?.dataMember) {
          editorInitialized({ dataMember: layoutItem.options.dataMember, ref: this });
          this.breadcrumb.setIdentifier(layoutItem.options?.dataMember);
        }

        this.layoutItem = layoutItem;
      });

      combineLatest([this.editService.editorEntered$, this._editorEntered$]).pipe(
        takeUntilDestroyed(this.destroy)
      ).subscribe(([editorEntered,]) => {
        if (editorEntered && this.initialLayoutItem?.options?.dataMember) {
          editorEntered({ dataMember: this.initialLayoutItem.options.dataMember });
        }
      });

      combineLatest([this.editService.editorEvent$, this._editorEvent$]).pipe(
        takeUntilDestroyed(this.destroy)
      ).subscribe(([editorEvent, { event }]) => {
        if (editorEvent && this.initialLayoutItem?.options?.dataMember) {
          editorEvent({ dataMember: this.initialLayoutItem.options.dataMember, event });
        }
      });
    }
  }
}
