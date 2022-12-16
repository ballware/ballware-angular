import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutComponent } from './layout.component';

describe(EditLayoutComponent.name, () => {
  const config: MountConfig<EditLayoutComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutComponent, config);
  })
})
