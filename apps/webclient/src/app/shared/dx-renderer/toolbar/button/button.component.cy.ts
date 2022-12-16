import { MountConfig, mount } from 'cypress/angular';
import { ToolbarButtonComponent } from './button.component';

describe(ToolbarButtonComponent.name, () => {
  const config: MountConfig<ToolbarButtonComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(ToolbarButtonComponent, config);
  })
})
