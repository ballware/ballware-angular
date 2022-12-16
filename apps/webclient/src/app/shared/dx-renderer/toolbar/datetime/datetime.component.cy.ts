import { MountConfig, mount } from 'cypress/angular';
import { ToolbarDatetimeComponent } from './datetime.component';

describe(ToolbarDatetimeComponent.name, () => {
  const config: MountConfig<ToolbarDatetimeComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(ToolbarDatetimeComponent, config);
  })
})
