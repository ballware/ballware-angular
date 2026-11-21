import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface AiChatApi {
  chatUrl(token: string, context: string): Observable<string>;
}

export const AI_CHAT_API = new InjectionToken<AiChatApi>('AI chat api');
