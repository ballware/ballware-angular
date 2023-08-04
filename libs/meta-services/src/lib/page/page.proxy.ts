import { PageService } from "../page.service";
import { PageStore } from "./page.store";

export class PageServiceProxy extends PageService {
    
    constructor(private pageStore: PageStore) {
        super();
    }

    readonly initialized$ = this.pageStore.initialized$;
    readonly page$ = this.pageStore.page$;
    readonly title$ = this.pageStore.title$;
    readonly layout$ = this.pageStore.layout$;
    readonly customParam$ = this.pageStore.customParam$;
    readonly headParams$ = this.pageStore.headParams$;
    
    readonly loadData = this.pageStore.loadData;
    readonly paramEditorInitialized = this.pageStore.paramEditorInitialized;
    readonly paramEditorDestroyed = this.pageStore.paramEditorDestroyed;
    readonly paramEditorValueChanged = this.pageStore.paramEditorValueChanged;
    readonly paramEditorEvent = this.pageStore.paramEditorEvent;
}