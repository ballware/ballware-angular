import { Injectable, OnDestroy } from "@angular/core";
import { LookupService } from "../lookup.service";
import { LookupStore } from "./lookup.store";

@Injectable()
export class LookupServiceProxy extends LookupService implements OnDestroy {

    constructor(private lookupStore: LookupStore) {
      super();
    }

    ngOnDestroy(): void {
      this.lookupStore.ngOnDestroy();
    }

    public override setIdentifier = this.lookupStore.setIdentifier;

    public override lookups$ = this.lookupStore.lookups$;
    public override getGenericLookupByIdentifier$ = this.lookupStore.getGenericLookupByIdentifier$;
    public override requestLookups = this.lookupStore.requestLookups;
}