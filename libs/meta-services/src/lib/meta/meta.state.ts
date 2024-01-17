import { CompiledEntityMetadata, DocumentSelectEntry, EntityCustomFunction, QueryParams, Template } from "@ballware/meta-model";

export interface MetaState {
    identifier?: string;

    entity?: string;
    readOnly?: boolean;
    headParams?: QueryParams;

    initialCustomParam?: Record<string, unknown>;
    customParam?: Record<string, unknown>;

    displayName?: string;

    entityMetadata?: CompiledEntityMetadata;
    entityDocuments?: DocumentSelectEntry[];
    entityTemplates?: Template[];
    customFunctions?: EntityCustomFunction[];
}