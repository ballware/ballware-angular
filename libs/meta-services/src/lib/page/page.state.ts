import { CompiledPageData, PageLayout, QueryParams } from "@ballware/meta-model";
import { PageDocumentationDialog } from "../page.service";

export interface PageState {
    initialized: boolean;    
    pageIdentifier?: string;
    title?: string;
    documentationIdentifier?: string;
    page?: CompiledPageData;
    layout?: PageLayout;
    customParam?: Record<string, unknown>;
    headParams?: QueryParams;

    documentationDialog?: PageDocumentationDialog;
}