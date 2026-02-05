import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxChatModule } from 'devextreme-angular';
import { CHAT_SERVICE, ChatService } from '@ballware/meta-services';
import { MessageEnteredEvent, Message } from 'devextreme/ui/chat';
import { map } from 'rxjs';

@Component({
  selector: 'ballware-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [CommonModule, DxChatModule]
})
export class ChatComponent implements OnInit, OnDestroy {
  constructor(@Inject(CHAT_SERVICE) private readonly chatService: ChatService) {}

  ngOnInit() {
    this.chatService.startChat();
  }

  ngOnDestroy() {
    this.chatService.endChat();
  }

  messageEntered = (e: MessageEnteredEvent) => {
    if (e.message?.text) {
      this.chatService.send(e.message?.text);
    }
  }

  get conversation$() {
    return this.chatService.conversation$.pipe(
      map((messages) => {
        return messages.map((message) => ({
          author: message.author,
          text: message.message
        } as Message));
      })
    );
  }

}
