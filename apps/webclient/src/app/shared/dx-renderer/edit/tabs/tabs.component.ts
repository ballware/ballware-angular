import { Component, Input, OnInit } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-edit-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class EditLayoutTabsComponent extends WithDestroy() implements OnInit {

  @Input() layoutItem?: EditLayoutItem;

  public panels: any[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.panels = this.layoutItem?.items?.filter(item => item.type === 'tab') ?? [];
  }

  get styles(): object {
    return { 'height': this.layoutItem?.options?.height ?? '100%' };
  }
}
