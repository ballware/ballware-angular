import { Component, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EditItemRef, EditService } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { ClickEvent } from 'devextreme/ui/button';
import { combineLatest, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithReadonly } from '../../utils/withreadonly';

@Component({
  selector: 'ballware-edit-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class EditLayoutButtonComponent extends WithReadonly(WithEditItemLifecycle(WithDestroy())) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  private dataMember: string|undefined;
  private editorEvent: ((dataMember: string, event: string) => void)|undefined;

  constructor(private translationService: I18NextPipe, private editService: EditService) {
    super();
  }

  ngOnInit(): void {
    if (this.initialLayoutItem) {
      this.initLifecycle(this.initialLayoutItem, this.editService, this);

      this.preparedLayoutItem$
        .pipe(takeUntil(this.destroy$))
        .subscribe((layoutItem) => {
          if (layoutItem) {
            this.initReadonly(layoutItem, this.editService);

            this.layoutItem = layoutItem;            
            this.dataMember = layoutItem.options?.dataMember;
          }
        });

      combineLatest([this.editService.editorEvent$])
        .pipe(takeUntil(this.destroy$))
        .subscribe(([editorEvent]) => {
            if (editorEvent) {
              this.editorEvent = (dataMember, event) => editorEvent({ dataMember, event });
            }            
        });
    }
  }

  onClick(e: ClickEvent) {
    if (this.editorEvent && this.dataMember) {
      this.editorEvent(this.dataMember, 'click');
    }
  }

  public getOption(option: string): any {
    switch (option) {
      case 'readonly':
        return this.readonly$.getValue();
    }

    return undefined;
  }

  public setOption(option: string, value: unknown) {
    switch (option) {
      case 'readonly':
        this.setReadonly(value as boolean)
        break;
    }
  }
}
