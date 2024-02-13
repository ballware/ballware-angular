import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutBoolComponent } from './bool.component';

describe(EditLayoutBoolComponent.name, () => {
  const config: MountConfig<EditLayoutBoolComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutBoolComponent, config);
  })
})
