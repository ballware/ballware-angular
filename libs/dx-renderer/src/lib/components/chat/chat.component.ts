import { Component, DestroyRef, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxChatModule } from 'devextreme-angular';
import { CHAT_SERVICE, IDENTITY_SERVICE } from '@ballware/meta-services';
import { User, MessageEnteredEvent, Message } from 'devextreme/ui/chat';
import { map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { remark } from 'remark'
import gfm from 'remark-gfm'
import html from 'remark-html'

@Component({
  selector: 'ballware-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule, DxChatModule]
})
export class ChatComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly identityService = inject(IDENTITY_SERVICE);
  private readonly chatService = inject(CHAT_SERVICE);

  @Input() context!: string;

  public readonly me$ = this.chatService.me$.pipe(
    map((user) => {
      if (!user) {
        return undefined;
      }

      return {
        id: user.id,
        name: user.displayName
      } as User;
    })
  );

  public readonly writingUsers$ = this.chatService.writingUsers$.pipe(
    map((users) => {
      return users.map((user) => ({
        id: user.id,
        name: user.displayName
      } as User));
    })
  );

  public readonly conversation$ = this.chatService.conversation$.pipe(
    map((messages) => {
      return messages.map((message) => ({
        author: { id: message.author.id, name: message.author.displayName } as User,
        text: message.message
      } as Message));
    })
  );

  ngOnInit() {
    this.identityService.userName$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((userName) => {
      this.chatService.endChat();

        if (userName) {
          this.chatService.startChat(this.context, userName);
        }
    });

  }

  ngOnDestroy() {
    this.chatService.endChat();
  }

  messageEntered = (e: MessageEnteredEvent) => {
    if (e.message?.text) {
      this.chatService.send(e.message?.text);
    }
  }

  convertToHtml(text: string) {

    return remark()
      .use(gfm)
      .use(html)
      .processSync(text)
      .toString()
      .replace(
        /^\s*<p>(.*?)<\/p>\s*$/s,
        '$1'
      );
  }
}
