import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DxDrawerModule, DxListModule } from 'devextreme-angular';
import { ItemClickEvent } from 'devextreme/ui/list';

@Component({
  selector: 'lib-builder-navigation',
  standalone: true,
  imports: [CommonModule, DxDrawerModule, DxListModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css',
})
export class NavigationComponent {
    @Input() opened!: boolean;

    @Output() openedChange = new EventEmitter<boolean>();

    navigationItems: unknown[] = [];

    readonly onNavigationItemClick = (event: ItemClickEvent) => {}
}
