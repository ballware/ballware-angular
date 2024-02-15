import { Component, Input, OnInit, Provider } from '@angular/core';
import { DetailLayout } from '@ballware/meta-model';
import { EditModes, EditService, MasterdetailService, MetaService, MetaServiceFactory } from '@ballware/meta-services';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-edit-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  providers: [
    {
      provide: EditService,
      useFactory: (serviceFactory: MetaServiceFactory, metaService: MetaService) => serviceFactory.createEditService(metaService),
      deps: [MetaServiceFactory, MetaService]
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
