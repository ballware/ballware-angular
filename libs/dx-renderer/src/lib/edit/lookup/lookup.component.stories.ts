import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { EditLayoutLookupComponent } from './lookup.component';
import { of } from 'rxjs';
import { EDIT_SERVICE, LOOKUP_SERVICE, NOTIFICATION_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { createMockedEditService } from '@storybook-helpers/edit.service.mock';
import { createMockedLookupService } from '@storybook-helpers/lookup.service.mock';
import { createMockedNotificationService } from '@storybook-helpers/notification.service.mock';
import { createSimpleTranslator } from '@storybook-helpers/translator.mock';
import { createArrayDatasource } from '../../utils';

const meta: Meta<EditLayoutLookupComponent> = {
  title: 'DX Renderer/Edit/Lookup',
  component: EditLayoutLookupComponent,
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
      imports: [EditLayoutLookupComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<EditLayoutLookupComponent>;

// Helper function to create a mock layout item
const createLayoutItem = (
  dataMember: string,
  caption: string,
  options: Record<string, unknown> = {}
) => ({
  type: 'lookup',
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
        layoutItem: createLayoutItem('singleLookup', 'Single Lookup'),
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
        getLookupItemHintValue: (item: any) => item ? `Hint for ${item.text}` : '',
        onCustomItemCreating: (e: any) => console.log('Custom item creating:', e)
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: { value: false },
      validation: { validationRules$: of([]) },
    },
  }),
  play: async ({ canvasElement }) => {

  },
};

