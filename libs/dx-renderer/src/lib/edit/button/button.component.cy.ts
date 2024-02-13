import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutButtonComponent } from './button.component';

describe(EditLayoutButtonComponent.name, () => {
  const config: MountConfig<EditLayoutButtonComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutButtonComponent, config);
  })
})
