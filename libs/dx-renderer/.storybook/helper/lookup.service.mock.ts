import { LookupService, LookupDescriptor, LookupCreator, AutocompleteCreator } from '@ballware/meta-services';
import { Mock, It } from 'moq.ts';
import { BehaviorSubject, of } from 'rxjs';

/**
 * Creates a mocked LookupService for Storybook stories
 * Uses moq.ts instead of jest for mocking
 */
export const createMockedLookupService = (options?: {
  lookups?: Record<string, LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>>;
}) => {
  const lookups$ = new BehaviorSubject<Record<
    string,
    LookupDescriptor | LookupCreator | AutocompleteCreator | Array<unknown>
  > | undefined>(options?.lookups ?? {});

  // Create a mock function for getGenericLookupByIdentifier
  const getGenericLookupByIdentifier = (
    identifier: string,
    valueExpr: string,
    displayExpr: string
  ): LookupDescriptor => {
    return {
      type: 'lookup',
      displayMember: displayExpr,
      valueMember: valueExpr,
      store: {
        listFunc: () => of([]),
        byIdFunc: (id: string) => of({}),
      },
    };
  };

  const getGenericLookupByIdentifier$ = new BehaviorSubject(getGenericLookupByIdentifier);

  // Create the LookupService mock
  const mock = new Mock<LookupService>()
    .setup(instance => instance.lookups$).returns(lookups$)
    .setup(instance => instance.getGenericLookupByIdentifier$).returns(getGenericLookupByIdentifier$)
    .setup(instance => instance.setIdentifier(It.IsAny())).returns(undefined)
    .setup(instance => instance.requestLookups(It.IsAny())).returns(undefined)
    .setup(instance => instance.ngOnDestroy()).returns(undefined);

  return {
    mock,
    service: mock.object(),
    // Expose the subjects for manipulation in stories
    subjects: {
      lookups$,
      getGenericLookupByIdentifier$,
    },
    // Expose the function for custom behavior if needed
    functions: {
      getGenericLookupByIdentifier,
    },
  };
};

/**
 * Simplified version for basic use cases
 */
export const createSimpleLookupServiceMock = () => {
  return createMockedLookupService({
    lookups: {},
  });
};

/**
 * Helper function to create a simple lookup descriptor
 */
export const createLookupDescriptor = (
  identifier: string,
  data: Array<Record<string, unknown>>,
  valueMember = 'value',
  displayMember = 'display'
): LookupDescriptor => {
  return {
    type: 'lookup',
    displayMember,
    valueMember,
    store: {
      listFunc: () => of(data),
      byIdFunc: (id: string) => {
        const item = data.find((d) => d[valueMember] === id);
        return of(item ?? {});
      },
    },
  };
};

/**
 * Helper function to create a lookup creator
 */
export const createLookupCreator = (
  createFn: (param: string | string[]) => LookupDescriptor
): LookupCreator => {
  return createFn;
};

/**
 * Example usage with predefined lookups
 */
export const createMockedLookupServiceWithData = () => {
  return createMockedLookupService({
    lookups: {
      'status': createLookupDescriptor('status', [
        { value: 1, display: 'Active' },
        { value: 2, display: 'Inactive' },
        { value: 3, display: 'Pending' },
      ]),
      'priority': createLookupDescriptor('priority', [
        { value: 'low', display: 'Low' },
        { value: 'medium', display: 'Medium' },
        { value: 'high', display: 'High' },
      ]),
    },
  });
};

