import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { DxFileUploaderModule, DxPopupModule } from 'devextreme-angular';

import { WithDestroy } from '@ballware/angular-utils';
import { ResponsiveService } from '@ballware/common-services';
import { Observable, takeUntil } from 'rxjs';

export interface FileUploadEvent {
  file: File;
}

@Component({
  selector: 'lib-ballware-commons-upload-dialog',
  standalone: true,
  imports: [CommonModule, DxPopupModule, DxFileUploaderModule],
  templateUrl: './upload-dialog.component.html',
  styleUrl: './upload-dialog.component.css',
})
export class BallwareUploadDialogComponent extends WithDestroy() {

  @Input()
  public title!: string;

  @Input()
  public multiple = false;

  @Input()
  public visible = false;

  @Input()
  public hideAfterUpload = true;

  @Output()
  public visibleChange = new EventEmitter<boolean>();

  @Output()
  public fileUploaded = new EventEmitter<FileUploadEvent>();

  fullscreenDialogs$: Observable<boolean>;

  constructor(responsiveService: ResponsiveService) {
    super();
    
    this.fullscreenDialogs$ = responsiveService.small$
      .pipe(takeUntil(this.destroy$));
  }

  readonly onFileUploaded = (file: File) => {
    this.fileUploaded.emit({ file });

    if (this.hideAfterUpload) {
      this.visibleChange.emit(false);
    }
  }

  readonly onClose = () => {
    this.visibleChange.emit(false);
  }
}
