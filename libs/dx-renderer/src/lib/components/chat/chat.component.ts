import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AI_CHAT_API, AiChatApi } from '@ballware/meta-api';
import { IDENTITY_SERVICE } from '@ballware/meta-services';
import { combineLatest, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'ballware-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule]
})
export class ChatComponent {
  private readonly identityService = inject(IDENTITY_SERVICE);
  private readonly chatApi = inject(AI_CHAT_API);
  private readonly domSanitizer = inject(DomSanitizer);

  @Input() context!: string;

  public readonly url$: Observable<SafeUrl|null> = combineLatest([this.identityService.idToken$])
    .pipe(switchMap(([idToken]) => (idToken
      ? this.chatApi.chatUrl(idToken, this.context)
          .pipe(map((url) => {
            return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
          }))
      : of(null))));
}
