import { CompiledPageData, PageLayout } from "@ballware/meta-model";

export interface PageState {
    initialized: boolean;    
    title?: string;
    page?: CompiledPageData;
    layout?: PageLayout;
    customParam?: Record<string, unknown>;
}