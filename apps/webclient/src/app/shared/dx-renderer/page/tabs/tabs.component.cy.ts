import { MountConfig, mount } from 'cypress/angular';
import { PageLayoutTabsComponent } from './tabs.component';

describe(PageLayoutTabsComponent.name, () => {
  const config: MountConfig<PageLayoutTabsComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(PageLayoutTabsComponent, config);
  })
})
