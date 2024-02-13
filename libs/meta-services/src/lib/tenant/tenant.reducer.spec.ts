import { createAction } from "@ngrx/store";
import { buildNavigationTree, buildPageList, initialState, tenantReducer } from "./tenant.reducer";
import { CompiledTenant, NavigationLayout } from "@ballware/meta-model";
import { tenantFetched } from "./tenant.actions";

const navigationLayout = {
    items: [
        { 
            type: 'group',             
            options: {
                caption: 'allowed_group'
            },       
            items: [
                {
                    type: 'page',
                    options: {
                        page: 'allowed_page_1',
                        url: 'page_1',
                        caption: 'Page 1'
                    }
                },
                {
                    type: 'page',
                    options: {
                        url: 'page_unknown',
                        caption: 'Unknown page'
                    }
                },
                {
                    type: 'section',
                    items: [
                        {
                            type: 'page',
                            options: {
                                page: 'allowed_page_2',
                                url: 'page_2',
                                caption: 'Page 2'
                            }
                        },
                        {
                            type: 'page',
                            options: {
                                page: 'forbidden_page_3',
                                url: 'page_3',
                                caption: 'Page 3'
                            }
                        }
                    ]
                },                        
            ]
        },
        { 
            type: 'group',             
            options: {
                caption: 'forbidden_group'
            },       
            items: [
                {
                    type: 'page',
                    options: {
                        page: 'forbidden_page_4',
                        url: 'page_4',                                
                        caption: 'Page 4'
                    }
                },
                {
                    type: 'section',
                    items: [
                        {
                            type: 'page',
                            options: {
                                page: 'forbidden_page_5',
                                url: 'page_5',
                                caption: 'Page 5'
                            }
                        },
                        {
                            type: 'page',
                            options: {
                                page: 'forbidden_page_6',
                                url: 'page_6',
                                caption: 'Page 6'
                            }
                        }
                    ]
                }
            ]
        }
    ]
} as NavigationLayout;


describe('build navigation tree', () => {
    it('empty metadata should return empty navigation tree', () => {
        const emptyNavigationLayout = {} as NavigationLayout;

        const navigationTree = buildNavigationTree(() => true, emptyNavigationLayout);

        expect(navigationTree).toEqual([]);
    });

    it('metadata with not allowed pages should generate tree without excluded pages and empty groups', () => {

        const navigationTree = buildNavigationTree((right) => !right.includes('forbidden'), navigationLayout);

        expect(navigationTree).toMatchSnapshot();
    });
});

describe('build page list', () => {
    it('empty metadata should return empty page list', () => {
        const emptyNavigationLayout = {} as NavigationLayout;

        const pageList = buildPageList(() => true, emptyNavigationLayout);

        expect(pageList).toEqual([]);
    });

    it('metadata with not allowed pages should generate page list without excluded pages', () => {

        const pageList = buildPageList((right) => !right.includes('forbidden'), navigationLayout);

        expect(pageList).toMatchSnapshot();
    });
});

describe('reducer', () => {
    it('reducer should return init state', () => {
        const noopAction = createAction('noop');

        const newState = tenantReducer(undefined, noopAction);
        
        expect(newState).toEqual(initialState);
    });

    it('fetch tenant without navigation should add fetched tenant to state', () => {
        const user = { 'preferred_username': 'John Doo' } as Record<string, unknown>;
        const tenant = { 
            name: 'My tenant'            
        } as CompiledTenant;

        const newState = tenantReducer(initialState, tenantFetched({ user, tenant }));

        expect(newState.title).toEqual(tenant.name);
        expect(newState.tenant).toEqual(tenant);
        expect(newState.navigationLayout).toBeUndefined();
        expect(newState.navigationTree).toBeUndefined();
        expect(newState.pages).toBeUndefined();
        expect(newState.hasRight).toBeUndefined();
    });

    it('fetch tenant should add fetched tenant to state', () => {
        const user = { 'preferred_username': 'John Doo' } as Record<string, unknown>;
        const tenant = { 
            name: 'My tenant',
            hasRight: (_user, _right) => true,
            navigation: navigationLayout
        } as CompiledTenant;

        const newState = tenantReducer(initialState, tenantFetched({ user, tenant }));

        expect(newState.title).toEqual(tenant.name);
        expect(newState.tenant).toEqual(tenant);
        expect(newState.hasRight).toBeDefined();
        expect(newState.hasRight && newState.hasRight('nonsense')).toEqual(true);
    });
});