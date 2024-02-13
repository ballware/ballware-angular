import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutTabsComponent } from './tabs.component';

describe(EditLayoutTabsComponent.name, () => {
  const config: MountConfig<EditLayoutTabsComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutTabsComponent, config);
  })
})
