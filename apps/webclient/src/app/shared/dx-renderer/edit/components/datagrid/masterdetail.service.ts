import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MasterdetailService {

    public item$ = new BehaviorSubject<Record<string, unknown>|undefined>(undefined);
}
