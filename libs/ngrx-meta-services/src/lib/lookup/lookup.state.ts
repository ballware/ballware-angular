import { AutocompleteCreator, LookupCreator, LookupDescriptor, PickvalueCreator } from "@ballware/meta-services";

export interface LookupState {

    identifier?: string;

    lookups?: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>;
}