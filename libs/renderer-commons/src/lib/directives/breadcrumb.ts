import {
  Directive,
  HostBinding,
  Input,
  OnDestroy,
  Optional,
  SkipSelf,
} from '@angular/core';

@Directive({
  selector: '[ballwareBreadcrumb]',
  standalone: true,
})
export class Breadcrumb implements OnDestroy {
  @Input('ballwareBreadcrumb') identifier = '';
  private children: Array<Breadcrumb|undefined> = [];

  @HostBinding('attr.data-testid') get testId() {
    return this.pathString;
  }

  constructor(@Optional() @SkipSelf() private readonly parent?: Breadcrumb) {
    if (parent) {
      const autoIdentifier = parent.addChild(this);

      this.identifier = this.identifier || autoIdentifier;
    }
  }

  ngOnDestroy() {
    if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  addChild(child: Breadcrumb) {
    this.children.push(child);

    return this.children.length.toString();
  }

  removeChild(child: Breadcrumb) {
    const childIndex = this.children.indexOf(child);

    if (childIndex > -1) {
      this.children[childIndex] = undefined;
    }
  }

  sibblingIndex(child: Breadcrumb) {
    const sibblings = this.children.filter(b => child.identifier === b?.identifier);

    return sibblings.indexOf(child);
  }

  setIdentifier(identifier: string): void {
    this.identifier = identifier;
  }

  get path(): string[] {
    const sibblingIndex = this.parent ? this.parent.sibblingIndex(this) : 0;

    return this.parent
      ? [...this.parent.path, this.identifier, sibblingIndex.toString()]
      : [this.identifier];
  }

  get pathString(): string {
    return this.path.join('.');
  }
}
