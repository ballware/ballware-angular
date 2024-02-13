import { AutocompleteCreator, LookupCreator, LookupDescriptor } from "../lookup.service";

export interface LookupState {

    identifier?: string;

    lookups?: Record<string, LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>>;
}