import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { EditLayoutMultilookupComponent } from './multilookup.component';
import { of } from 'rxjs';
import { EDIT_SERVICE, LOOKUP_SERVICE, NOTIFICATION_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { createMockedEditService } from '@storybook-helpers/edit.service.mock';
import { createMockedLookupService } from '@storybook-helpers/lookup.service.mock';
import { createMockedNotificationService } from '@storybook-helpers/notification.service.mock';
import { createSimpleTranslator } from '@storybook-helpers/translator.mock';
import { createArrayDatasource } from '../../utils';
import { expect, within, userEvent } from 'storybook/test';

const meta: Meta<EditLayoutMultilookupComponent> = {
  title: 'DX Renderer/Edit/Multilookup',
  component: EditLayoutMultilookupComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        {
          provide: TRANSLATOR,
          useValue: createSimpleTranslator()
        },
        {
          provide: NOTIFICATION_SERVICE,
          useValue: createMockedNotificationService().service
        },
        {
          provide: LOOKUP_SERVICE,
          useFactory: () => createMockedLookupService().service
        },
        {
          provide: EDIT_SERVICE,
          useFactory: () => createMockedEditService().service
        }
      ],
    }),
    moduleMetadata({
      imports: [EditLayoutMultilookupComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<EditLayoutMultilookupComponent>;

// Helper function to create a mock layout item
const createLayoutItem = (
  dataMember: string,
  caption: string,
  options: Record<string, unknown> = {}
) => ({
  type: 'multilookup',
  options: {
    dataMember,
    caption,
    ...options,
  },
});

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('multiLookup', 'Multi Lookup'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Option 1' },
          { id: 2, text: 'Option 2' },
          { id: 3, text: 'Option 3' },
          { id: 4, text: 'Option 4' },
          { id: 5, text: 'Option 5' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => item ? `Hint for ${item.text}` : '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Test: Label should contain correct text
    const label = canvas.getByText('Multi Lookup');
    await expect(label).toBeTruthy();
  },
};

export const WithPreselectedValues: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('categoriesMulti', 'Categories'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Electronics' },
          { id: 2, text: 'Books' },
          { id: 3, text: 'Clothing' },
          { id: 4, text: 'Food' },
          { id: 5, text: 'Sports' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [2, 4] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Wait a bit for the values to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: Selected tags should be displayed
    const tags = canvasElement.querySelectorAll('.dx-tag');
    await expect(tags.length).toBe(2);
  },
};

export const Readonly: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('tagsMulti', 'Tags (Readonly)'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Important' },
          { id: 2, text: 'Urgent' },
          { id: 3, text: 'Review' },
          { id: 4, text: 'Follow-up' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(true) },
      value: { value: [1, 3] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Test: TagBox or its input should be in readonly state
    const readonlyElement = canvasElement.querySelector('.dx-state-readonly');
    if (readonlyElement) {
      await expect(readonlyElement).toBeTruthy();
    } else {
      // Alternative: Check if input has readonly attribute
      const input = canvasElement.querySelector('.dx-texteditor-input') as HTMLInputElement;
      if (input) {
        await expect(input.readOnly || input.hasAttribute('readonly')).toBeTruthy();
      }
    }

    // Test: Selected tags should be displayed
    const tags = canvasElement.querySelectorAll('.dx-tag');
    await expect(tags.length).toBe(2);
  },
};

export const WithCustomValues: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('customTagsMulti', 'Custom Tags'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Tag1' },
          { id: 2, text: 'Tag2' },
          { id: 3, text: 'Tag3' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(true),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => {
          console.log('Custom item creating:', e);
          e.customItem = { id: Date.now(), text: e.text };
        }
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: TagBox should be visible and editable
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Test: Input should be present for custom values
    const input = canvasElement.querySelector('.dx-texteditor-input');
    await expect(input).toBeTruthy();
  },
};

export const WithHints: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('countriesMulti', 'Countries'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        hasLookupItemHint$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 'de', text: 'Germany', hint: 'Europe, EU Member' },
          { id: 'us', text: 'United States', hint: 'North America' },
          { id: 'jp', text: 'Japan', hint: 'Asia, G7 Member' },
          { id: 'br', text: 'Brazil', hint: 'South America' },
          { id: 'fr', text: 'France', hint: 'Europe, EU Member' },
          { id: 'uk', text: 'United Kingdom', hint: 'Europe' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => item ? item.hint : '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: ['de', 'fr'] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Wait for values to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: Open dropdown to check if hints are displayed
    const dropdownButton = canvasElement.querySelector('.dx-dropdowneditor-button');
    if (dropdownButton instanceof HTMLElement) {
      await userEvent.click(dropdownButton);

      // Wait for dropdown to open
      await new Promise(resolve => setTimeout(resolve, 300));

      // Test: Hints should be visible in dropdown items
      const hints = document.querySelectorAll('.dx-list-item small');
      await expect(hints.length).toBeGreaterThan(0);
    }
  },
};

export const WithGrouping: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('productsMulti', 'Products'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        grouped$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Laptop', category: 'Electronics' },
          { id: 2, text: 'Mouse', category: 'Electronics' },
          { id: 3, text: 'Keyboard', category: 'Electronics' },
          { id: 4, text: 'Novel', category: 'Books' },
          { id: 5, text: 'Textbook', category: 'Books' },
          { id: 6, text: 'T-Shirt', category: 'Clothing' },
          { id: 7, text: 'Jeans', category: 'Clothing' },
        ], { keyProperty: 'id', groupByProperty: 'category' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => item ? `Category: ${item.category}` : '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [1, 4] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Wait for values to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: Open dropdown to verify grouping
    const dropdownButton = canvasElement.querySelector('.dx-dropdowneditor-button');
    if (dropdownButton instanceof HTMLElement) {
      await userEvent.click(dropdownButton);

      // Wait for dropdown to open
      await new Promise(resolve => setTimeout(resolve, 300));

      // Test: Group headers should be visible in dropdown
      const groupHeaders = document.querySelectorAll('.dx-list-group-header');
      await expect(groupHeaders.length).toBeGreaterThan(0);
    }
  },
};

export const WithValidation: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('requiredMulti', 'Required Field'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Option A' },
          { id: 2, text: 'Option B' },
          { id: 3, text: 'Option C' },
          { id: 4, text: 'Option D' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [] },
      validation: {
        validationRules$: of([
          {
            type: 'required',
            message: 'At least one selection is required'
          }
        ])
      },
    },
  }),
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 300));

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Test: Input field should be present
    const input = canvasElement.querySelector('.dx-texteditor-input');
    await expect(input).toBeTruthy();
  },
};

export const Hidden: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('hiddenMulti', 'Hidden Multilookup'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Option 1' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(false) },
      readonly: { readonly$: of(false) },
      value: { value: [] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Test: TagBox should not be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');

    // The component might still exist in DOM but be hidden
    if (tagBox) {
      const isHidden = tagBox.getAttribute('style')?.includes('display: none') ||
                      tagBox.classList.contains('dx-state-invisible');
      await expect(isHidden).toBeTruthy();
    }
  },
};

export const LargeDataset: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('citiesMulti', 'Cities'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource(
          Array.from({ length: 100 }, (_, i) => ({
            id: i + 1,
            text: `City ${i + 1}`,
            country: i % 2 === 0 ? 'Germany' : 'Austria'
          })),
          { keyProperty: 'id' }
        )),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => item ? `Country: ${item.country}` : '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [10, 20, 30] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Wait for values to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: Search should be enabled
    const searchInput = canvasElement.querySelector('.dx-texteditor-input');
    await expect(searchInput).toBeTruthy();

    // Test: Selected tags should be visible
    const tags = canvasElement.querySelectorAll('.dx-tag');
    await expect(tags.length).toBe(3);
  },
};

export const InteractiveSelection: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('prioritiesMulti', 'Select Priorities'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Low', color: 'green' },
          { id: 2, text: 'Medium', color: 'orange' },
          { id: 3, text: 'High', color: 'red' },
          { id: 4, text: 'Critical', color: 'darkred' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: Open the dropdown
    const dropdownButton = canvasElement.querySelector('.dx-dropdowneditor-button');
    await expect(dropdownButton).toBeTruthy();

    if (dropdownButton instanceof HTMLElement) {
      await userEvent.click(dropdownButton);

      // Wait for dropdown to open
      await new Promise(resolve => setTimeout(resolve, 300));

      // Test: List items should be visible
      const listItems = document.querySelectorAll('.dx-list-item');
      await expect(listItems.length).toBeGreaterThan(0);

      // Test: Selection controls (checkboxes) should be visible
      const checkboxes = document.querySelectorAll('.dx-checkbox');
      await expect(checkboxes.length).toBeGreaterThan(0);
    }
  },
};

export const SearchFunctionality: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('searchMulti', 'Search Countries'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Germany', code: 'DE' },
          { id: 2, text: 'United States', code: 'US' },
          { id: 3, text: 'France', code: 'FR' },
          { id: 4, text: 'Spain', code: 'ES' },
          { id: 5, text: 'Italy', code: 'IT' },
          { id: 6, text: 'Netherlands', code: 'NL' },
          { id: 7, text: 'Belgium', code: 'BE' },
          { id: 8, text: 'Austria', code: 'AT' },
          { id: 9, text: 'Switzerland', code: 'CH' },
          { id: 10, text: 'Poland', code: 'PL' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => item ? `Code: ${item.code}` : '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [1] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for initial render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: Find the input field
    const input = canvasElement.querySelector('.dx-texteditor-input') as HTMLInputElement;
    await expect(input).toBeTruthy();

    if (input) {
      // Test: Type in search field
      await userEvent.click(input);
      await userEvent.type(input, 'Ger');

      // Wait for search to filter
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test: Dropdown should open with filtered results
      const listItems = document.querySelectorAll('.dx-list-item');
      await expect(listItems.length).toBeGreaterThan(0);
    }
  },
};

export const ClearButton: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('departmentsMulti', 'Departments'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Sales' },
          { id: 2, text: 'Marketing' },
          { id: 3, text: 'IT' },
          { id: 4, text: 'HR' },
          { id: 5, text: 'Finance' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [2, 3] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: TagBox should be visible with values
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: Tags should be displayed
    const tags = canvasElement.querySelectorAll('.dx-tag');
    await expect(tags.length).toBe(2);

    // Test: Clear button should be visible when values are set
    const clearButton = canvasElement.querySelector('.dx-clear-button-area');
    await expect(clearButton).toBeTruthy();

    if (clearButton instanceof HTMLElement) {
      // Test: Click clear button
      await userEvent.click(clearButton);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  },
};

export const SelectAllFunctionality: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('skillsMulti', 'Skills'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'JavaScript' },
          { id: 2, text: 'TypeScript' },
          { id: 3, text: 'Angular' },
          { id: 4, text: 'React' },
          { id: 5, text: 'Vue.js' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: Open the dropdown
    const dropdownButton = canvasElement.querySelector('.dx-dropdowneditor-button');
    await expect(dropdownButton).toBeTruthy();

    if (dropdownButton instanceof HTMLElement) {
      await userEvent.click(dropdownButton);

      // Wait for dropdown to open
      await new Promise(resolve => setTimeout(resolve, 300));

      // Test: Selection controls should be visible
      const checkboxes = document.querySelectorAll('.dx-checkbox');
      await expect(checkboxes.length).toBeGreaterThan(0);

      // Test: Select All checkbox should be available (at the top)
      const selectAllCheckbox = document.querySelector('.dx-list-select-all');
      if (selectAllCheckbox instanceof HTMLElement) {
        await expect(selectAllCheckbox).toBeTruthy();
        await userEvent.click(selectAllCheckbox);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  },
};

export const WithMultipleDatasources: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('technologiesMulti', 'Technologies'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        hasLookupItemHint$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Angular', type: 'Frontend Framework' },
          { id: 2, text: 'React', type: 'Frontend Library' },
          { id: 3, text: 'Vue.js', type: 'Frontend Framework' },
          { id: 4, text: 'Node.js', type: 'Backend Runtime' },
          { id: 5, text: 'Express', type: 'Backend Framework' },
          { id: 6, text: 'NestJS', type: 'Backend Framework' },
          { id: 7, text: 'PostgreSQL', type: 'Database' },
          { id: 8, text: 'MongoDB', type: 'Database' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => item ? item.type : '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [1, 4, 7] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Wait for values to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: Selected tags should be visible
    const tags = canvasElement.querySelectorAll('.dx-tag');
    await expect(tags.length).toBe(3);

    // Test: Open dropdown
    const dropdownButton = canvasElement.querySelector('.dx-dropdowneditor-button');
    if (dropdownButton instanceof HTMLElement) {
      await userEvent.click(dropdownButton);

      // Wait for dropdown to open
      await new Promise(resolve => setTimeout(resolve, 300));

      // Test: Verify hints are displayed
      const hints = document.querySelectorAll('.dx-list-item small');
      await expect(hints.length).toBeGreaterThan(0);
    }
  },
};

export const ValidationRequired: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('mandatoryMulti', 'Mandatory Selections'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Option 1' },
          { id: 2, text: 'Option 2' },
          { id: 3, text: 'Option 3' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [] },
      validation: {
        validationRules$: of([
          {
            type: 'required',
            message: 'Please select at least one option'
          }
        ])
      },
    },
  }),
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 300));

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Test: Input field should be present
    const input = canvasElement.querySelector('.dx-texteditor-input');
    await expect(input).toBeTruthy();
  },
};

export const EmptyDataSource: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('emptyMulti', 'Empty Multilookup'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Test: Open dropdown
    const dropdownButton = canvasElement.querySelector('.dx-dropdowneditor-button');
    if (dropdownButton instanceof HTMLElement) {
      await userEvent.click(dropdownButton);

      // Wait for dropdown to open
      await new Promise(resolve => setTimeout(resolve, 300));

      // Test: No items should be visible
      const listItems = document.querySelectorAll('.dx-list-item');
      await expect(listItems.length).toBe(0);
    }
  },
};

export const NotReady: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('notReadyMulti', 'Loading...'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(false),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Option 1' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Test: TagBox should not be rendered when not ready
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeFalsy();
  },
};

export const RemoveTagInteraction: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('removeTagsMulti', 'Remove Tags'),
        onEntered: () => console.log('Field entered'),
      },
      lookup: {
        ready$: of(true),
        dataSource$: of(createArrayDatasource([
          { id: 1, text: 'Red' },
          { id: 2, text: 'Blue' },
          { id: 3, text: 'Green' },
          { id: 4, text: 'Yellow' },
        ], { keyProperty: 'id' })),
        displayExpr$: of('text'),
        valueExpr$: of('id'),
        acceptCustomValue$: of(false),
        getLookupItemDisplayValue: (item: any) => item ? item.text : '',
        getLookupItemHintValue: (item: any) => '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: [1, 2, 3] },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: TagBox should be visible
    const tagBox = canvasElement.querySelector('.dx-tagbox');
    await expect(tagBox).toBeTruthy();

    // Test: Tags should be displayed
    const tags = canvasElement.querySelectorAll('.dx-tag');
    await expect(tags.length).toBe(3);

    // Test: Remove buttons should be present on tags
    const removeButtons = canvasElement.querySelectorAll('.dx-tag-remove-button');
    await expect(removeButtons.length).toBeGreaterThan(0);

    if (removeButtons[0] instanceof HTMLElement) {
      // Test: Click remove button on first tag
      await userEvent.click(removeButtons[0]);
      await new Promise(resolve => setTimeout(resolve, 200));

      // After removing, tags count should decrease
      const tagsAfter = canvasElement.querySelectorAll('.dx-tag');
      await expect(tagsAfter.length).toBe(2);
    }
  },
};

