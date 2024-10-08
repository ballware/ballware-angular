import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, Inject } from '@angular/core';
import { RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';

@Component({
  selector: 'ballware-responsive-detector',
  templateUrl: './responsive-detector.component.html',
  styleUrls: [],
  imports: [CommonModule],
  standalone: true
})
export class ResponsiveDetectorComponent implements AfterViewInit {
  prefix = 'is-';
  sizes = [
    {
      id: SCREEN_SIZE.XS, name: 'xs', css: `d-block d-sm-none`
    },
    {
      id: SCREEN_SIZE.SM, name: 'sm', css: `d-none d-sm-block d-md-none`
    },
    {
      id: SCREEN_SIZE.MD, name: 'md', css: `d-none d-md-block d-lg-none`
    },
    {
      id: SCREEN_SIZE.LG, name: 'lg', css: `d-none d-lg-block d-xl-none`
    },
    {
      id: SCREEN_SIZE.XL, name: 'xl', css: `d-none d-xl-block`
    },
  ];

  constructor(private elementRef: ElementRef, @Inject(RESPONSIVE_SERVICE) private resizeSvc: ResponsiveService) { }

  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit(): void {
    this.detectScreenSize();
  }

  private detectScreenSize() {

    const currentSize = this.sizes.find(x => {
      // get the HTML element
      const el = this.elementRef.nativeElement.querySelector(`.${this.prefix}${x.id}`);

      // check its display property value
      const isVisible = window.getComputedStyle(el).display != 'none';

      return isVisible;
    });

    if (currentSize) {
      console.log(`Detected screen size: ${currentSize.id}`);
      this.resizeSvc.onResize(currentSize.id);
    }
  }

}
