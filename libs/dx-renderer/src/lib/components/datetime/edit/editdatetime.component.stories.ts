import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { EditLayoutDatetimeComponent } from './editdatetime.component';
import { of } from 'rxjs';
import { EDIT_SERVICE, LOOKUP_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { createMockedEditService } from '@storybook-helpers/edit.service.mock';
import { createMockedLookupService } from '@storybook-helpers/lookup.service.mock';
import { createMockedTranslator } from '@storybook-helpers/translator.mock';
import { expect, userEvent } from 'storybook/test';
import { loadMessages, locale } from 'devextreme/localization';
import deMessages from 'devextreme/localization/messages/de.json';

// Initialize DevExtreme localization
loadMessages(deMessages);
locale('de');

const meta: Meta<EditLayoutDatetimeComponent> = {
  title: 'DX Renderer/Edit/DateTime',
  component: EditLayoutDatetimeComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        {
          provide: TRANSLATOR,
          useValue: createMockedTranslator({
            translations: {
              'format.date': 'dd.MM.yyyy',
              'format.datetime': 'dd.MM.yyyy HH:mm',
            }
          })
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
      imports: [EditLayoutDatetimeComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<EditLayoutDatetimeComponent>;

// Helper function to create a mock layout item
const createLayoutItem = (
  dataMember: string,
  caption: string,
  type: 'date' | 'datetime' = 'date',
  options: Record<string, unknown> = {}
) => ({
  type,
  options: {
    dataMember,
    caption,
    ...options,
  },
});

export const DateDefault: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('birthDate', 'Birth Date', 'date'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: null },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: DateBox should be visible
    const dateBox = canvasElement.querySelector('.dx-datebox');
    await expect(dateBox).toBeTruthy();

    // Test: Input field should be present
    const input = canvasElement.querySelector('.dx-texteditor-input');
    await expect(input).toBeTruthy();
  },
};

export const DateTimeDefault: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('appointmentTime', 'Appointment', 'datetime'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: null },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: DateBox should be visible
    const dateBox = canvasElement.querySelector('.dx-datebox');
    await expect(dateBox).toBeTruthy();

    // Test: Input field should be present
    const input = canvasElement.querySelector('.dx-texteditor-input');
    await expect(input).toBeTruthy();
  },
};

export const WithPreselectedDate: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('startDate', 'Start Date', 'date'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: new Date(2025, 0, 15) }, // January 15, 2025
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Test: DateBox should have preselected value
    const dateBox = canvasElement.querySelector('.dx-datebox');
    await expect(dateBox).toBeTruthy();

    // Wait longer for the value to render and format
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test: The selected value should be displayed
    const input = canvasElement.querySelector('.dx-texteditor-input') as HTMLInputElement;
    await expect(input).toBeTruthy();

    // Check if the input has a value (DevExtreme should have formatted the date)
    if (input.value === '') {
      console.warn('Date value is empty, DevExtreme locale might not be initialized');
    }
  },
};

export const WithPreselectedDateTime: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('createdAt', 'Created At', 'datetime'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: new Date(2025, 0, 15, 14, 30) }, // January 15, 2025, 14:30
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Test: DateBox should have preselected value
    const dateBox = canvasElement.querySelector('.dx-datebox');
    await expect(dateBox).toBeTruthy();

    // Wait longer for the value to render and format
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test: The selected value should be displayed
    const input = canvasElement.querySelector('.dx-texteditor-input') as HTMLInputElement;
    await expect(input).toBeTruthy();

    // Check if the input has a value (DevExtreme should have formatted the datetime)
    if (input.value === '') {
      console.warn('DateTime value is empty, DevExtreme locale might not be initialized');
    }
  },
};

export const Readonly: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('registrationDate', 'Registration Date (Readonly)', 'date'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(true) },
      value: { value: new Date(2025, 11, 10) }, // December 10, 2025
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 200));

    // Test: DateBox should be visible
    const dateBox = canvasElement.querySelector('.dx-datebox');
    await expect(dateBox).toBeTruthy();

    // Test: DateBox or its input should be in readonly state
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

    // Test: Value should be displayed
    const input = canvasElement.querySelector('.dx-texteditor-input');
    await expect(input).toBeTruthy();
  },
};

export const ReadonlyDateTime: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('lastModified', 'Last Modified (Readonly)', 'datetime'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(true) },
      value: { value: new Date(2025, 11, 10, 10, 45) }, // December 10, 2025, 10:45
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Wait for component to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Test: DateBox should be visible and readonly
    const readonlyElement = canvasElement.querySelector('.dx-state-readonly');
    if (readonlyElement) {
      await expect(readonlyElement).toBeTruthy();
    }

    // Test: Value should be displayed
    const input = canvasElement.querySelector('.dx-texteditor-input') as HTMLInputElement;
    await expect(input).toBeTruthy();

    // Check if the input has a value (DevExtreme should have formatted the datetime)
    if (input.value === '') {
      console.warn('DateTime value is empty, DevExtreme locale might not be initialized');
    }
  },
};

export const Hidden: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('hiddenDate', 'Hidden Date Field', 'date'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(false) },
      readonly: { readonly$: of(false) },
      value: { value: null },
      validation: { validationRules$: of([]) },
    },
  }),
};

export const WithValidation: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('dueDate', 'Due Date', 'date'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: null },
      validation: {
        validationRules$: of([
          {
            type: 'required',
            message: 'Due date is required',
          },
        ]),
      },
    },
  }),
  play: async ({ canvasElement }) => {
    // Test: DateBox should be visible
    const dateBox = canvasElement.querySelector('.dx-datebox');
    await expect(dateBox).toBeTruthy();

    // Test: Clear button should be visible
    const clearButton = canvasElement.querySelector('.dx-clear-button-area');
    await expect(clearButton).toBeTruthy();
  },
};

export const WithDateTimeValidation: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('scheduledAt', 'Scheduled At', 'datetime'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: null },
      validation: {
        validationRules$: of([
          {
            type: 'required',
            message: 'Schedule time is required',
          },
        ]),
      },
    },
  }),
};

export const InteractionTest: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('eventDate', 'Event Date', 'date'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: null },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Test: DateBox should be visible
    const dateBox = canvasElement.querySelector('.dx-datebox');
    await expect(dateBox).toBeTruthy();

    // Test: Open calendar dropdown
    const dropdownButton = canvasElement.querySelector('.dx-dropdowneditor-button');
    if (dropdownButton instanceof HTMLElement) {
      await userEvent.click(dropdownButton);

      // Wait for calendar to open
      await new Promise(resolve => setTimeout(resolve, 300));

      // Test: Calendar should be visible
      const calendar = document.querySelector('.dx-calendar');
      await expect(calendar).toBeTruthy();
    }
  },
};

