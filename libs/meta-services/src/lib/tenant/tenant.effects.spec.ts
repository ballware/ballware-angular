import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from  '@angular/common/http/testing';
import { fetchTenant } from './tenant.effects';
import { Actions } from '@ngrx/effects';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

describe('TenantEffects', () => {
    beforeEach(() => {        
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        })
    });

    it('should resolve fetched tenant', () => {
        const actions$ = new Actions();

        const httpClient = TestBed.inject(HttpClient);
        
        //const 

        //fetchTenant(actions$, httpClient, )
    });
});