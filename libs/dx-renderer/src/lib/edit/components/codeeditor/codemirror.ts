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
import { js_beautify } from "js-beautify";
import { parse, stringify } from "json5";
import { CodeMirrorEditorOptions } from './options';
import { ValueType } from '@ballware/meta-model';

export function initialize(targetElement: Element, mode: 'json' | 'object' | 'javascript' | 'sqlserver', value: unknown, readOnly: boolean, options: CodeMirrorEditorOptions|undefined, valueChanged: (value: ValueType) => void) {

    const theme = EditorView.theme({
        "&": { height: '100%' }
    });

    const jsonStructuredMode = mode === 'json' && typeof(value) !== 'string';

    const extensions = [basicSetup, theme, search()];

    if (mode === 'json') {
        extensions.push(json5());
        extensions.push(json5Language.data.of({
            autocomplete: options?.snippets?.map(s => snippetCompletion(s.snippet, { label: s.label, info: s.info, detail: s.detail })) ?? []
        }));           
        extensions.push(linter(json5ParseLinter()));
    } else if (mode === 'javascript') {
        extensions.push(javascript()); 
        extensions.push(javascriptLanguage.data.of({
            autocomplete: options?.snippets?.map(s => snippetCompletion(s.snippet, { label: s.label, info: s.info, detail: s.detail })) ?? []
        }));           
    } else if (mode === 'sqlserver') {
        extensions.push(sql({ dialect: MSSQL }));
        extensions.push(MSSQL.language.data.of({
            autocomplete: options?.snippets?.map(s => snippetCompletion(s.snippet, { label: s.label, info: s.info, detail: s.detail })) ?? []
        }));
    }

    if (readOnly) {
        extensions.push(EditorState.readOnly.of(true));
    } else {
        extensions.push(lintGutter());
        extensions.push(keymap.of([indentWithTab]));
        extensions.push(EditorView.updateListener.of((e) => {
            if (e.docChanged) {
                valueChanged(jsonStructuredMode ? parse(e.state.doc.toString()) : e.state.doc.toString());
            }                
        }));
    }

    

    const state = EditorState.create({
        extensions: extensions,
        doc: (jsonStructuredMode ? js_beautify(stringify(value)) : value as string) ?? ""            
    });
 
    
    new EditorView({ parent: targetElement, state });    
}