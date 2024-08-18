import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EditLayoutItemComponent } from './item.component';

@Component({
  selector: 'ballware-edit-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss'],
  imports: [CommonModule, EditLayoutItemComponent],
  standalone: true
})
export class EditLayoutContainerComponent implements OnChanges {

  @Input() height: string|undefined = undefined;
  @Input() colCount!: number;
  @Input() items!: EditLayoutItem[];

  public rows: Array<EditLayoutItem[]> = [];

  ngOnChanges(): void {
    this.rows = [];

    let currentRow: EditLayoutItem[] = [];
    let currentRowColCount = 0;

    this.items?.filter(layoutItem => !layoutItem.ignore).forEach(layoutItem => {
      if ((this.colCount ?? 1) < currentRowColCount + (layoutItem.colSpan ?? 1) ) {
        if (currentRow.length) {
          this.rows.push(currentRow);
        }        

        currentRow = [];
        currentRowColCount = 0;
      }

      currentRow.push(layoutItem);
      currentRowColCount += (layoutItem.colSpan ?? 1);
    });

    if (currentRow.length) {
      this.rows.push(currentRow);
    }
  }
}
