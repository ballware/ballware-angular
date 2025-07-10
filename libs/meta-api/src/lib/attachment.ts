import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interface for owner specific attachments operations
 */
 export interface MetaAttachmentApi {
  /**
   * Query list of attachments by owner
   *
   * @returns Observable with list of attachment metadata belonging to owner
   */
  query: () => Observable<Array<Record<string, unknown>>>;

  /**
   * Upload new attachment
   *
   * @param file - Uploaded file
   * @returns Observable resolved when upload finished
   */
  upload: (file: File) => Observable<void>;

  /**
   * Fetch file url for display/download
   *
   * @param id - Unique id of attachment from metadata
   * @returns Observable with URL for download of file
   */
  open: (id: string) => Observable<string>;

  /**
   * Remove existing attachment
   *
   * @param id - Unique id of attachment from metadata
   * @returns Observable resolved when remove operation finished
   */
  remove: (id: string) => Observable<void>;
}

export type MetaAttachmentApiFactory = (tenant: string, entity: string, owner: string) => MetaAttachmentApi;

export const META_ATTACHMENT_API_FACTORY = new InjectionToken<MetaAttachmentApiFactory>("Meta attachment api factory");