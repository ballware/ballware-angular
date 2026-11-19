import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IDENTITY_SERVICE, TENANT_SERVICE } from '@ballware/meta-services';

@Component({
    selector: 'ballware-root',
    templateUrl: './app.component.html',
    imports: [CommonModule, RouterOutlet, RouterLink]
})
export class AppComponent {
  private readonly tenantService = inject(TENANT_SERVICE);
  private readonly identityService = inject(IDENTITY_SERVICE);
  private readonly http = inject(HttpClient);

  public readonly title$ = this.tenantService.title$;
  public readonly pages$ = this.tenantService.pages$;
  public readonly userName$ = this.identityService.userName$;
  public readonly currentUser$ = this.identityService.currentUser$;

  public readonly tenants: Array<{ Id: string, Name: string }> = [];
  public readonly users: Array<{ Id: string, Name: string }> = [];

  public readonly selectedTenant = new URLSearchParams(window.location.search).get('tenant') ?? 'e2e';
  public readonly selectedUser = new URLSearchParams(window.location.search).get('user') ?? 'e2e-user';

  constructor() {
    this.http.get<Array<{ Id: string, Name: string }>>('/designer/tenants')
      .subscribe((tenants) => this.tenants.push(...tenants));

    this.http.get<Array<Record<string, unknown>>>('/identity/ballware-user-api/selectlist')
      .subscribe((users) => this.users.push(...users.map((user) => ({
        Id: (user['Id'] ?? '').toString(),
        Name: (user['Name'] ?? user['Id'] ?? '').toString()
      }))));
  }

  public onTenantSelected(event: Event): void {
    this.navigateWith((event.target as HTMLSelectElement).value, this.selectedUser);
  }

  public onUserSelected(event: Event): void {
    this.navigateWith(this.selectedTenant, (event.target as HTMLSelectElement).value);
  }

  private navigateWith(tenant: string, user: string): void {
    const url = new URL(window.location.href);

    url.searchParams.set('tenant', tenant);
    url.searchParams.set('user', user);

    window.location.href = url.toString();
    window.location.reload();
  }
}
