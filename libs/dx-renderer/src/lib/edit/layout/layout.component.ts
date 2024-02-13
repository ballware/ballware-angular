import { Component, OnDestroy } from '@angular/core';
import dxValidationGroup, { InitializedEvent } from 'devextreme/ui/validation_group';
import { Observable } from 'rxjs';
import { EditLayout } from '@ballware/meta-model';
import { EditService } from '@ballware/meta-services';

@Component({
  selector: 'ballware-edit-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class EditLayoutComponent implements OnDestroy {

  public layout$: Observable<EditLayout|undefined>;

  constructor(private editService: EditService) {
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
