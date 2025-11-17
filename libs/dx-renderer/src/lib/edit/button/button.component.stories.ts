import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { EditLayoutButtonComponent } from './button.component';
import { EDIT_SERVICE, LOOKUP_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { createMockedEditService } from '@storybook-helpers/dx/edit.service.mock';
import { createMockedLookupService } from '@storybook-helpers/dx/lookup.service.mock';
import { createSimpleTranslator } from '@storybook-helpers/dx/translator.mock';
import { of } from 'rxjs';
import { expect, within, userEvent } from 'storybook/test';

const meta: Meta<EditLayoutButtonComponent> = {
  title: 'DX Renderer/Edit/Button',
  component: EditLayoutButtonComponent,
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
      imports: [EditLayoutButtonComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<EditLayoutButtonComponent>;

// Helper function to create a mock layout item for button
const createButtonLayoutItem = (
  dataMember: string,
  hint: string,
  options: Record<string, unknown> = {}
) => ({
  type: 'button',
  options: {
    dataMember,
    hint,
    ...options,
  },
});

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem('actionButton', 'Click Me'),
        onEvent: (event: string) => console.log(`Button event: ${event}`),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: Button should be visible with correct text
    const button = canvas.getByRole('button');
    await expect(button).toBeTruthy();
    await expect(button.textContent).toContain('Click Me');

    // Test: Button should be clickable
    await userEvent.click(button);
  },
};

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem('disabledButton', 'Disabled Button'),
        onEvent: (event: string) => console.log(`Button event: ${event}`),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(true) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: Button should be disabled
    const button = canvas.getByRole('button');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  },
};

export const LongText: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem(
          'longTextButton',
          'This is a button with a very long text that might wrap or truncate'
        ),
        onEvent: (event: string) => console.log(`Button event: ${event}`),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
    },
  }),
};

export const CustomWidth: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem('customWidthButton', 'Wide Button', {
          width: 300,
        }),
        onEvent: (event: string) => console.log(`Button event: ${event}`),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
    },
  }),
};

export const CustomHeight: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem('customHeightButton', 'Tall Button', {
          height: 60,
        }),
        onEvent: (event: string) => console.log(`Button event: ${event}`),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
    },
  }),
};

export const CustomSize: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem('customSizeButton', 'Custom Size', {
          width: 250,
          height: 50,
        }),
        onEvent: (event: string) => console.log(`Button event: ${event}`),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
    },
  }),
};

export const Hidden: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem('hiddenButton', 'Hidden Button'),
        onEvent: (event: string) => console.log(`Button event: ${event}`),
      },
      visible: { visible$: of(false) },
      readonly: { readonly$: of(false) },
    },
  }),
};

export const SaveButton: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem('saveButton', 'Save'),
        onEvent: (event: string) => console.log(`Save button clicked: ${event}`),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
    },
  }),
};

export const CancelButton: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem('cancelButton', 'Cancel'),
        onEvent: (event: string) => console.log(`Cancel button clicked: ${event}`),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
    },
  }),
};

export const DeleteButton: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem('deleteButton', 'Delete'),
        onEvent: (event: string) => console.log(`Delete button clicked: ${event}`),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
    },
  }),
};

export const ShortText: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createButtonLayoutItem('shortButton', 'OK'),
        onEvent: (event: string) => console.log(`Button event: ${event}`),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
    },
  }),
};

