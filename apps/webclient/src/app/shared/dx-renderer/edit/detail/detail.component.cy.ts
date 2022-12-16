import { MountConfig, mount } from 'cypress/angular';
import { EditDetailComponent } from './detail.component';

describe(EditDetailComponent.name, () => {
  const config: MountConfig<EditDetailComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditDetailComponent, config);
  })
})
