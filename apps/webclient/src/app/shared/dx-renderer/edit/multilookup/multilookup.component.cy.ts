import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutMultilookupComponent } from './multilookup.component';

describe(EditLayoutMultilookupComponent.name, () => {
  const config: MountConfig<EditLayoutMultilookupComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutMultilookupComponent, config);
  })
})
