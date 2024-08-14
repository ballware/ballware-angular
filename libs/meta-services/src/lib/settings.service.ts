import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export interface SettingsService {

    version$: Observable<string|undefined>;
    googlekey$: Observable<string|undefined>;

    initialize(version: string, googlekey: string): void;
}
  
export const SETTINGS_SERVICE = new InjectionToken<SettingsService>('Setting service');