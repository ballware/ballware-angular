import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutLookupComponent } from './lookup.component';

describe(EditLayoutLookupComponent.name, () => {
  const config: MountConfig<EditLayoutLookupComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutLookupComponent, config);
  })
})
