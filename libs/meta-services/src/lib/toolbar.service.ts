import { Observable } from "rxjs";
import { WithDestroy } from "./withdestroy";

export abstract class ToolbarService extends WithDestroy() {

    public abstract title$: Observable<string|undefined>;    
    public abstract documentationIdentifier$: Observable<string|undefined>;    
    public abstract documentation$: Observable<unknown|undefined>;

    public abstract setPage(title: string, documentationIdentifier?: string): void;
    public abstract showDocumentation(): void;
    public abstract hideDocumentation(): void;
}