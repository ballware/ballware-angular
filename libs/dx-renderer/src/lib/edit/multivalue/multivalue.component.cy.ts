import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutMultivalueComponent } from './multivalue.component';

describe(EditLayoutMultivalueComponent.name, () => {
  const config: MountConfig<EditLayoutMultivalueComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutMultivalueComponent, config);
  })
})
