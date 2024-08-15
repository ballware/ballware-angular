import { AutocompleteCreator, LookupCreator, LookupDescriptor } from "@ballware/meta-services";

export interface LookupState {

    identifier?: string;

    lookups?: Record<string, LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>>;
}