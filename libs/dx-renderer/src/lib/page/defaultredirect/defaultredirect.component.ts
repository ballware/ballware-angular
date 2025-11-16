import {
  Component,
  HostBinding,
  Inject,
  Input,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  TENANT_SERVICE,
  TenantService,
} from '@ballware/meta-services';
import { CommonModule } from '@angular/common';
import { Destroy } from '@ballware/renderer-commons';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'ballware-default-redirect',
  templateUrl: './defaultredirect.component.html',
  styleUrls: [],
  imports: [CommonModule],
  hostDirectives: [Destroy],
  standalone: true,
})
export class DefaultRedirectComponent implements OnInit {
  @HostBinding('class') classes = 'h-100 p-2';

  @Input() url!: string;

  constructor(
    private router: Router,
    @Inject(TENANT_SERVICE) private tenantService: TenantService,
    private destroy: Destroy
  ) {}

  ngOnInit() {
    this.tenantService.navigationLayout$.pipe(
      takeUntil(this.destroy.destroy$)
    ).subscribe(navigationLayout => {
      if (navigationLayout?.defaultUrl) {
        this.router.navigate([`/page/${navigationLayout.defaultUrl}`]);
      }
    });
  }
}
