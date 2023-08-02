import { AutocompleteCreator, LookupCreator, LookupDescriptor } from "../lookup.service";

export interface LookupState {
    lookups?: Record<string, LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>>;
}