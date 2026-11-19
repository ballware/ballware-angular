import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EditLayoutItemComponent } from './item.component';

@Component({
    selector: 'ballware-edit-container',
    templateUrl: './container.component.html',
    styleUrls: ['./container.component.scss'],
    imports: [CommonModule, EditLayoutItemComponent]
})
export class EditLayoutContainerComponent implements OnChanges {

  @Input() height: string|undefined = undefined;
  @Input() colCount!: number;
  @Input() items!: EditLayoutItem[];

  public rows: Array<EditLayoutItem[]> = [];
  public rowItemIndexes: Array<number[]> = [];

  ngOnChanges(): void {
    this.rows = [];
    this.rowItemIndexes = [];

    let currentRow: EditLayoutItem[] = [];
    let currentRowIndexes: number[] = [];
    let currentRowColCount = 0;
    let itemIndex = 0;

    for (const layoutItem of this.items?.filter(layoutItem => !layoutItem.ignore) ?? []) {
      if ((this.colCount ?? 1) < currentRowColCount + (layoutItem.colSpan ?? 1) ) {
        if (currentRow.length) {
          this.rows.push(currentRow);
          this.rowItemIndexes.push(currentRowIndexes);
        }

        currentRow = [];
        currentRowIndexes = [];
        currentRowColCount = 0;
      }

      currentRow.push(layoutItem);
      currentRowIndexes.push(itemIndex);
      currentRowColCount += (layoutItem.colSpan ?? 1);
      itemIndex++;
    }

    if (currentRow.length) {
      this.rows.push(currentRow);
      this.rowItemIndexes.push(currentRowIndexes);
    }
  }
}
