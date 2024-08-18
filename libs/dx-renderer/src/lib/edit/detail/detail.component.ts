import { Component, forwardRef, Inject, Input, OnInit, Provider } from '@angular/core';
import { DetailLayout } from '@ballware/meta-model';
import { EDIT_SERVICE, EDIT_SERVICE_FACTORY, EditModes, EditService, EditServiceFactory, MasterdetailService, META_SERVICE, MetaService } from '@ballware/meta-services';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { EditLayoutContainerComponent } from '../layout/container.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ballware-edit-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  providers: [
    {
      provide: EDIT_SERVICE,
      useFactory: (serviceFactory: EditServiceFactory, metaService: MetaService) => serviceFactory(metaService),
      deps: [EDIT_SERVICE_FACTORY, META_SERVICE]
    } as Provider
  ],
  imports: [CommonModule, forwardRef(() => EditLayoutContainerComponent)],
  standalone: true
})
export class EditDetailComponent extends WithDestroy() implements OnInit {

  @Input() detailLayout!: DetailLayout;

  public layout$ = new BehaviorSubject<DetailLayout|undefined>(undefined);

  constructor(private masterdetailService: MasterdetailService, @Inject(EDIT_SERVICE) private editService: EditService) {
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
