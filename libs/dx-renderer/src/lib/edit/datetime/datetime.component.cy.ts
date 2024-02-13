import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutDatetimeComponent } from './datetime.component';

describe(EditLayoutDatetimeComponent.name, () => {
  const config: MountConfig<EditLayoutDatetimeComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutDatetimeComponent, config);
  })
})
