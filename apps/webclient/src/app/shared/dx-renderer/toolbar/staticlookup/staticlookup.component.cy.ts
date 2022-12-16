import { MountConfig, mount } from 'cypress/angular';
import { ToolbarStaticlookupComponent } from './staticlookup.component';

describe(ToolbarStaticlookupComponent.name, () => {
  const config: MountConfig<ToolbarStaticlookupComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(ToolbarStaticlookupComponent, config);
  })
})
