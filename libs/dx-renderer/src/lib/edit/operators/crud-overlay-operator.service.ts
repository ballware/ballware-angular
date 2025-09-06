import { CrudOperator, CrudService } from '@ballware/meta-services';
import { Router } from '@angular/router';

export interface CrudOverlayOperator {

}

export class CrudOverlayOperatorService implements CrudOperator, CrudOverlayOperator {

  readonly kind = 'overlay';

  constructor(private readonly router: Router) {
    console.log('CrudOverlayOperatorService', 'constructor');
  }

  readonly registerService = (service: CrudService) => {
    console.log('CrudOverlayOperatorService', 'registerService', service);
  }
}
