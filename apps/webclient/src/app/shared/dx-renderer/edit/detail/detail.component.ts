import { Component, Input, OnInit, Provider } from '@angular/core';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { EditService, EditModes } from '@ballware/meta-services';
import { DetailLayout } from '@ballware/meta-model';
import { WithDestroy } from '../../utils/withdestroy';
import { MasterdetailService } from '../components/datagrid/masterdetail.service';

@Component({
  selector: 'ballware-edit-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  providers: [
    {
      provide: EditService, useClass: EditService
    } as Provider
  ]
})
export class EditDetailComponent extends WithDestroy() implements OnInit {

  @Input() detailLayout!: DetailLayout;

  public layout$ = new BehaviorSubject<DetailLayout|undefined>(undefined);

  constructor(private masterdetailService: MasterdetailService, private editService: EditService) {
    super();
  }

  ngOnInit(): void {
    this.masterdetailService.item$
      .pipe(takeUntil(this.destroy$))
      .subscribe((item) => {
        if (this.detailLayout && item) {
          this.layout$.next(this.detailLayout);
          this.editService.setMode(EditModes.VIEW);
          this.editService.setItem(item);
        }
      });
  }

}
