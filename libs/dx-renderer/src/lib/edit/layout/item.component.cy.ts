import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutItemComponent } from './item.component';

describe(EditLayoutItemComponent.name, () => {
  const config: MountConfig<EditLayoutItemComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutItemComponent, {
           ...config,
           componentProperties: {
               colSpan:  0,
               colCount:  0,
          }
       });
  })
})
