import { AiChatApi, ApiError, ChatApiAuthor, ChatApiMessage } from '@ballware/meta-api';
import { BehaviorSubject, catchError, firstValueFrom, from, map, Observable, throwError } from 'rxjs';
import OpenAI from 'openai';
import type {
  EasyInputMessage,
  Response,
  ResponseCreateParamsStreaming,
  ResponseFunctionToolCall,
  ResponseInputItem,
  ResponseOutputMessage,
  ResponseReasoningItem
} from 'openai/resources/responses/responses';

class OpenAiCompletionsApi implements AiChatApi {
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

class OpenAiResponsesContext {
  private static readonly maxPreviousResponseIdLength = 64;

  private _lastResponseId: string|undefined;
  private _conversationItems: EasyInputMessage[] = [];
  private _reasoningItems: ResponseReasoningItem[] = [];

  readonly clear = () => {
    this._lastResponseId = undefined;
    this._conversationItems = [];
    this._reasoningItems = [];
  }

  readonly createParams = (model: string, userMessage: EasyInputMessage): ResponseCreateParamsStreaming => {
    if (this._lastResponseId) {
      return {
        model,
        input: [userMessage],
        previous_response_id: this._lastResponseId,
        stream: true
      };
    }

    return {
      model,
      input: this.toStatelessInput(userMessage),
      stream: true
    };
  }

  readonly appendResponse = (userMessage: EasyInputMessage, response: Response, responseText: string) => {
    this._lastResponseId = this.toPreviousResponseId(response.id);
    this._conversationItems = [
      ...this._conversationItems,
      userMessage,
      this.toAssistantMessage(responseText)
    ];
    this._reasoningItems = this.toUniqueReasoningItems([
      ...this._reasoningItems,
      ...this.toReasoningItems(response)
    ]);
  }

  private readonly toStatelessInput = (userMessage: EasyInputMessage): ResponseInputItem[] => {
    return [
      ...this._reasoningItems,
      ...this._conversationItems,
      userMessage
    ];
  }

  private readonly toPreviousResponseId = (responseId: string): string|undefined => {
    return responseId.length <= OpenAiResponsesContext.maxPreviousResponseIdLength
      ? responseId
      : undefined;
  }

  private readonly toAssistantMessage = (responseText: string): EasyInputMessage => {
    return {
      role: 'assistant',
      content: responseText
    };
  }

  private readonly toReasoningItems = (response: Response): ResponseReasoningItem[] => {
    return response.output.filter((outputItem): outputItem is ResponseReasoningItem =>
      outputItem.type === 'reasoning');
  }

  private readonly toUniqueReasoningItems = (items: ResponseReasoningItem[]): ResponseReasoningItem[] => {
    const itemIds = new Set<string>();

    return items.filter((item) => {
      if (itemIds.has(item.id)) {
        return false;
      }

      itemIds.add(item.id);
      return true;
    });
  }
}

class OpenAiResponsesApi implements AiChatApi {
  private readonly _client: OpenAI;

  private _context: string|undefined;
  private _user: ChatApiAuthor|undefined;
  private readonly _bot: ChatApiAuthor = { id: 'bot', displayName: 'ballware' };

  private readonly _users$ = new BehaviorSubject<ChatApiAuthor[]>([]);
  private readonly _writingUsers$ = new BehaviorSubject<ChatApiAuthor[]>([]);
  private readonly _messageStream$ = new BehaviorSubject<ChatApiMessage[]>([]);
  private readonly _responsesContext = new OpenAiResponsesContext();

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
    this._responsesContext.clear();

    return from(Promise.resolve(this._user));
  }

  readonly disconnect = () => {
    this._user = undefined;
    this._responsesContext.clear();
    this._users$.next([]);
    this._writingUsers$.next([]);
    this._messageStream$.next([]);

    return from(Promise.resolve());
  }

  readonly sendMessage = (author: ChatApiAuthor, message: string) => {
    const userMessage: ChatApiMessage = { author, direction: 'out', message };
    const openAiInput = this.toOpenAiInput(message);
    const conversation = [...this._messageStream$.getValue(), userMessage];

    this._writingUsers$.next([ this._bot ]);
    this._messageStream$.next(conversation);

    if (!this._context) {
      return throwError(() => ({ message: 'Context is required for message sending' }));
    }

    return from(this.createOpenAiStreamingResponse(openAiInput)).pipe(
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

  private readonly toOpenAiCreateParams = (message: EasyInputMessage): ResponseCreateParamsStreaming => {
    return this._responsesContext.createParams(this._context!, message);
  }

  private readonly toOpenAiInput = (message: string): EasyInputMessage => {
    return {
      role: 'user',
      content: message
    };
  }

  private readonly createOpenAiStreamingResponse = async (message: EasyInputMessage): Promise<void> => {
    const stream = await this._client.responses.create(this.toOpenAiCreateParams(message));
    let responseText = '';
    let completedResponse: Response|undefined;

    for await (const event of stream) {
      switch (event.type) {
        case 'response.output_text.delta':
          responseText += event.delta;
          this.updateStreamingBotMessage(responseText);
          break;
        case 'response.completed':
          completedResponse = event.response;
          break;
        case 'response.failed':
          throw new Error(event.response.error?.message ?? 'Response failed');
        case 'response.incomplete': {
          const incompleteReason = event.response.incomplete_details?.reason
            ? ` (${event.response.incomplete_details.reason})`
            : '';

          throw new Error(`Response is incomplete${incompleteReason}`);
        }
      }
    }

    if (!completedResponse) {
      throw new Error('Response stream completed without final response');
    }

    this.assertCompletedResponse(completedResponse);

    const finalResponseText = responseText || this.toResponseText(completedResponse);

    if (!finalResponseText.trim() && this.hasFunctionToolCalls(completedResponse)) {
      this.updateStreamingBotMessage(this.toMissingToolResultMessage(completedResponse));
      this._writingUsers$.next([]);
      return;
    }

    this.assertResponseText(finalResponseText);
    this.updateStreamingBotMessage(finalResponseText);
    this._responsesContext.appendResponse(message, completedResponse, finalResponseText);
    this._writingUsers$.next([]);
  }

  private readonly updateStreamingBotMessage = (message: string) => {
    const conversation = this._messageStream$.getValue();
    const lastMessage = conversation[conversation.length - 1];

    if (lastMessage?.author.id === this._bot.id && lastMessage.direction === 'in') {
      this._messageStream$.next([
        ...conversation.slice(0, -1),
        {
          ...lastMessage,
          message
        }
      ]);

      return;
    }

    this._messageStream$.next([
      ...conversation,
      {
        author: this._bot,
        direction: 'in',
        message
      }
    ]);
  }

  private readonly assertCompletedResponse = (response: Response) => {
    if (response.error) {
      throw new Error(response.error.message);
    }

    if (response.status && response.status !== 'completed') {
      const incompleteReason = response.incomplete_details?.reason
        ? ` (${response.incomplete_details.reason})`
        : '';

      throw new Error(`Response is ${response.status}${incompleteReason}`);
    }
  }

  private readonly toResponseText = (response: Response): string => {
    if (response.output_text) {
      return response.output_text;
    }

    return response.output
      .filter((outputItem): outputItem is ResponseOutputMessage => outputItem.type === 'message')
      .flatMap((message) => message.content)
      .map((content) => content.type === 'output_text' ? content.text : content.refusal)
      .join('');
  }

  private readonly hasFunctionToolCalls = (response: Response): boolean => {
    return response.output.some((outputItem) => outputItem.type === 'function_call');
  }

  private readonly toMissingToolResultMessage = (response: Response): string => {
    const functionNames = response.output
      .filter((outputItem): outputItem is ResponseFunctionToolCall => outputItem.type === 'function_call')
      .map((functionCall) => functionCall.name)
      .filter((functionName, index, functionNames) => functionNames.indexOf(functionName) === index);

    return functionNames.length
      ? `Die Antwort enthält nur Tool-Aufrufe, aber das Backend hat keine finale Textantwort geliefert: ${functionNames.join(', ')}.`
      : 'Die Antwort enthält nur Tool-Aufrufe, aber das Backend hat keine finale Textantwort geliefert.';
  }

  private readonly assertResponseText = (responseText: string) => {
    if (!responseText.trim()) {
      throw new Error('Response did not contain output text');
    }

    if (this.isHttpHeaderDump(responseText)) {
      throw new Error('Response did not contain a JSON payload');
    }
  }

  private readonly isHttpHeaderDump = (responseText: string): boolean => {
    return /^HTTP\/\d(?:\.\d)? \d{3}/.test(responseText.trimStart())
      && /(?:^|\n)Content-Type:/i.test(responseText);
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

export function createOpenAiCompletionsApi(
  aiServiceBaseUrl: string,
  tokenFactory: () => Observable<string|undefined>
): AiChatApi {
  return new OpenAiCompletionsApi(aiServiceBaseUrl, tokenFactory);
}

export function createOpenAiResponsesApi(
  aiServiceBaseUrl: string,
  tokenFactory: () => Observable<string|undefined>
): AiChatApi {
  return new OpenAiResponsesApi(aiServiceBaseUrl, tokenFactory);
}
