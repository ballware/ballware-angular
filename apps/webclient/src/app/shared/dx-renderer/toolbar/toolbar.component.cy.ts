import { Provider } from '@angular/core';
import { PageService } from '@ballware/meta-services';
import { I18NextModule } from 'angular-i18next';
import { MountConfig, mount } from 'cypress/angular';
import { ToolbarComponent } from './toolbar/toolbar.component';

import { I18N_PROVIDERS } from '../i18n/i18n';
import { BehaviorSubject } from 'rxjs';
import { PageLayout, PageToolbarItem } from '@ballware/meta-model';
import { DxToolbarModule } from 'devextreme-angular';

import '../dx-renderer.scss';

describe(ToolbarComponent.name, () => {
  const config: MountConfig<ToolbarComponent> = {
    declarations: [],
    imports: [DxToolbarModule, I18NextModule.forRoot()],
    providers: [{
        provide: PageService, useValue: {
          layout$: new BehaviorSubject<PageLayout|undefined>({
            documentationEntity: 'testentity',
            toolbarItems: [
              { type: 'button' } as PageToolbarItem
            ],
            items: []
          } as PageLayout)
        }
      } as Provider,
      ...I18N_PROVIDERS
    ]
  }

  it('renders', () => {
     mount(ToolbarComponent, config);
  })
})
