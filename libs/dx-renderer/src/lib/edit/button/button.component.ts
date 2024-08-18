import { Component, Inject, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService } from '@ballware/meta-services';
import { ClickEvent } from 'devextreme/ui/button';
import { combineLatest, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithReadonly } from '../../utils/withreadonly';
import { WithVisible } from '../../utils/withvisible';
import { CommonModule } from '@angular/common';
import { DxButtonModule } from 'devextreme-angular';

@Component({
  selector: 'ballware-edit-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  imports: [CommonModule, DxButtonModule],
  standalone: true
})
export class EditLayoutButtonComponent extends WithVisible(WithReadonly(WithEditItemLifecycle(WithDestroy()))) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  private dataMember: string|undefined;
  private editorEvent: ((dataMember: string, event: string) => void)|undefined;

  constructor(
    @Inject(EDIT_SERVICE) private editService: EditService) {
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
            this.initVisible(layoutItem);

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
      case 'visible':
        return this.visible$.getValue();        
    }

    return undefined;
  }

  public setOption(option: string, value: unknown) {
    switch (option) {
      case 'readonly':
        this.setReadonly(value as boolean)
        break;
      case 'visible':
        this.setVisible(value as boolean);
        break;        
    }
  }
}
