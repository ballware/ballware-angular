import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener } from '@angular/core';
import { ResponsiveService, SCREEN_SIZE } from '@ballware/common-services';

@Component({
  selector: 'lib-ballware-commons-responsive-detector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './responsive-detector.component.html',
  styleUrls: ['./responsive-detector.component.scss']
})
export class BallwareResponsiveDetectorComponent implements AfterViewInit {
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

  constructor(private elementRef: ElementRef, private resizeService: ResponsiveService) { }

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
      setTimeout(() => this.resizeService.onResize(currentSize.id));
    }
  }

}
