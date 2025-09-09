import { AutocompleteCreator, LookupCreator, LookupDescriptor, PickvalueCreator } from "@ballware/meta-services";

export interface LookupState {

    state: 'init' | 'loading' | 'loaded';

    identifier?: string;
    lookups?: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>;
}
