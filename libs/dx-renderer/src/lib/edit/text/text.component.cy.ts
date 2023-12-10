import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutTextComponent } from './text.component';

describe(EditLayoutTextComponent.name, () => {
  const config: MountConfig<EditLayoutTextComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutTextComponent, config);
  })
})
