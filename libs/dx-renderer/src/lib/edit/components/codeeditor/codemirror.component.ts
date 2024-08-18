import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, EventEmitter, Input, Output, ViewChild, ViewContainerRef } from "@angular/core";
import { ValueType } from "@ballware/meta-model";


import { CodeMirrorEditorOptions } from "./options";

@Component({
    selector: 'ballware-codemirror',
    templateUrl: './codemirror.component.html',
    styleUrls: ['./codemirror.component.scss'],
    imports: [CommonModule],
    standalone: true
})
export class CodeMirrorComponent implements AfterViewInit {
    @ViewChild('editor', { read: ViewContainerRef }) private editorHost?: ViewContainerRef;

    @Input() value!: unknown;
    @Input() visible!: boolean|null;
    @Input() readOnly!: boolean|null;
    @Input() mode!: 'json' | 'object' | 'javascript' | 'sqlserver';
    @Input() width: string|undefined;
    @Input() height: string|undefined;
    @Input() options: CodeMirrorEditorOptions|undefined;
    
    @Output() valueChange = new EventEmitter<ValueType>();

    jsonStructuredMode = false;

    ngAfterViewInit(): void {
        import('./codemirror').then(({ initialize }) => {
            if (this.editorHost?.element) {
                initialize(this.editorHost.element.nativeElement, this.mode, this.value, this.readOnly ?? false, this.options, (value) => {
                    this.valueChange.emit(value);
                });
            }
        });        
    }
}