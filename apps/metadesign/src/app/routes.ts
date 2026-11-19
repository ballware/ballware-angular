import { Routes } from '@angular/router';
import { DefaultRedirectComponent, PageComponent } from '@ballware/dx-renderer';

export const routes: Routes = [
  {
    path: 'page/:id',
    component: PageComponent,
    data: { forceNewOnParamChange: ['id'] }
  },
  {
    path: '**',
    component: DefaultRedirectComponent
  }
];
