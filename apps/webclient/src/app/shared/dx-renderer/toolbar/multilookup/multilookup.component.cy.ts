import { MountConfig, mount } from 'cypress/angular';
import { ToolbarMultilookupComponent } from './multilookup.component';

describe(ToolbarMultilookupComponent.name, () => {
  const config: MountConfig<ToolbarMultilookupComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(ToolbarMultilookupComponent, config);
  })
})
