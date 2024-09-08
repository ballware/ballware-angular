import { AutocompleteCreator, LookupCreator, LookupDescriptor, LookupService } from '@ballware/meta-services';
import { Mock } from 'moq.ts';
import { BehaviorSubject } from 'rxjs';

export const mockedLookupServiceContext = () => {

    // Lookups
    const lookups$ = new BehaviorSubject<Record<string,
            LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>
        >|undefined>(undefined);

    return {
        lookups$,

        mock: new Mock<LookupService>()
            .setup(instance => instance.lookups$).returns(lookups$)            
    };
}

describe('mockedLookupServiceContext', () => {
    it('should be ignored', () => {});
});