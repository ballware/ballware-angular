import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutGroupComponent } from './group.component';

describe(EditLayoutGroupComponent.name, () => {
  const config: MountConfig<EditLayoutGroupComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutGroupComponent, config);
  })
})
