import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutToggleComponent } from './toggle.component';

describe(EditLayoutToggleComponent.name, () => {
  const config: MountConfig<EditLayoutToggleComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutToggleComponent, config);
  })
})
