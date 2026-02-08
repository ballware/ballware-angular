import { ChatService, ChatMessage } from '@ballware/meta-services';
import { AiChatApi, ChatApiAuthor } from '@ballware/meta-api';
import { BehaviorSubject, map } from 'rxjs';

export class DefaultChatService implements ChatService {

  private readonly _me = new BehaviorSubject<ChatApiAuthor|undefined>(undefined);

  public me$ = this._me.pipe(
    map(user => user ? { id: user.id, displayName: user.displayName } : undefined)
  );

  constructor(private readonly chatApi: AiChatApi) {
  }

  readonly startChat = (displayName: string): void => {
    this.chatApi.connect('user', displayName).subscribe({
      next: (user: ChatApiAuthor) => {
        this._me.next(user);
        console.log('Chat connected for user', user);
      },
      error: (error) => {
        console.log('Error connecting chat', error);
      }
    });
  }

  readonly endChat = (): void => {
    const currentUser = this._me.getValue();

    if (!currentUser) {
      console.log('No user connected to chat');
      return;
    }

    this.chatApi.disconnect(currentUser).subscribe({
      next: () => {
        this._me.next(undefined);
        console.log('Chat disconnected');
      },
      error: (error) => {
        console.log('Error disconnecting chat', error);
      }
    });
  }

  readonly send = (prompt: string): void => {
    const currentUser = this._me.getValue();

    if (!currentUser) {
      console.log('No user connected to chat');
      return;
    }

    this.chatApi.sendMessage(currentUser, prompt).subscribe({
      next: () => {
        console.log('Message sent');
      },
      error: (error) => {
        console.log('Error sending message', error);
      }
    });
  }

  get users$() {
    return this.chatApi.users$.pipe(
      map(users => users.map(u => ({
        id: u.id,
        displayName: u.displayName
      })))
    );
  }

  get writingUsers$() {
    return this.chatApi.writingUsers$.pipe(
      map(users => users.map(u => ({
        id: u.id,
        displayName: u.displayName
      })))
    );
  }

  get conversation$() {
    return this.chatApi.conversation$.pipe(
      map((messages) => messages.map(m => ({
        author: { id: m.author.id, displayName: m.author.displayName },
        message: m.message
      } as ChatMessage)))
    );
  }
}
