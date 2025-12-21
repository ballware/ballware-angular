import { PageService } from '@ballware/meta-services';
import { Mock, It } from 'moq.ts';
import { BehaviorSubject } from 'rxjs';
import { fn } from 'storybook/test';
import { CompiledPageData, PageLayout, QueryParams } from '@ballware/meta-model';

/**
 * Creates a mocked PageService for Storybook stories
 * Uses moq.ts for mocking and storybook's fn() for spy functions
 */
export const createMockedPageService = (options?: {
  layout?: PageLayout;
  page?: CompiledPageData;
  title?: string;
  customParam?: Record<string, unknown>;
  headParams?: QueryParams;
}) => {
  const initialized$ = new BehaviorSubject<boolean>(true);
  const page$ = new BehaviorSubject<CompiledPageData | undefined>(options?.page);
  const title$ = new BehaviorSubject<string | undefined>(options?.title);
  const layout$ = new BehaviorSubject<PageLayout | undefined>(options?.layout);
  const customParam$ = new BehaviorSubject<Record<string, unknown> | undefined>(options?.customParam);
  const headParams$ = new BehaviorSubject<QueryParams | undefined>(options?.headParams);

  // Create spy functions using storybook's fn()
  const setPageUrl = fn();
  const setPageQuery = fn();
  const loadData = fn();
  const paramEditorInitialized = fn();
  const paramEditorDestroyed = fn();
  const paramEditorValueChanged = fn();
  const paramEditorEvent = fn();

  // Create the PageService mock
  const mock = new Mock<PageService>()
    .setup(instance => instance.initialized$).returns(initialized$)
    .setup(instance => instance.page$).returns(page$)
    .setup(instance => instance.title$).returns(title$)
    .setup(instance => instance.layout$).returns(layout$)
    .setup(instance => instance.customParam$).returns(customParam$)
    .setup(instance => instance.headParams$).returns(headParams$)
    .setup(instance => instance.setPageUrl(It.IsAny())).callback(({ args: [url] }) => {
      setPageUrl(url);
    })
    .setup(instance => instance.setPageQuery(It.IsAny())).callback(({ args: [query] }) => {
      setPageQuery(query);
    })
    .setup(instance => instance.loadData(It.IsAny())).callback(({ args: [params] }) => {
      loadData(params);
    })
    .setup(instance => instance.paramEditorInitialized(It.IsAny())).callback(({ args: [editor] }) => {
      paramEditorInitialized(editor);
    })
    .setup(instance => instance.paramEditorDestroyed(It.IsAny())).callback(({ args: [name] }) => {
      paramEditorDestroyed(name);
    })
    .setup(instance => instance.paramEditorValueChanged(It.IsAny())).callback(({ args: [editor] }) => {
      paramEditorValueChanged(editor);
    })
    .setup(instance => instance.paramEditorEvent(It.IsAny())).callback(({ args: [editor] }) => {
      paramEditorEvent(editor);
    });

  return {
    mock,
    service: mock.object(),
    // Expose the subjects for manipulation in stories
    subjects: {
      initialized$,
      page$,
      title$,
      layout$,
      customParam$,
      headParams$,
    },
    // Expose the spy functions for assertions in tests
    spies: {
      setPageUrl,
      setPageQuery,
      loadData,
      paramEditorInitialized,
      paramEditorDestroyed,
      paramEditorValueChanged,
      paramEditorEvent,
    },
  };
};

/**
 * Simplified version for basic use cases - creates empty page service mock
 */
export const createSimplePageServiceMock = createMockedPageService;

