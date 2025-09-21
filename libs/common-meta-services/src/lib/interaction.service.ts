import { InteractionService } from "@ballware/meta-services";
import { Observable, Subject, tap } from 'rxjs';

export class DefaultInteractionService implements InteractionService {

  get keyboardLine$(): Observable<string> {
    return this.keyboardLineSubject.asObservable().pipe(
      tap((line) => console.log('Interaction keyboard line', line))
    );
  }

  private lineTimer = 0;
  private lineBuffer = '';
  private readonly keyboardLineSubject = new Subject<string>();

  constructor() {
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
    if (!this.keyboardLineSubject.observed) {
      return;
    }

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
