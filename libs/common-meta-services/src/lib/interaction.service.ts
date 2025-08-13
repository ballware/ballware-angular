import { InteractionService } from "@ballware/meta-services";
import { Observable, Subject } from "rxjs";

export class DefaultInteractionService implements InteractionService {

  get keyboardLine$(): Observable<string> {
    return this.keyboardLineSubject.asObservable();
  }

  private lineTimer = 0;
  private lineBuffer = '';
  private readonly keyboardLineSubject = new Subject<string>();
  
  constructor() {
    this.keyboardLine$
        .subscribe((line) => console.log('Interaction keyboard line', line));

    this.resetLine = this.resetLine.bind(this);
  }

  renewLineTimer() {
    if (this.lineTimer > 0) {
      clearTimeout(this.lineTimer); 
      this.lineTimer = 0;
    }

    this.lineTimer = setTimeout(() => this.resetLine(), 1000);
  }

  resetLine() {
    this.lineBuffer = '';

    if (this.lineTimer > 0) {
      clearTimeout(this.lineTimer);   
      this.lineTimer = 0;              
    }
  }

  triggerKeyPress(key: string): void {
    if (key === "Enter") {
      if (this.lineBuffer.length) {
        this.keyboardLineSubject.next(this.lineBuffer);

        this.resetLine();
      }        
    } else {
      this.lineBuffer += key;
      
      this.renewLineTimer();
    }
  }
}
