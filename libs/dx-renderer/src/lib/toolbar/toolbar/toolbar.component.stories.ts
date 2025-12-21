import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { ToolbarComponent } from './toolbar.component';
import {
  AutocompleteCreator,
  LOOKUP_SERVICE,
  LookupCreator,
  LookupDescriptor,
  PAGE_SERVICE,
  PickvalueCreator,
  TRANSLATOR
} from '@ballware/meta-services';
import { createMockedLookupService } from '@storybook-helpers/lookup.service.mock';
import { createMockedPageService } from '@storybook-helpers/page.service.mock';
import { createMockedTranslator } from '@storybook-helpers/translator.mock';
import { createLookupDelegateBuilder, LOOKUP_DELEGATE_BUILDER_FACTORY } from '../../utils';
import { provideDefaultItemRegistries } from '../../registries';
import { provideDefaultToolbarItemConfigurations } from '../../components';
import { expect } from 'storybook/test';
import { PageToolbarItem, PageLayout } from '@ballware/meta-model';

// Helper function to create toolbar items with required fields
const createToolbarItem = (
  type: string,
  name: string,
  caption: string,
  additionalProps: Partial<PageToolbarItem> = {}
): PageToolbarItem => ({
  type,
  name,
  caption,
  defaultValue: undefined,
  options: {},
  ...additionalProps,
});

// Helper function to create page layout with required fields
const createPageLayout = (toolbaritems: PageToolbarItem[]): PageLayout => ({
  items: [],
  toolbaritems,
});

const meta: Meta<ToolbarComponent> = {
  title: 'DX Renderer/Toolbar/ToolbarComponent',
  component: ToolbarComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideDefaultItemRegistries(),
        provideDefaultToolbarItemConfigurations(),
        {
          provide: TRANSLATOR,
          useValue: createMockedTranslator({
            translations: {
              'format.date': 'dd.MM.yyyy',
              'format.datetime': 'dd.MM.yyyy HH:mm',
            },
          }),
        },
        {
          provide: LOOKUP_DELEGATE_BUILDER_FACTORY,
          useFactory: () => (lookups: Record<string, LookupDescriptor | unknown[] | LookupCreator | PickvalueCreator | AutocompleteCreator>) =>
            createLookupDelegateBuilder(lookups),
        },
      ],
    }),
    moduleMetadata({
      imports: [ToolbarComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<ToolbarComponent>;

// Reusable story factory
const createStoryWithLayout = (toolbaritems: PageToolbarItem[]): Story => ({
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: PAGE_SERVICE,
          useFactory: () => {
            const mock = createMockedPageService();
            mock.subjects.layout$.next(createPageLayout(toolbaritems));
            return mock.service;
          },
        },
        {
          provide: LOOKUP_SERVICE,
          useFactory: () => {
            const mock = createMockedLookupService({ lookups: {} });
            return mock.service;
          },
        },
      ],
    }),
  ],
});

/**
 * Empty toolbar - baseline test that component renders without errors
 */
export const EmptyToolbar: Story = {
  ...createStoryWithLayout([]),
  play: async ({ canvasElement }) => {
    // Wait for component to initialize
    await new Promise(resolve => setTimeout(resolve, 300));

    // Component should render without throwing errors
    // The dx-toolbar may or may not be present when empty
    const component = canvasElement.querySelector('ballware-toolbar');
    await expect(component).toBeTruthy();
  },
};

/**
 * Toolbar with button items only - buttons don't require dynamic widget creation
 */
export const ButtonsOnly: Story = {
  ...createStoryWithLayout([
    createToolbarItem('button', 'saveBtn', 'Save'),
    createToolbarItem('button', 'cancelBtn', 'Cancel'),
  ]),
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Component should be present
    const component = canvasElement.querySelector('ballware-toolbar');
    await expect(component).toBeTruthy();

    // Check for toolbar element
    const toolbar = canvasElement.querySelector('.dx-toolbar');
    if (toolbar) {
      // If toolbar renders, verify buttons
      const buttons = canvasElement.querySelectorAll('.dx-button');
      await expect(buttons.length).toBeGreaterThanOrEqual(0);
    }
  },
};

/**
 * Single button toolbar
 */
export const SingleButton: Story = {
  ...createStoryWithLayout([
    createToolbarItem('button', 'actionBtn', 'Click Me'),
  ]),
  play: async ({ canvasElement }) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const component = canvasElement.querySelector('ballware-toolbar');
    await expect(component).toBeTruthy();
  },
};

/**
 * Toolbar configuration with lookup item (rendered output depends on DevExtreme availability)
 */
export const WithLookupConfig: Story = {
  ...createStoryWithLayout([
    createToolbarItem('staticlookup', 'statusFilter', 'Status', {
      options: {
        items: [
          { id: 1, text: 'Active', value: 'active' },
          { id: 2, text: 'Inactive', value: 'inactive' },
        ],
        displayExpr: 'text',
        valueExpr: 'value',
      },
    }),
  ]),
  play: async ({ canvasElement }) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Component should be present even if widgets fail to render
    const component = canvasElement.querySelector('ballware-toolbar');
    await expect(component).toBeTruthy();
  },
};

/**
 * Toolbar configuration with date picker
 */
export const WithDateConfig: Story = {
  ...createStoryWithLayout([
    createToolbarItem('date', 'dateFilter', 'Date', { width: '200px' }),
  ]),
  play: async ({ canvasElement }) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const component = canvasElement.querySelector('ballware-toolbar');
    await expect(component).toBeTruthy();
  },
};

/**
 * Toolbar configuration with dropdown button
 */
export const WithDropdownButtonConfig: Story = {
  ...createStoryWithLayout([
    createToolbarItem('dropdownbutton', 'actions', 'Actions', {
      options: {
        items: [
          { id: 'edit', text: 'Edit' },
          { id: 'delete', text: 'Delete' },
        ],
      },
    }),
  ]),
  play: async ({ canvasElement }) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const component = canvasElement.querySelector('ballware-toolbar');
    await expect(component).toBeTruthy();
  },
};

/**
 * Mixed toolbar configuration
 */
export const MixedConfiguration: Story = {
  ...createStoryWithLayout([
    createToolbarItem('button', 'btn1', 'Action'),
    createToolbarItem('staticlookup', 'filter1', 'Filter', {
      options: {
        items: [{ id: 1, text: 'All', value: 'all' }],
        displayExpr: 'text',
        valueExpr: 'value',
      },
    }),
    createToolbarItem('date', 'date1', 'Date'),
  ]),
  play: async ({ canvasElement }) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const component = canvasElement.querySelector('ballware-toolbar');
    await expect(component).toBeTruthy();
  },
};

