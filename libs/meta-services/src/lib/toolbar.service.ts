import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export interface ToolbarService {

    title$: Observable<string|undefined>;    
    documentationIdentifier$: Observable<string|undefined>;    
    documentation$: Observable<unknown|undefined>;

    setPage(title: string, documentationIdentifier?: string): void;
    showDocumentation(): void;
    hideDocumentation(): void;
}

export const TOOLBAR_SERVICE = new InjectionToken<ToolbarService>('Toolbar service');