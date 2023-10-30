import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';

/**
 * Interface for owner specific attachments operations
 */
 export interface MetaAttachmentApi {
  /**
   * Query list of attachments by owner
   *
   * @param owner - Identifier for owner
   * @returns Observable with list of attachment metadata belonging to owner
   */
  queryByOwner: (    
    owner: string
  ) => Observable<Array<Record<string, unknown>>>;

  /**
   * Upload new attachment
   *
   * @param owner - Identifier for owner
   * @param file - Uploaded file
   * @returns Observable resolved when upload finished
   */
  upload: (owner: string, file: File) => Observable<void>;

  /**
   * Fetch file url for display/download
   *
   * @param owner - Identifier for owner
   * @param fileName - File name from metadata
   * @returns Observable with URL for download of file
   */
  open: (owner: string, fileName: string) => Observable<string>;

  /**
   * Remove existing attachment
   *
   * @param owner - Identifier for owner
   * @param fileName - File name from metadata
   * @returns Observable resolved when remove operation finished
   */
  remove: (owner: string, fileName: string) => Observable<void>;
}

/**
 * Create adapter for attachment data operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export abstract class MetaAttachmentApiService implements MetaAttachmentApi {  
  abstract queryByOwner(    
    owner: string
  ): Observable<Array<Record<string, unknown>>>;

  abstract upload(owner: string, file: File): Observable<void>;
  abstract open(owner: string, fileName: string): Observable<string>;
  abstract remove(owner: string, fileName: string): Observable<void>;
}
