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
import { createMockedLookupService, createLookupDescriptor } from '@storybook-helpers/lookup.service.mock';
import { createMockedPageService } from '@storybook-helpers/page.service.mock';
import { createMockedTranslator } from '@storybook-helpers/translator.mock';
import { createLookupDelegateBuilder, LOOKUP_DELEGATE_BUILDER_FACTORY } from '../../utils';
import { provideDefaultItemRegistries } from '../../registries';
import { provideDefaultToolbarItemConfigurations } from '../../components';
import { expect, userEvent, waitFor } from 'storybook/test';
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

// Create the mock services outside the meta to allow story-level access
const createMocks = () => {
  const pageServiceMock = createMockedPageService();
  const lookupServiceMock = createMockedLookupService({
    lookups: {
      test: createLookupDescriptor('test', [
        { value: '1', display: 'Option 1' },
        { value: '2', display: 'Option 2' },
        { value: '3', display: 'Option 3' },
      ]),
      multi: createLookupDescriptor('multi', [
        { value: 'm1', display: 'Multi 1' },
        { value: 'm2', display: 'Multi 2' },
        { value: 'm3', display: 'Multi 3' },
      ]),
    },
  });
  return { pageServiceMock, lookupServiceMock };
};

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

/**
 * Default lookup toolbar item with SelectBox widget
 */
export const LookupSelectBox: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('lookup', 'testLookup', 'Test Lookup', { lookup: 'test', width: '300px' }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    // Wait for toolbar to render
    await waitFor(() => {
      const toolbar = canvasElement.querySelector('.dx-toolbar');
      expect(toolbar).toBeTruthy();
    }, { timeout: 2000 });

    // Check for SelectBox presence
    const selectBox = canvasElement.querySelector('.dx-selectbox');
    await expect(selectBox).toBeTruthy();

    // Check for label
    const label = canvasElement.querySelector('.dx-texteditor-label');
    await expect(label).toBeTruthy();
  },
};

/**
 * Static lookup toolbar item with predefined items
 */
export const StaticLookupSelectBox: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('staticlookup', 'staticLookup', 'Static Lookup', {
            options: {
              items: [
                { id: 1, text: 'Static One', value: '1' },
                { id: 2, text: 'Static Two', value: '2' },
                { id: 3, text: 'Static Three', value: '3' },
              ],
              displayExpr: 'text',
              valueExpr: 'value',
            },
          }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const selectBox = canvasElement.querySelector('.dx-selectbox');
      expect(selectBox).toBeTruthy();
    }, { timeout: 2000 });

    // Verify the selectbox is a dropdown with clear button
    const clearButton = canvasElement.querySelector('.dx-clear-button-area');
    await expect(clearButton).toBeTruthy();
  },
};

/**
 * Multi-select lookup toolbar item with TagBox widget
 */
export const MultiLookupTagBox: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('multilookup', 'multiLookup', 'Multi Lookup', { lookup: 'multi', width: '400px' }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const tagBox = canvasElement.querySelector('.dx-tagbox');
      expect(tagBox).toBeTruthy();
    }, { timeout: 2000 });

    // TagBox should have tag container
    const tagContainer = canvasElement.querySelector('.dx-tag-container');
    await expect(tagContainer).toBeTruthy();
  },
};

/**
 * Static multi-select lookup toolbar item
 */
export const StaticMultiLookupTagBox: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('staticmultilookup', 'staticMultiLookup', 'Static Multi Lookup', {
            options: {
              items: [
                { id: 1, text: 'Choice A', value: 'a' },
                { id: 2, text: 'Choice B', value: 'b' },
                { id: 3, text: 'Choice C', value: 'c' },
              ],
              displayExpr: 'text',
              valueExpr: 'value',
            },
          }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const tagBox = canvasElement.querySelector('.dx-tagbox');
      expect(tagBox).toBeTruthy();
    }, { timeout: 2000 });
  },
};

/**
 * Date picker toolbar item
 */
export const DateBox: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('date', 'dateFilter', 'Date', { width: '200px' }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const dateBox = canvasElement.querySelector('.dx-datebox');
      expect(dateBox).toBeTruthy();
    }, { timeout: 2000 });

    // Check for calendar button
    const dropdownButton = canvasElement.querySelector('.dx-dropdowneditor-button');
    await expect(dropdownButton).toBeTruthy();
  },
};

/**
 * DateTime picker toolbar item
 */
export const DateTimeBox: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('datetime', 'datetimeFilter', 'DateTime', { width: '220px' }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const dateBox = canvasElement.querySelector('.dx-datebox');
      expect(dateBox).toBeTruthy();
    }, { timeout: 2000 });
  },
};

/**
 * Button toolbar item
 */
export const ButtonItem: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('button', 'actionButton', 'Click Me'),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const button = canvasElement.querySelector('.dx-button');
      expect(button).toBeTruthy();
    }, { timeout: 2000 });

    // Button should have correct text
    const buttonText = canvasElement.querySelector('.dx-button-text');
    await expect(buttonText?.textContent).toContain('Click Me');

    // Click the button
    const button = canvasElement.querySelector('.dx-button') as HTMLElement;
    await userEvent.click(button);
  },
};

/**
 * Dropdown button toolbar item with split button functionality
 */
export const DropDownButton: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('dropdownbutton', 'actionMenu', 'Actions', {
            options: {
              items: [
                { id: 'action1', text: 'Action 1' },
                { id: 'action2', text: 'Action 2' },
                { id: 'action3', text: 'Action 3' },
              ],
            },
          }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const dropdownButton = canvasElement.querySelector('.dx-dropdownbutton');
      expect(dropdownButton).toBeTruthy();
    }, { timeout: 2000 });

    // Check for split button structure
    const mainButton = canvasElement.querySelector('.dx-button-has-text');
    await expect(mainButton).toBeTruthy();
  },
};

/**
 * Toolbar with all item types combined
 */
export const AllToolbarItems: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('lookup', 'lookup1', 'Lookup', { lookup: 'test', width: '200px' }),
          createToolbarItem('staticlookup', 'staticLookup1', 'Static', {
            width: '150px',
            options: {
              items: [{ id: 1, text: 'A', value: 'a' }],
              displayExpr: 'text',
              valueExpr: 'value',
            },
          }),
          createToolbarItem('multilookup', 'multi1', 'Multi', { lookup: 'multi', width: '200px' }),
          createToolbarItem('date', 'date1', 'Date', { width: '180px' }),
          createToolbarItem('datetime', 'datetime1', 'DateTime', { width: '200px' }),
          createToolbarItem('button', 'btn1', 'Button'),
          createToolbarItem('dropdownbutton', 'dropdown1', 'Menu', {
            options: {
              items: [{ id: 'opt1', text: 'Option 1' }],
            },
          }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const toolbar = canvasElement.querySelector('.dx-toolbar');
      expect(toolbar).toBeTruthy();
    }, { timeout: 2000 });

    // Verify all item types are rendered
    await waitFor(() => {
      const selectBoxes = canvasElement.querySelectorAll('.dx-selectbox');
      expect(selectBoxes.length).toBeGreaterThanOrEqual(2); // lookup + staticlookup
    });

    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    const dateBoxes = canvasElement.querySelectorAll('.dx-datebox');
    await expect(dateBoxes.length).toBe(2); // date + datetime

    const button = canvasElement.querySelector('.dx-button');
    await expect(button).toBeTruthy();

    const dropdownButton = canvasElement.querySelector('.dx-dropdownbutton');
    await expect(dropdownButton).toBeTruthy();
  },
};

/**
 * Empty toolbar with no items
 */
export const EmptyToolbar: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    // Wait for component to initialize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Empty toolbar may not render the dx-toolbar element or it may be empty
    const toolbarItems = canvasElement.querySelectorAll('.dx-toolbar-item');
    await expect(toolbarItems.length).toBe(0);
  },
};

/**
 * Lookup with value change interaction test
 */
export const LookupWithValueChange: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('staticlookup', 'interactiveLookup', 'Select Value', {
            width: '300px',
            options: {
              items: [
                { id: 1, text: 'First Option', value: 'first' },
                { id: 2, text: 'Second Option', value: 'second' },
                { id: 3, text: 'Third Option', value: 'third' },
              ],
              displayExpr: 'text',
              valueExpr: 'value',
            },
          }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const selectBox = canvasElement.querySelector('.dx-selectbox');
      expect(selectBox).toBeTruthy();
    }, { timeout: 2000 });

    // Open the dropdown
    const dropdownButton = canvasElement.querySelector('.dx-dropdowneditor-button') as HTMLElement;
    if (dropdownButton) {
      await userEvent.click(dropdownButton);

      // Wait for popup to open
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  },
};

/**
 * Button click interaction test
 */
export const ButtonClickInteraction: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('button', 'testButton', 'Test Click'),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const button = canvasElement.querySelector('.dx-button');
      expect(button).toBeTruthy();
    }, { timeout: 2000 });

    // Click the button multiple times
    const button = canvasElement.querySelector('.dx-button') as HTMLElement;
    await userEvent.click(button);
    await new Promise(resolve => setTimeout(resolve, 100));
    await userEvent.click(button);

    // Verify button is still functional
    await expect(button).not.toHaveAttribute('disabled');
  },
};

/**
 * Date picker interaction test
 */
export const DatePickerInteraction: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('date', 'interactiveDate', 'Pick a Date', { width: '220px' }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const dateBox = canvasElement.querySelector('.dx-datebox');
      expect(dateBox).toBeTruthy();
    }, { timeout: 2000 });

    // Open the calendar
    const calendarButton = canvasElement.querySelector('.dx-dropdowneditor-button') as HTMLElement;
    if (calendarButton) {
      await userEvent.click(calendarButton);

      // Wait for calendar popup
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  },
};

/**
 * Multiple buttons in toolbar
 */
export const MultipleButtons: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('button', 'saveBtn', 'Save'),
          createToolbarItem('button', 'cancelBtn', 'Cancel'),
          createToolbarItem('button', 'deleteBtn', 'Delete'),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const toolbarItems = canvasElement.querySelectorAll('.dx-toolbar-item');
      expect(toolbarItems.length).toBe(3);
    }, { timeout: 2000 });

    // Verify each button text
    const buttonTexts = canvasElement.querySelectorAll('.dx-button-text');
    const texts = Array.from(buttonTexts).map(el => el.textContent);
    await expect(texts).toContain('Save');
    await expect(texts).toContain('Cancel');
    await expect(texts).toContain('Delete');
  },
};

/**
 * Dropdown button with item selection
 */
export const DropDownButtonInteraction: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('dropdownbutton', 'interactiveDropdown', 'Select Action', {
            width: '180px',
            options: {
              items: [
                { id: 'edit', text: 'Edit' },
                { id: 'delete', text: 'Delete' },
                { id: 'archive', text: 'Archive' },
              ],
            },
          }),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const dropdownButton = canvasElement.querySelector('.dx-dropdownbutton');
      expect(dropdownButton).toBeTruthy();
    }, { timeout: 2000 });

    // Click the dropdown arrow to open menu
    const toggleButton = canvasElement.querySelector('.dx-dropdownbutton-toggle') as HTMLElement;
    if (toggleButton) {
      await userEvent.click(toggleButton);

      // Wait for popup
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  },
};

/**
 * Custom width configurations
 */
export const CustomWidthItems: Story = {
  decorators: [
    applicationConfig({
      providers: (() => {
        const { pageServiceMock, lookupServiceMock } = createMocks();
        pageServiceMock.subjects.layout$.next(createPageLayout([
          createToolbarItem('lookup', 'narrowLookup', 'Narrow', { lookup: 'test', width: '150px' }),
          createToolbarItem('lookup', 'wideLookup', 'Wide', { lookup: 'test', width: '400px' }),
          createToolbarItem('button', 'autoButton', 'Auto Width'),
        ]));
        return [
          { provide: PAGE_SERVICE, useValue: pageServiceMock.service },
          { provide: LOOKUP_SERVICE, useValue: lookupServiceMock.service },
        ];
      })(),
    }),
  ],
  play: async ({ canvasElement }) => {
    await waitFor(() => {
      const toolbar = canvasElement.querySelector('.dx-toolbar');
      expect(toolbar).toBeTruthy();
    }, { timeout: 2000 });

    // Verify items are rendered
    const selectBoxes = canvasElement.querySelectorAll('.dx-selectbox');
    await expect(selectBoxes.length).toBe(2);
  },
};

