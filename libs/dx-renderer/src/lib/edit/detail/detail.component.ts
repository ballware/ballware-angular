import {
  Component,
  DestroyRef,
  forwardRef,
  Inject,
  Input,
  OnInit,
  Provider,
} from '@angular/core';
import { DetailLayout } from '@ballware/meta-model';
import { EDIT_SERVICE, EDIT_SERVICE_FACTORY, EditModes, EditService, EditServiceFactory, MasterdetailService, META_SERVICE, MetaService } from '@ballware/meta-services';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { EditLayoutContainerComponent } from '../layout/container.component';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
export class EditDetailComponent implements OnInit {

  @Input() detailLayout!: DetailLayout;

  public layout$ = new BehaviorSubject<DetailLayout|undefined>(undefined);

  constructor(
    private destroy: DestroyRef,
    private masterdetailService: MasterdetailService,
    @Inject(EDIT_SERVICE) private editService: EditService) {
  }

  ngOnInit(): void {
    combineLatest([this.masterdetailService.item$, this.masterdetailService.entity$]).pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe(([item, entity]) => {
      if (this.detailLayout && item && entity) {
        this.layout$.next(this.detailLayout);
        this.editService.setMode(EditModes.VIEW);
        this.editService.setEntity(entity);
        this.editService.setItem(item);
      }
    });
  }

}
