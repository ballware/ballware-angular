import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutTextareaComponent } from './textarea.component';

describe(EditLayoutTextareaComponent.name, () => {
  const config: MountConfig<EditLayoutTextareaComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutTextareaComponent, config);
  })
})
