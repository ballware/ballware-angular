import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { EditLayoutBoolComponent } from './editbool.component';
import { of } from 'rxjs';
import { EDIT_SERVICE, LOOKUP_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { createMockedEditService } from '@storybook-helpers/edit.service.mock';
import { createMockedLookupService } from '@storybook-helpers/lookup.service.mock';
import { createSimpleTranslator } from '@storybook-helpers/translator.mock';
import { expect, within } from 'storybook/test';

const meta: Meta<EditLayoutBoolComponent> = {
  title: 'DX Renderer/Edit/Bool',
  component: EditLayoutBoolComponent,
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
      imports: [EditLayoutBoolComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<EditLayoutBoolComponent>;

// Helper function to create a mock layout item
const createLayoutItem = (
  dataMember: string,
  caption: string,
  options: Record<string, unknown> = {}
) => ({
  type: 'bool',
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
        layoutItem: createLayoutItem('isActive', 'Active'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: false },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: Checkbox should be visible
    const checkbox = canvas.getByRole('checkbox', { hidden: true });
    await expect(checkbox).toBeTruthy();

    // Test: Label should contain correct text
    const label = canvas.getByText('Active');
    await expect(label).toBeTruthy();
  },
};

export const Checked: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('isEnabled', 'Enabled'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: true },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: Checkbox should be checked
    const checkboxContainer = canvas.getByText('Enabled').parentElement?.parentElement;
    await expect(checkboxContainer).toBeTruthy();

    // Verify the checkbox has checked class
    const dxCheckbox = canvasElement.querySelector('.dx-checkbox-checked');
    await expect(dxCheckbox).toBeTruthy();
  },
};

export const Readonly: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('isVerified', 'Verified'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(true) },
      value: { value: true },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {
    // Test: Checkbox should be in readonly state
    const readonlyCheckbox = canvasElement.querySelector('.dx-state-readonly');
    await expect(readonlyCheckbox).toBeTruthy();
  },
};

export const ReadonlyUnchecked: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('isPublished', 'Published'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(true) },
      value: { value: false },
      validation: { validationRules$: of([]) },
    },
  }),
};

export const Hidden: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem('isHidden', 'Hidden Field'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(false) },
      readonly: { readonly$: of(false) },
      value: { value: false },
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
        layoutItem: createLayoutItem('acceptTerms', 'Accept Terms and Conditions'),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: false },
      validation: {
        validationRules$: of([
          {
            type: 'required',
            message: 'You must accept the terms and conditions',
          },
        ]),
      },
    },
  }),
};

export const LongCaption: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createLayoutItem(
          'agreement',
          'I agree to the terms and conditions and privacy policy of this application'
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: false },
      validation: { validationRules$: of([]) },
    },
  }),
};

