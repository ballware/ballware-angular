import { InjectionToken } from '@angular/core';

export interface RuntimeEnv {
  BALLWARE_DEVEXTREMEKEY: string;
  BALLWARE_IDENTITYURL: string;
  BALLWARE_METAURL: string;
  BALLWARE_DOCUMENTURL: string;
  BALLWARE_TENANTURL: string;
  BALLWARE_MLURL: string;
  BALLWARE_STORAGEURL: string;
  BALLWARE_GENERICURL: string;
  BALLWARE_DOCUMENT_SIGNON_URL: string;
  BALLWARE_DOCUMENT_DESIGNER_URL: string;
  BALLWARE_DOCUMENT_VIEWER_URL: string;
}

export const ENV = new InjectionToken<RuntimeEnv>('ENV');
