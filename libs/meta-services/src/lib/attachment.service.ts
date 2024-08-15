import { Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

export interface AttachmentRemoveDialog {
  fileName: string,   
  apply: (fileName: string) => void, 
  cancel: () => void    
}

export interface AttachmentService extends OnDestroy {
  owner$: Observable<string|undefined>;
  items$: Observable<Record<string, unknown>[]|undefined>;

  removeDialog$: Observable<AttachmentRemoveDialog|undefined>;

  setIdentifier(identifier: string): void;
  setOwner(identifier: string): void;

  fetch(): void;
  upload(file: File): void;  
  open(fileName: string): void;
  remove(fileName: string): void;
  drop(fileName: string): void;
}

export type AttachmentServiceFactory = () => AttachmentService;

export const ATTACHMENT_SERVICE = new InjectionToken<AttachmentService>('Attachment service');
export const ATTACHMENT_SERVICE_FACTORY = new InjectionToken<AttachmentServiceFactory>('Attachment service factory');