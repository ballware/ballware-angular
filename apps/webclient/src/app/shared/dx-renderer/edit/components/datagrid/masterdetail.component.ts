import { Component, Input, OnInit } from '@angular/core';
import { MasterdetailService } from './masterdetail.service';

@Component({
  selector: 'ballware-datagrid-masterdetail',
  templateUrl: './masterdetail.component.html',
  styleUrls: ['./masterdetail.component.scss'],
  providers: [
    { provide: MasterdetailService, useClass: MasterdetailService }
  ]
})
export class DatagridMasterdetailComponent implements OnInit {
    @Input() item!: Record<string, unknown>;

    constructor(private masterdetailService: MasterdetailService) {}

    ngOnInit(): void {
        this.masterdetailService.item$.next(this.item);
    }
}
