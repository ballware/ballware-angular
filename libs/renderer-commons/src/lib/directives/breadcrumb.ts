import { Directive, Optional, SkipSelf } from '@angular/core';

@Directive({
  standalone: true
})
export class Breadcrumb {
  private identifier: string = 'anonymous';

  constructor(
    @Optional() @SkipSelf() readonly parent?: Breadcrumb
  ) {}

  setIdentifier(identifier: string): void {
    this.identifier = identifier;
  }

  get path(): string[] {
    return this.parent? [...this.parent.path, this.identifier] : [this.identifier];
  }

  get pathString(): string {
    return this.path.join('.');
  }
}
