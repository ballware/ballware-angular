import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { ResponsiveService, SCREEN_SIZE } from "../responsive.service";
import { screenSizeChanged } from "./responsive.actions";
import { selectSize, selectSmallScreen } from "./responsive.state";

@Injectable()
export class ResponsiveServiceProxy extends ResponsiveService {
    constructor(private store: Store) {
        super();
    }

    override get resize$() {
        return this.store.select(selectSize);
    }

    override get small$() {
        return this.store.select(selectSmallScreen);
    }

    override onResize(size: SCREEN_SIZE) {
        this.store.dispatch(screenSizeChanged({ size }));
    }
}