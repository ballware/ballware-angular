import { CompiledPageData, PageLayout, QueryParams } from "@ballware/meta-model";

export interface PageState {
    initialized: boolean;   
    pageUrl?: string; 
    pageQuery?: QueryParams;
    pageIdentifier?: string;
    title?: string;
    page?: CompiledPageData;
    layout?: PageLayout;
    customParam?: Record<string, unknown>;
    headParams?: QueryParams;
}