import { Injectable } from "@angular/core";
import { LookupService } from "../lookup.service";
import { LookupStore } from "./lookup.store";

@Injectable()
export class LookupServiceProxy extends LookupService {

    constructor(private lookupStore: LookupStore) {
      super();
    }

    public override lookups$ = this.lookupStore.lookups$;
    public override getGenericLookupByIdentifier$ = this.lookupStore.getGenericLookupByIdentifier$;
    public override requestLookups = this.lookupStore.requestLookups;
}