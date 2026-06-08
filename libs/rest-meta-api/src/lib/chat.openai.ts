import { AiChatApi, ApiError, ChatApiAuthor, ChatApiMessage } from '@ballware/meta-api';
import { BehaviorSubject, catchError, firstValueFrom, from, map, Observable, throwError } from 'rxjs';
import OpenAI from 'openai';

class OpenAiChatApi implements AiChatApi {
  private readonly _client: OpenAI;

  private _context: string|undefined;
  private _user: ChatApiAuthor|undefined;
  private readonly _bot: ChatApiAuthor = { id: 'bot', displayName: 'ballware' };

  private readonly _users$ = new BehaviorSubject<ChatApiAuthor[]>([]);
  private readonly _writingUsers$ = new BehaviorSubject<ChatApiAuthor[]>([]);
  private readonly _messageStream$ = new BehaviorSubject<ChatApiMessage[]>([]);

  constructor(private readonly aiServiceBaseUrl: string, private readonly tokenFactory: () => Observable<string|undefined>) {
    this._client = new OpenAI({
      apiKey: async () => await firstValueFrom(this.tokenFactory().pipe(map((token) => token ?? ''))),
      baseURL: `${this.aiServiceBaseUrl}/v1`,
      dangerouslyAllowBrowser: true
    });
  }

  readonly connect = (context: string, userId: string, displayName: string) => {
    this._context = context;
    this._user = { id: userId, displayName };
    this._users$.next([this._user, this._bot]);
    this._writingUsers$.next([]);
    this._messageStream$.next([]);

    return from(Promise.resolve(this._user));
  }

  readonly disconnect = () => {
    this._user = undefined;
    this._users$.next([]);
    this._writingUsers$.next([]);
    this._messageStream$.next([]);

    return from(Promise.resolve());
  }

  readonly sendMessage = (author: ChatApiAuthor, message: string) => {
    const userMessage: ChatApiMessage = { author, direction: 'out', message };
    const conversation = [...this._messageStream$.getValue(), userMessage];

    this._writingUsers$.next([ this._bot ]);
    this._messageStream$.next(conversation);

    if (!this._context) {
      return throwError(() => ({ message: 'Context is required for message sending' }));
    }

    return from(this._client.chat.completions.create({
      model: this._context,
      messages: this.toOpenAiMessages(conversation)
    })).pipe(
      map((completion) => {
        const response = completion.choices[0]?.message?.content ?? '';

        this._writingUsers$.next([]);
        this._messageStream$.next([...this._messageStream$.getValue(), {
          author: this._bot,
          direction: 'in',
          message: response
        }]);
      }),
      catchError((error: Error) => {
        this._writingUsers$.next([]);

        return throwError(() => this.toApiError(error));
      })
    );
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

  private readonly toOpenAiMessages = (conversation: ChatApiMessage[]): OpenAI.ChatCompletionMessageParam[] => {
    return conversation.map((message) => ({
      role: message.direction === 'out' ? 'user' : 'assistant',
      content: message.message
    }));
  }

  private readonly toApiError = (error: Error): ApiError => {
    const maybeApiError = error as Error & { status?: number, code?: string };

    return {
      status: maybeApiError.status ?? 0,
      statusText: maybeApiError.code ?? error.name,
      message: error.message,
      payload: {
        Message: error.message
      }
    };
  }
}

export function createOpenAiChatApi(
  aiServiceBaseUrl: string,
  tokenFactory: () => Observable<string|undefined>
): AiChatApi {
  return new OpenAiChatApi(aiServiceBaseUrl, tokenFactory);
}
