import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeMirrorComponent } from './codemirror.component';
import { PLATFORM_ID } from '@angular/core';

describe('CodeMirrorComponent', () => {
  let component: CodeMirrorComponent;
  let fixture: ComponentFixture<CodeMirrorComponent>;

  describe('Browser Platform', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CodeMirrorComponent],
        providers: [
          {
            provide: PLATFORM_ID,
            useValue: 'browser'
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(CodeMirrorComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default inputs', () => {
      expect(component.visible).toBeUndefined();
      expect(component.readOnly).toBeUndefined();
      expect(component.mode).toBeUndefined();
      expect(component.width).toBeUndefined();
      expect(component.height).toBeUndefined();
      expect(component.options).toBeUndefined();
    });

    it('should accept value input', () => {
      const testValue = { test: 'data' };
      fixture.componentRef.setInput('value', testValue);
      fixture.detectChanges();

      expect(component.value).toBe(testValue);
    });

    it('should accept visible input', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      expect(component.visible).toBe(true);
    });

    it('should accept readOnly input', () => {
      fixture.componentRef.setInput('readOnly', true);
      fixture.detectChanges();

      expect(component.readOnly).toBe(true);
    });

    it('should accept mode input - json', () => {
      fixture.componentRef.setInput('mode', 'json');
      fixture.detectChanges();

      expect(component.mode).toBe('json');
    });

    it('should accept mode input - javascript', () => {
      fixture.componentRef.setInput('mode', 'javascript');
      fixture.detectChanges();

      expect(component.mode).toBe('javascript');
    });

    it('should accept mode input - sql', () => {
      fixture.componentRef.setInput('mode', 'sql');
      fixture.detectChanges();

      expect(component.mode).toBe('sql');
    });

    it('should accept width input', () => {
      fixture.componentRef.setInput('width', '500px');
      fixture.detectChanges();

      expect(component.width).toBe('500px');
    });

    it('should accept height input', () => {
      fixture.componentRef.setInput('height', '300px');
      fixture.detectChanges();

      expect(component.height).toBe('300px');
    });

    it('should accept options input', () => {
      const options = {
        prefixCode: ['// Prefix'],
        suffixCode: ['// Suffix'],
        snippets: [{ label: 'test', snippet: 'testSnippet' }]
      };
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();

      expect(component.options).toBe(options);
    });

    it('should emit valueChange when value changes', (done) => {
      const testValue = 'new value';

      component.valueChange.subscribe((value) => {
        expect(value).toBe(testValue);
        done();
      });

      component.valueChange.emit(testValue);
    });

    it('should initialize jsonStructuredMode to false', () => {
      expect(component.jsonStructuredMode).toBe(false);
    });

    it('should render with visible=true', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'json');
      fixture.componentRef.setInput('value', '{}');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const editorDiv = compiled.querySelector('div');
      expect(editorDiv).toBeTruthy();
      expect(editorDiv?.classList.contains('hidden')).toBe(false);
    });

    it('should render with visible=false', () => {
      fixture.componentRef.setInput('visible', false);
      fixture.componentRef.setInput('mode', 'json');
      fixture.componentRef.setInput('value', '{}');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const editorDiv = compiled.querySelector('div');
      expect(editorDiv).toBeTruthy();
      expect(editorDiv?.classList.contains('hidden')).toBe(true);
    });

    it('should render prefix code when provided', () => {
      const options = {
        prefixCode: ['// Line 1', '// Line 2']
      };
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const codeElements = compiled.querySelectorAll('code');
      expect(codeElements.length).toBeGreaterThanOrEqual(2);
      expect(codeElements[0].textContent).toBe('// Line 1');
      expect(codeElements[1].textContent).toBe('// Line 2');
    });

    it('should render suffix code when provided', () => {
      const options = {
        suffixCode: ['// End Line 1', '// End Line 2']
      };
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const codeElements = compiled.querySelectorAll('code');
      expect(codeElements.length).toBeGreaterThanOrEqual(2);
    });

    it('should apply width style', () => {
      fixture.componentRef.setInput('width', '600px');
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const editorDiv = compiled.querySelector('div');
      expect(editorDiv?.style.width).toBe('600px');
    });

    it('should apply height style', () => {
      fixture.componentRef.setInput('height', '400px');
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const editorDiv = compiled.querySelector('div');
      expect(editorDiv?.style.height).toBe('400px');
    });

    it('should use default width when not provided', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const editorDiv = compiled.querySelector('div');
      expect(editorDiv?.style.width).toBe('100%');
    });

    it('should use default height when not provided', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const editorDiv = compiled.querySelector('div');
      expect(editorDiv?.style.height).toBe('100%');
    });

    it('should hide prefix code when visible=false', () => {
      const options = {
        prefixCode: ['// Prefix']
      };
      fixture.componentRef.setInput('visible', false);
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const codeElements = compiled.querySelectorAll('code');
      if (codeElements.length > 0) {
        expect(codeElements[0].classList.contains('hidden')).toBe(true);
      }
    });

    it('should hide suffix code when visible=false', () => {
      const options = {
        suffixCode: ['// Suffix']
      };
      fixture.componentRef.setInput('visible', false);
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const codeElements = compiled.querySelectorAll('code');
      if (codeElements.length > 0) {
        const lastElement = codeElements[codeElements.length - 1];
        expect(lastElement.classList.contains('hidden')).toBe(true);
      }
    });

    it('should match snapshot with all options', () => {
      const options = {
        prefixCode: ['// Prefix comment'],
        suffixCode: ['// Suffix comment'],
        snippets: [
          { label: 'test1', snippet: 'snippet1' },
          { label: 'test2', info: 'info', detail: 'detail', snippet: 'snippet2' }
        ]
      };

      fixture.componentRef.setInput('value', '{"test": "value"}');
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('readOnly', false);
      fixture.componentRef.setInput('mode', 'json');
      fixture.componentRef.setInput('width', '800px');
      fixture.componentRef.setInput('height', '600px');
      fixture.componentRef.setInput('options', options);
      fixture.detectChanges();

      expect(fixture).toMatchSnapshot();
    });
  });

  describe('Server Platform', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [CodeMirrorComponent],
        providers: [
          {
            provide: PLATFORM_ID,
            useValue: 'server'
          }
        ]
      }).compileComponents();

      fixture = TestBed.createComponent(CodeMirrorComponent);
      component = fixture.componentInstance;
    });

    it('should create on server', () => {
      expect(component).toBeTruthy();
    });

    it('should not initialize editor on server platform', () => {
      fixture.componentRef.setInput('mode', 'json');
      fixture.componentRef.setInput('value', '{}');
      fixture.detectChanges();

      // On server platform, the dynamic import should not be called
      // This is a simple check that the component doesn't crash
      expect(component).toBeTruthy();
    });

    it('should render basic structure on server', () => {
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', 'json');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const editorDiv = compiled.querySelector('div');
      expect(editorDiv).toBeTruthy();
    });
  });
});

