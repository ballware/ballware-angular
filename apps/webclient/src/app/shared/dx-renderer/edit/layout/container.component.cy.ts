import { MountConfig, mount } from 'cypress/angular';
import { EditLayoutContainerComponent } from './container.component';

describe(EditLayoutContainerComponent.name, () => {
  const config: MountConfig<EditLayoutContainerComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EditLayoutContainerComponent, {
           ...config,
           componentProperties: {
               colCount:  0,
          }
       });
  })
})
