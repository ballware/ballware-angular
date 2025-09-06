import { CrudOperator, CrudService } from '@ballware/meta-services';
import { Router } from '@angular/router';

export class CrudTopLevelOperatorService implements CrudOperator {

  readonly kind = 'toplevel';

  constructor(private readonly router: Router) {
    console.log('CrudTopLevelOperatorService', 'constructor');
  }

  readonly registerService = (service: CrudService) => {
    console.log('CrudTopLevelOperatorService', 'registerService', service);
  }
}
