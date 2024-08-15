import { InjectionToken } from "@angular/core";

export type Translator = (key: string, options?: Record<string, unknown>) => string;

export const TRANSLATOR = new InjectionToken<Translator>('Translator');