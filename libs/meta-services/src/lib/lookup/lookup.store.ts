import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { LookupState } from "./lookup.state";
import { AutocompleteCreator, LookupCreator, LookupDescriptor } from "../lookup.service";

@Injectable()
export class LookupStore extends ComponentStore<LookupState> {
    constructor() {
        super({});
    }

    readonly lookups$ = this.select(state => state.lookups);

    readonly updateLookups =
        this.updater((state, lookups: Record<string, LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>>|undefined) => ({
            ...state,
            lookups
        }));    
}