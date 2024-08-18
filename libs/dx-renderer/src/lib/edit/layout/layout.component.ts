import { Component, forwardRef, Inject, OnDestroy } from '@angular/core';
import { InitializedEvent } from 'devextreme/ui/validation_group';
import { Observable } from 'rxjs';
import { EditLayout } from '@ballware/meta-model';
import { EDIT_SERVICE, EditService } from '@ballware/meta-services';
import { DxScrollViewModule, DxValidationGroupModule, DxValidationSummaryModule } from 'devextreme-angular';
import { EditLayoutContainerComponent } from './container.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ballware-edit-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [CommonModule, DxValidationGroupModule, DxValidationSummaryModule, DxScrollViewModule, forwardRef(() => EditLayoutContainerComponent)],
  standalone: true
})
export class EditLayoutComponent implements OnDestroy {

  public layout$: Observable<EditLayout|undefined>;

  constructor(@Inject(EDIT_SERVICE) private editService: EditService) {
    this.layout$ = editService.editLayout$;
  }

  ngOnDestroy(): void {
      this.editService.setValidator(undefined);
  }

  onValidationGroupInitialized(e: InitializedEvent) {
    e.component?.validate();

    this.editService.setValidator(() => {
      const validationResult = e.component?.validate();

      return validationResult ? (validationResult.isValid ?? false) : false;
    });
  }
}
