import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatApiMessage {
  direction: 'in' | 'out',
  message: string;
}

export interface AiChatApi {
  connect(): Observable<void>;
  disconnect(): Observable<void>;

  sendMessage(message: string): Observable<void>;

  conversation$: Observable<ChatApiMessage[]>;
}

export const AI_CHAT_API = new InjectionToken<AiChatApi>('AI chat api');
