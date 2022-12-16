import { MountConfig, mount } from 'cypress/angular';
import { PageLayoutItemComponent } from './item.component';

describe(PageLayoutItemComponent.name, () => {
  const config: MountConfig<PageLayoutItemComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(PageLayoutItemComponent, {
           ...config,
           componentProperties: {
               colSpan:  0,
               colCount:  0,
          }
       });
  })
})
