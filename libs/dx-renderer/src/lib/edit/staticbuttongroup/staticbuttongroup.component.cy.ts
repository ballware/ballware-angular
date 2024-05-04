import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutStaticButtonGroupComponent } from './staticbuttongroup.component';

describe(EditLayoutStaticButtonGroupComponent.name, () => {
  const config: MountConfig<EditLayoutStaticButtonGroupComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutStaticButtonGroupComponent, config);
  })
})
