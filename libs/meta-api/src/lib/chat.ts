import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatApiAuthor {
  id: string;
  displayName: string;
}

export interface ChatApiMessage {
  author: ChatApiAuthor,
  direction: 'in' | 'out',
  message: string;
}

export interface AiChatApi {
  connect(userId: string, displayName: string): Observable<ChatApiAuthor>;
  disconnect(user: ChatApiAuthor): Observable<void>;

  sendMessage(user: ChatApiAuthor, message: string): Observable<void>;

  users$: Observable<ChatApiAuthor[]>;
  writingUsers$: Observable<ChatApiAuthor[]>;
  conversation$: Observable<ChatApiMessage[]>;
}

export const AI_CHAT_API = new InjectionToken<AiChatApi>('AI chat api');
