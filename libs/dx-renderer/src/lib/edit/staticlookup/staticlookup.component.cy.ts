import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutStaticlookupComponent } from './staticlookup.component';

describe(EditLayoutStaticlookupComponent.name, () => {
  const config: MountConfig<EditLayoutStaticlookupComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutStaticlookupComponent, config);
  })
})
