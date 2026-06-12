import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AiChatApi, ApiError, ChatApiMessage, ChatApiAuthor } from '@ballware/meta-api';
import { BehaviorSubject, catchError, firstValueFrom, from, map, Observable, throwError } from 'rxjs';

class SignalrChatApi implements AiChatApi {
  private readonly _hubConnection: HubConnection;

  private _user: ChatApiAuthor|undefined;
  private readonly _bot: ChatApiAuthor = { id: 'bot', displayName: 'ballware' };

  private readonly _users$ = new BehaviorSubject<ChatApiAuthor[]>([]);
  private readonly _writingUsers$ = new BehaviorSubject<ChatApiAuthor[]>([]);
  private readonly _messageStream$ = new BehaviorSubject<ChatApiMessage[]>([]);

  constructor(private readonly aiServiceBaseUrl: string,
              private readonly tokenFactory: () => Observable<string|undefined>) {
    this._hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.aiServiceBaseUrl}/hubs/chat`, {
        accessTokenFactory(): string | Promise<string> {
          return firstValueFrom(tokenFactory().pipe(map((token) => token ?? '')));
        }
      })
      .withAutomaticReconnect()
      .build();

    this._hubConnection.on("Response", (message: string) => {
      this._writingUsers$.next([]);
      this._messageStream$.next([...this._messageStream$.getValue(), { author: this._bot, direction: 'in', message: message }]);
    });
  }

  readonly connect = (context: string, userId: string, displayName: string) => {

    this._user = { id: userId, displayName };
    this._users$.next([this._user, this._bot]);
    this._writingUsers$.next([]);

    return from(this._hubConnection.start()).pipe(
      catchError((error: Error) => {
        return throwError(() => ({
          status: 0,
          statusText: error.name,
          message: error.message,
          payload: error.stack
        } as ApiError))
      }),
      map(() => ({
        id: userId,
        displayName
      }))
    );
  }

  readonly disconnect = () => {
    this._users$.next([]);
    this._writingUsers$.next([]);

    return from(this._hubConnection.stop()).pipe(
      catchError((error: Error) => {
        return throwError(() => ({
          status: 0,
          statusText: error.name,
          message: error.message,
          payload: error.stack
        } as ApiError))
      })
    );
  }

  readonly sendMessage = (author: ChatApiAuthor, message: string) => {

    this._writingUsers$.next([ this._bot ]);
    this._messageStream$.next([...this._messageStream$.getValue(), { author, direction: 'out', message }]);

    return from(this._hubConnection.send("Prompt", message));
  }

  get users$(): Observable<ChatApiAuthor[]> {
    return this._users$.asObservable();
  }

  get writingUsers$(): Observable<ChatApiAuthor[]> {
    return this._writingUsers$.asObservable();
  }

  get conversation$(): Observable<ChatApiMessage[]> {
    return this._messageStream$.asObservable();
  }
}

export function createAiSignalrChatApi(
  aiServiceBaseUrl: string,
  tokenFactory: () => Observable<string|undefined>
): AiChatApi {
  return new SignalrChatApi(aiServiceBaseUrl, tokenFactory);
}
