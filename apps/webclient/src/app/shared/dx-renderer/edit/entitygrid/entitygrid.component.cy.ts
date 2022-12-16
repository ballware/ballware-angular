import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutEntitygridComponent } from './entitygrid.component';

describe(EditLayoutEntitygridComponent.name, () => {
  const config: MountConfig<EditLayoutEntitygridComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutEntitygridComponent, config);
  })
})
