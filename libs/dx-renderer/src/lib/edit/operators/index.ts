import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { CRUD_OPERATOR_FACTORY, CrudOperator, CrudService } from '@ballware/meta-services';

import { CrudOverlayOperator, CrudOverlayOperatorService } from './crud-overlay-operator.service';
import { CrudTopLevelOperatorService } from './crud-toplevel-operator.service';
import { Router } from '@angular/router';

export function provideDxCrudOperatorFactory(): EnvironmentProviders {

  return makeEnvironmentProviders([
    {
      provide: CRUD_OPERATOR_FACTORY,
      useFactory: () => (router: Router, crudService: CrudService, parentOperator?: CrudOperator) => {

        if (!parentOperator) {
          return new CrudTopLevelOperatorService(router, crudService);
        }

        return new CrudOverlayOperatorService(router, crudService);
      }
    }
  ]);
}

export const CRUD_OVERLAY_OPERATOR = new InjectionToken<CrudOverlayOperator>('Crud overlay operator');
