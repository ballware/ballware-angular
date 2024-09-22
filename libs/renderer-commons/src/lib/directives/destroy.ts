import { Directive, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Directive({
    standalone: true
})
export class Destroy implements OnDestroy {
    private _destroy$  = new Subject<void>();

    public get destroy$(): Observable<void> {
        return this._destroy$;
    }

    ngOnDestroy() {
        this._destroy$.next();
        this._destroy$.complete();
    }
}