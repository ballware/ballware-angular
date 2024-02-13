import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrintComponent } from './shared/components/print/print.component';

const routes: Routes = [
    {
        path: 'print',
        component: PrintComponent
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { enableTracing: false })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
