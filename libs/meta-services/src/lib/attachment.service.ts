import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface AttachmentRemoveDialog {
  fileName: string,   
  apply: (fileName: string) => void, 
  cancel: () => void    
}

export interface AttachmentServiceApi {
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

@Injectable()
export abstract class AttachmentService implements AttachmentServiceApi {
  
  public abstract ngOnDestroy(): void;

  public abstract owner$: Observable<string|undefined>;
  public abstract items$: Observable<Record<string, unknown>[]|undefined>;

  public abstract removeDialog$: Observable<AttachmentRemoveDialog | undefined>;

  public abstract setIdentifier(identifier: string): void;
  public abstract setOwner(identifier: string): void;

  public abstract fetch(): void;
  public abstract upload(file: File): void;
  public abstract open(fileName: string): void;
  public abstract remove(fileName: string): void;
  public abstract drop(fileName: string): void;
}
