import { NgModule } from  '@angular/core';
import { Routes, RouterModule, BaseRouteReuseStrategy, ActivatedRouteSnapshot, RouteReuseStrategy } from  '@angular/router';
import { PageComponent } from '../page/page/page.component';

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
    override shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return false;
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
