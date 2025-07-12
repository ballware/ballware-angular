import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class MasterdetailService {

    public entity$ = new BehaviorSubject<string|undefined>(undefined); 
    public item$ = new BehaviorSubject<Record<string, unknown>|undefined>(undefined);
}
