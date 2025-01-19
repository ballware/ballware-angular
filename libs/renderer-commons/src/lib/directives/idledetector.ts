import { Directive, Inject, OnDestroy, OnInit } from "@angular/core";
import { IDLE_SERVICE, IdleService } from "@ballware/meta-services";

@Directive({
  standalone: true
})
export class IdleDetector implements OnInit, OnDestroy {
  
  constructor(@Inject(IDLE_SERVICE) private readonly idleService: IdleService) {
    this.triggerBusy = this.triggerBusy.bind(this);
  }

  triggerBusy() {
    this.idleService.renewBusy();
  }

  ngOnInit(): void {
    console.log('Registering busy events');
    document.addEventListener('mousemove', this.triggerBusy);
    document.addEventListener('mousedown', this.triggerBusy); 
    document.addEventListener('keypress', this.triggerBusy);
    document.addEventListener('touchstart', this.triggerBusy);

    this.idleService.renewBusy();
  }

  ngOnDestroy(): void {
    console.log('Unregistering busy events');
    document.removeEventListener('mousemove', this.triggerBusy);
    document.removeEventListener('mousedown', this.triggerBusy); 
    document.removeEventListener('keypress', this.triggerBusy);
    document.removeEventListener('touchstart', this.triggerBusy);
  }
}