import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CRUD_OPERATOR_FACTORY, CrudOperator } from '@ballware/meta-services';

import { CrudOverlayOperatorService } from './crud-overlay-operator.service';
import { CrudTopLevelOperatorService } from './crud-toplevel-operator.service';
import { Router } from '@angular/router';

export function provideDxCrudOperatorFactory(): EnvironmentProviders {

  return makeEnvironmentProviders([
    {
      provide: CRUD_OPERATOR_FACTORY,
      useFactory: () => (router: Router, parentOperator?: CrudOperator) => {

        if (!parentOperator) {
          return new CrudTopLevelOperatorService(router);
        }

        return new CrudOverlayOperatorService(router);
      }
    }
  ]);
}
