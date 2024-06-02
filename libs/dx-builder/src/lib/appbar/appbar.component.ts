import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

import { DxToolbarModule } from 'devextreme-angular';

import { TemplateService } from '@ballware/builder-services';
import { BallwareUploadDialogComponent, FileUploadEvent } from '@ballware/dx-commons';

@Component({
  selector: 'lib-builder-appbar',
  standalone: true,
  imports: [CommonModule, DxToolbarModule, BallwareUploadDialogComponent],
  templateUrl: './appbar.component.html',
  styleUrl: './appbar.component.css',
})
export class AppbarComponent {

  @Output()
  public menuToggled = new EventEmitter();

  uploadVisible = false;

  constructor(private _templateService: TemplateService) {}

  readonly clickToggleMenu = () => {
    this.menuToggled.emit();
  }

  readonly clickNew = () => {
    this._templateService.create();
  }

  readonly clickOpen = () => {
    this.uploadVisible = true;
  }

  readonly clickDownload = () => {
    this._templateService.download();
  }

  readonly clickClose = () => {
    this._templateService.close();
  }

  readonly templateUploaded = ({ file }: FileUploadEvent) => {
    this._templateService.open(file);
  }
}
