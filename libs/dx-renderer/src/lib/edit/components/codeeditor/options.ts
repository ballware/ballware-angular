export interface CodeMirrorEditorOptions {
    prefixCode?: string[],
    suffixCode?: string[],
    snippets?: { label: string, info?: string, detail?: string, snippet: string }[] 
}