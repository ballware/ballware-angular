import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from '../../components';
import { TOOLBAR_SERVICE, ToolbarService } from '@ballware/meta-services';

@Component({
  selector: 'ballware-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['chat-page.component.scss'],
  imports: [CommonModule, ChatComponent]
})
export class ChatPageComponent {

  constructor(@Inject(TOOLBAR_SERVICE) private readonly toolbarService: ToolbarService) {
    this.toolbarService.setPage('Chat');
  }
}
