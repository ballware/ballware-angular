import { TestBed, fakeAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { Provider } from '@angular/core';
import { MetaApiService } from '@ballware/meta-api';
import { CompiledTenant } from '@ballware/meta-model';
import { identityUserLogin } from '../identity/identity.actions';
import { fetchTenant } from './tenant.effects';

describe('TenantEffects', () => {
    
    const metaApiServiceMock = {} as MetaApiService;

    beforeEach(() => {
        TestBed.configureTestingModule({            
            providers: [
                { 
                    provide: MetaApiService,
                    useValue: metaApiServiceMock
                } as Provider
            ]
        })
    });

    it('should resolve fetched tenant', fakeAsync(() => {
       
        const mockedUser = {
            refreshToken: 'REFRESH_TOKEN',
            accessToken: 'ACCESS_TOKEN',
            accessTokenExpiration: new Date(),
            userName: 'USER',
            currentUser: {
                mail: 'test@mock'
            },
            tenant: 'TENANT'
        };

        const mockedTenant = {
            id: 'TENANT'
        } as CompiledTenant;

        const actions$ = of(identityUserLogin(mockedUser));

        metaApiServiceMock.metaTenantApi =  {
            metadataForTenant: jest.fn().mockReturnValue(of(mockedTenant)),
            allowed: jest.fn().mockReturnValue(true)
        };
        
        const callbackSpy = jest.fn();

        TestBed.runInInjectionContext(() => {
            
            fetchTenant(actions$, undefined).subscribe((user) => {
                expect(user.user).toEqual(mockedUser.currentUser);
                expect(user.tenant).toEqual(mockedTenant);

                callbackSpy();                
            });

            expect(metaApiServiceMock.metaTenantApi.metadataForTenant).toHaveBeenCalledTimes(1);
            expect(callbackSpy).toHaveBeenCalledTimes(1);
        });
    }));
});