import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { SettingsService } from "../settings.service";
import { settingsInitialize } from "./settings.actions";
import { selectGooglekey, selectVersion } from "./settings.state";

@Injectable()
export class SettingsServiceProxy extends SettingsService {

    constructor(private store: Store) {
        super();
    }
    
    public get version$() {
        return this.store.select(selectVersion);
    }

    public get googlekey$() {
        return this.store.select(selectGooglekey);
    }

    public override initialize(version: string, googlekey: string): void {
        this.store.dispatch(settingsInitialize({ version, googlekey }));
    }
}