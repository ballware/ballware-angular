import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutMapComponent } from './map.component';

describe(EditLayoutMapComponent.name, () => {
  const config: MountConfig<EditLayoutMapComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutMapComponent, config);
  })
})
