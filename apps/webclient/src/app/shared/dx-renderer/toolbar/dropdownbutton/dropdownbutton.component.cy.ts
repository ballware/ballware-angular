import { MountConfig, mount } from 'cypress/angular';
import { ToolbarDropdownbuttonComponent } from './dropdownbutton.component';

describe(ToolbarDropdownbuttonComponent.name, () => {
  const config: MountConfig<ToolbarDropdownbuttonComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(ToolbarDropdownbuttonComponent, config);
  })
})
