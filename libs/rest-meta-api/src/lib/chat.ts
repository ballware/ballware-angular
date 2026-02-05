import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AiChatApi, ApiError, ChatApiMessage } from '@ballware/meta-api';
import { BehaviorSubject, catchError, firstValueFrom, from, map, Observable, throwError } from 'rxjs';

class AiChatApiImpl implements AiChatApi {
  private readonly _hubConnection: HubConnection;
  private readonly _messageStream: ChatApiMessage[] = [];
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
      this._messageStream.push({ direction: 'in', message: message });
      this._messageStream$.next(this._messageStream);
    });
  }

  readonly connect = () => {
    return from(this._hubConnection.start()).pipe(
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

  readonly disconnect = () => {
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

  readonly sendMessage = (message: string) => {
    this._messageStream.push({ direction: 'out', message: message });
    this._messageStream$.next(this._messageStream);

    return from(this._hubConnection.send("Prompt", message));
  }

  get conversation$(): Observable<ChatApiMessage[]> {
    return this._messageStream$.asObservable();
  }
}

export function createAiChatApi(
  aiServiceBaseUrl: string,
  tokenFactory: () => Observable<string|undefined>
): AiChatApi {
  return new AiChatApiImpl(aiServiceBaseUrl, tokenFactory);
}
