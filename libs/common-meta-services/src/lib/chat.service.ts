import { ChatService, ChatMessage } from '@ballware/meta-services';
import { AiChatApi } from '@ballware/meta-api';
import { map } from 'rxjs';

export class DefaultChatService implements ChatService {
  constructor(private readonly chatApi: AiChatApi) {
  }

  readonly startChat = (): void => {
    this.chatApi.connect().subscribe({
      next: () => {
        console.log('Chat connected');
      },
      error: (error) => {
        console.log('Error connecting chat', error);
      }
    });
  }

  readonly endChat = (): void => {
    this.chatApi.disconnect().subscribe({
      next: () => {
        console.log('Chat disconnected');
      },
      error: (error) => {
        console.log('Error disconnecting chat', error);
      }
    });
  }

  readonly send = (prompt: string): void => {
    this.chatApi.sendMessage(prompt).subscribe({
      next: () => {
        console.log('Message sent');
      },
      error: (error) => {
        console.log('Error sending message', error);
      }
    });
  }

  get conversation$() {
    return this.chatApi.conversation$.pipe(
      map((messages) => messages.map(m => ({
        author: m.direction === 'in' ? 'bot' : 'user',
        message: m.message
      } as ChatMessage)))
    );
  }
}
