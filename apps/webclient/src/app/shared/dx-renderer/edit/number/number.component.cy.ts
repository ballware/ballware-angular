import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutNumberComponent } from './number.component';

describe(EditLayoutNumberComponent.name, () => {
  const config: MountConfig<EditLayoutNumberComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutNumberComponent, config);
  })
})
