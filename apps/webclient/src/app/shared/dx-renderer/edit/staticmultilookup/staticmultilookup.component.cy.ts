import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutStaticmultilookupComponent } from './staticmultilookup.component';

describe(EditLayoutStaticmultilookupComponent.name, () => {
  const config: MountConfig<EditLayoutStaticmultilookupComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutStaticmultilookupComponent, config);
  })
})
