import { NgModule } from  '@angular/core';
import { Routes, RouterModule, BaseRouteReuseStrategy, ActivatedRouteSnapshot, RouteReuseStrategy } from  '@angular/router';
import { PageComponent } from '../page/page/page.component';
import { isEqual } from 'lodash';

const routes: Routes = [
    {
        path: 'page/:id',
        component: PageComponent
    },
    {
        path: '**',
        redirectTo: 'page/default'
    }
];

export class NoRouteReuseStrategy extends BaseRouteReuseStrategy {
    
    override shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig && isEqual(future.params, curr.params);
    }
}

@NgModule({
imports: [RouterModule.forChild(routes)],
exports: [RouterModule],
providers: [
    {
        provide: RouteReuseStrategy, useClass: NoRouteReuseStrategy
    }
]
})
export class BallwareApplicationRoutingModule { }
