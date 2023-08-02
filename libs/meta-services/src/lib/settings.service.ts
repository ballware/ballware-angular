import { Observable } from "rxjs";
import { WithDestroy } from "./withdestroy";

export abstract class SettingsService extends WithDestroy() {

    public abstract version$: Observable<string|undefined>;
    public abstract googlekey$: Observable<string|undefined>;

    public abstract initialize(version: string, googlekey: string): void;
}
  