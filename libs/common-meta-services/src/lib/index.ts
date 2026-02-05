import { DefaultResponsiveService } from './responsive.service';
import { DefaultIdleService } from './idle.service';
import { DefaultInteractionService } from './interaction.service';
import { CHAT_SERVICE, IDLE_SERVICE, INTERACTION_SERVICE, RESPONSIVE_SERVICE } from '@ballware/meta-services';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DefaultChatService } from './chat.service';
import { AI_CHAT_API, AiChatApi } from '@ballware/meta-api';

export function provideCommonMetaServices(): EnvironmentProviders {
  return makeEnvironmentProviders(
    [
      {
        provide: RESPONSIVE_SERVICE,
        useFactory: (bp: BreakpointObserver) => new DefaultResponsiveService(bp),
        deps: [BreakpointObserver]
      },
      {
        provide: IDLE_SERVICE,
        useFactory: () => new DefaultIdleService(),
        deps: []
      },
      {
        provide: INTERACTION_SERVICE,
        useFactory: () => new DefaultInteractionService(),
        deps: []
      },
      {
        provide: CHAT_SERVICE,
        useFactory: (chatApi: AiChatApi) => new DefaultChatService(chatApi),
        deps: [AI_CHAT_API]
      }
    ]
  );
}
