import { Injectable } from "@angular/core";
import { SettingsService } from "../settings.service";
import { Store } from "@ngrx/store";
import { selectGooglekey, selectVersion } from "./settings.state";
import { settingsInitialize } from "./settings.actions";

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