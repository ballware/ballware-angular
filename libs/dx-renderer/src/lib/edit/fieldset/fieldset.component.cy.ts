import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutFieldsetComponent } from './fieldset.component';

describe(EditLayoutFieldsetComponent.name, () => {
  const config: MountConfig<EditLayoutFieldsetComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutFieldsetComponent, config);
  })
})
