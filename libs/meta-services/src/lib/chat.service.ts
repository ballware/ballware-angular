import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatAuthor {
  id: string;
  displayName: string;
}

export interface ChatMessage {
  author: ChatAuthor,
  message: string,
}

export interface ChatService {
  startChat(displayName: string): void;
  endChat(): void;

  send(prompt: string): void;

  me$: Observable<ChatAuthor | undefined>;

  users$: Observable<ChatAuthor[]>;
  writingUsers$: Observable<ChatAuthor[]>;

  conversation$: Observable<ChatMessage[]>;
}

export const CHAT_SERVICE = new InjectionToken<ChatService>('Chat service');
