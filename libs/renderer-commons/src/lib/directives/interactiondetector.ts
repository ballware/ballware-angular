import { Directive, HostListener, Inject } from "@angular/core";
import { INTERACTION_SERVICE, InteractionService } from "@ballware/meta-services";

@Directive({
  standalone: true
})
export class InteractionDetector {
  
  constructor(@Inject(INTERACTION_SERVICE) private readonly interactionService: InteractionService) {
      
  }

  @HostListener('window:keypress', ['$event'])
  onKeypress(event: KeyboardEvent) {
    this.interactionService.triggerKeyPress(event.key);
  }
}
