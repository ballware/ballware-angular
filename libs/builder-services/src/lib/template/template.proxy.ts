import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { TemplateService } from "../template.service";
import { templateClose, templateCreate, templateDownload, templateOpen } from "./template.actions";
import { selectName } from "./template.state";

@Injectable()
export class TemplateServiceProxy extends TemplateService {

    constructor(private store: Store) {
        super();
    }
    
    public get name$() {
        return this.store.select(selectName);
    }

    public override create(): void {
        this.store.dispatch(templateCreate());
    }

    public override open(file: File): void {
        this.store.dispatch(templateOpen({ file }));
    }

    public override download(): void {
        this.store.dispatch(templateDownload());
    }

    public override close(): void {
        this.store.dispatch(templateClose());
    }
}