import { Injectable, OnDestroy } from '@angular/core';
import { WithDestroy } from '@ballware/angular-utils';

export interface TemplateServiceApi {
    create(): void;
    open(file: File): void;
    download(): void;
    close(): void;
}

@Injectable()
export abstract class TemplateService extends WithDestroy() implements OnDestroy, TemplateServiceApi {
    public abstract create(): void;
    public abstract open(file: File): void;
    public abstract download(): void;
    public abstract close(): void;    
}