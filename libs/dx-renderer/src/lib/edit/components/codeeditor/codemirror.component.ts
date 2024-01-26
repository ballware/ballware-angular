import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { ValueType } from "@ballware/meta-model";

import { snippetCompletion } from '@codemirror/autocomplete';
import { indentWithTab } from '@codemirror/commands';
import { javascript, javascriptLanguage } from '@codemirror/lang-javascript';
import { MSSQL, sql } from '@codemirror/lang-sql';
import { lintGutter, linter } from '@codemirror/lint';
import { search } from '@codemirror/search';
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { json5, json5Language, json5ParseLinter } from 'codemirror-json5';
import { parse, stringify } from "json5";

export interface CodeMirrorEditorOptions {
    prefixCode?: string[],
    suffixCode?: string[],
    snippets?: { label: string, info?: string, detail?: string, snippet: string }[] 
  }

@Component({
    selector: 'ballware-codemirror',
    templateUrl: './codemirror.component.html',
    styleUrls: ['./codemirror.component.scss']
})
export class CodeMirrorComponent implements AfterViewInit {
    @ViewChild('editor', { read: ViewContainerRef }) private editorHost?: ViewContainerRef;

    @Input() value!: unknown;
    @Input() readOnly!: boolean|null;
    @Input() mode!: 'json5' | 'javascript' | 'sqlserver';
    @Input() width: string|undefined;
    @Input() height: string|undefined;
    @Input() options: CodeMirrorEditorOptions|undefined;
    
    @Output() valueChange = new EventEmitter<ValueType>();

    jsonStructuredMode = false;

    ngAfterViewInit(): void {
        const theme = EditorView.theme({
            "&": { height: '100%' }
        });

        const extensions = [basicSetup, theme, search()];

        if (this.mode === 'json5') {
            extensions.push(json5());
            extensions.push(json5Language.data.of({
                autocomplete: this.options?.snippets?.map(s => snippetCompletion(s.snippet, { label: s.label, info: s.info, detail: s.detail })) ?? []
            }));           
            extensions.push(linter(json5ParseLinter()));
        } else if (this.mode === 'javascript') {
            extensions.push(javascript()); 
            extensions.push(javascriptLanguage.data.of({
                autocomplete: this.options?.snippets?.map(s => snippetCompletion(s.snippet, { label: s.label, info: s.info, detail: s.detail })) ?? []
            }));           
        } else if (this.mode === 'sqlserver') {
            extensions.push(sql({ dialect: MSSQL }));
            extensions.push(MSSQL.language.data.of({
                autocomplete: this.options?.snippets?.map(s => snippetCompletion(s.snippet, { label: s.label, info: s.info, detail: s.detail })) ?? []
            }));
        }

        if (this.readOnly) {
            extensions.push(EditorState.readOnly.of(true));
        } else {
            extensions.push(lintGutter());
            extensions.push(keymap.of([indentWithTab]));
            extensions.push(EditorView.updateListener.of((e) => {
                this.valueChange.emit(this.jsonStructuredMode ? parse(e.state.doc.toString()) : e.state.doc.toString());
            }));
        }

        this.jsonStructuredMode = this.mode === 'json5' && typeof(this.value) !== 'string';

        const state = EditorState.create({
            extensions: extensions,
            doc: (this.jsonStructuredMode ? stringify(this.value) : this.value as string) ?? ""            
        });
 
        if (this.editorHost?.element) {
            new EditorView({ parent: this.editorHost.element.nativeElement, state });
        }
    }
}