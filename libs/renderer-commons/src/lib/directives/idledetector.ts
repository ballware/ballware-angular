import { Directive, Inject, OnDestroy, OnInit, PLATFORM_ID } from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { IDLE_SERVICE, IdleService } from "@ballware/meta-services";

@Directive({
  standalone: true
})
export class IdleDetector implements OnInit, OnDestroy {

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: object,
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(IDLE_SERVICE) private readonly idleService: IdleService
  ) {
    this.triggerBusy = this.triggerBusy.bind(this);
  }

  triggerBusy() {
    this.idleService.renewBusy();
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Registering busy events');
      this.document.addEventListener('mousemove', this.triggerBusy);
      this.document.addEventListener('mousedown', this.triggerBusy);
      this.document.addEventListener('keypress', this.triggerBusy);
      this.document.addEventListener('touchstart', this.triggerBusy);

      this.idleService.renewBusy();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log('Unregistering busy events');
      this.document.removeEventListener('mousemove', this.triggerBusy);
      this.document.removeEventListener('mousedown', this.triggerBusy);
      this.document.removeEventListener('keypress', this.triggerBusy);
      this.document.removeEventListener('touchstart', this.triggerBusy);
    }
  }
}
