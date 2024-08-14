import { SettingsService } from "../settings.service";
import { Store } from "@ngrx/store";
import { selectGooglekey, selectVersion } from "./settings.state";
import { settingsInitialize } from "./settings.actions";

export class SettingsServiceProxy implements SettingsService {

    constructor(private store: Store) {}
    
    public get version$() {
        return this.store.select(selectVersion);
    }

    public get googlekey$() {
        return this.store.select(selectGooglekey);
    }

    public initialize(version: string, googlekey: string): void {
        this.store.dispatch(settingsInitialize({ version, googlekey }));
    }
}