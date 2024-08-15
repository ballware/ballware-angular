import { CompiledTenant, NavigationLayout, NavigationLayoutItem } from '@ballware/meta-model';
import { createMockStore } from '@ngrx/store/testing';
import { firstValueFrom } from 'rxjs';
import { NavigationTreeItem } from '@ballware/meta-services';
import { TenantServiceProxy } from './tenant.proxy';
import { TenantState } from './tenant.state';

describe('select tenant data from store', () => {
    
    it('should return tenant selector values', async () => {
        const mockedTenant = jest.mocked<CompiledTenant>({
            id: 'TENANT',
            name: 'MOCKED TENANT',
            hasRight: (_user, _right) => true
        });

        const mockedNavigationLayout = jest.mocked<NavigationLayout>({
            title: 'MOCKED_TITLE',
            items: []
        });

        const mockedNavigationTree = jest.mocked<NavigationTreeItem[]>([]);
        const mockedPages = jest.mocked<NavigationLayoutItem[]>([]);
        const mockedHasRight = jest.fn();

        const store = createMockStore<{ tenant: TenantState }>({
           initialState: {
                tenant: {
                    tenant: mockedTenant,                    
                    title: 'TITLE',
                    navigationLayout: mockedNavigationLayout,
                    navigationTree: mockedNavigationTree,
                    pages: mockedPages,
                    hasRight: mockedHasRight
                }
           } 
        });
        
        const tenantProxy = new TenantServiceProxy(store);

        await expect(firstValueFrom(tenantProxy.tenant$)).resolves.toEqual(mockedTenant);
        await expect(firstValueFrom(tenantProxy.title$)).resolves.toEqual('TITLE');
        await expect(firstValueFrom(tenantProxy.navigationLayout$)).resolves.toEqual(mockedNavigationLayout);
        await expect(firstValueFrom(tenantProxy.navigationTree$)).resolves.toEqual(mockedNavigationTree);
        await expect(firstValueFrom(tenantProxy.pages$)).resolves.toEqual(mockedPages);
        await expect(firstValueFrom(tenantProxy.hasRight$)).resolves.toEqual(mockedHasRight);
    });
});