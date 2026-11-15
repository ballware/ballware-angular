import { AiChatApi } from '@ballware/meta-api';
import { Observable, of } from 'rxjs';

const chatUrl = (aiSignonUrl: string, aiChatBaseUrl: string) => (
  token: string,
  context: string
): Observable<string> => {

  const signonUrl = new URL(`${aiSignonUrl}/${encodeURIComponent(token)}`);

  const chatBaseUrl = aiChatBaseUrl.endsWith('/') ? aiChatBaseUrl.slice(0, -1) : aiChatBaseUrl;

  const targetUrl = new URL(`${chatBaseUrl}/${encodeURIComponent(context)}`);

  signonUrl.searchParams.append('redirect', targetUrl.toString());

  const result = signonUrl.toString();

  return of(result);
};

/**
 * Create adapter for building the LLM chat signon URL of ballware.llm.service
 * @param aiSignonUrl Base URL for the chat signon service
 * @param aiChatBaseUrl Base URL for the chat UI of the LLM service
 * @returns Adapter object providing chat URL operations
 */
export function createAiChatApi(
  aiSignonUrl: string,
  aiChatBaseUrl: string
): AiChatApi {
  return {
    chatUrl: chatUrl(aiSignonUrl, aiChatBaseUrl)
  };
}
