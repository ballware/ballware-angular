import { MountConfig, mount } from 'cypress/angular';
import { ToolbarLookupComponent } from './lookup.component';

describe(ToolbarLookupComponent.name, () => {
  const config: MountConfig<ToolbarLookupComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(ToolbarLookupComponent, config);
  })
})
