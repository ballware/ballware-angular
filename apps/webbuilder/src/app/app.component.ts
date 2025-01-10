import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { ApplicationComponent } from '@ballware/dx-renderer';

@Component({
  standalone: true,
  imports: [CommonModule, ApplicationComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'webbuilder';
}
