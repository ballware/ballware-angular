import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatMessage {
  author: string,
  message: string,
}

export interface ChatService {
  startChat(): void;
  endChat(): void;

  send(prompt: string): void;
  conversation$: Observable<ChatMessage[]>;
}

export const CHAT_SERVICE = new InjectionToken<ChatService>('Chat service');
