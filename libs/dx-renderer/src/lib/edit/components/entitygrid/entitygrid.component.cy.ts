import { MountConfig, mount } from 'cypress/angular';
import { EntitygridComponent } from './entitygrid.component';

describe(EntitygridComponent.name, () => {
  const config: MountConfig<EntitygridComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(EntitygridComponent, {
           ...config,
           componentProperties: {
               storageIdentifier:  '',
               height:  '',
          }
       });
  })
})
