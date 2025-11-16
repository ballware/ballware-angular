import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface AttachmentRemoveDialog {
  fileName: string,
  apply: (fileName: string) => void,
  cancel: () => void
}

export interface AttachmentService {
  owner$: Observable<string|undefined>;
  items$: Observable<Record<string, unknown>[]|undefined>;

  removeDialog$: Observable<AttachmentRemoveDialog|undefined>;

  setIdentifier(identifier: string): void;
  setEntity(entity: string): void;
  setOwner(identifier: string): void;

  fetch(): void;
  upload(file: File): void;
  open(id: string): void;
  remove(request: { id: string, filename: string }): void;
  drop(id: string): void;
}

export type AttachmentServiceFactory = () => AttachmentService;

export const ATTACHMENT_SERVICE = new InjectionToken<AttachmentService>('Attachment service');
export const ATTACHMENT_SERVICE_FACTORY = new InjectionToken<AttachmentServiceFactory>('Attachment service factory');
