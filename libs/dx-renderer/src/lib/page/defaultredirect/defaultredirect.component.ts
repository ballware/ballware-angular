import {
  Component,
  DestroyRef,
  HostBinding,
  Inject,
  Input,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  TENANT_SERVICE,
  TenantService,
} from '@ballware/meta-services';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-default-redirect',
    templateUrl: './defaultredirect.component.html',
    styleUrls: [],
    imports: [CommonModule]
})
export class DefaultRedirectComponent implements OnInit {
  @HostBinding('class') classes = 'h-100 p-2';

  @Input() url!: string;

  constructor(
    private router: Router,
    @Inject(TENANT_SERVICE) private tenantService: TenantService,
    private destroy: DestroyRef
  ) {}

  ngOnInit() {
    this.tenantService.navigationLayout$.pipe(
      takeUntilDestroyed(this.destroy),
    ).subscribe(navigationLayout => {
      if (navigationLayout?.defaultUrl) {
        this.router.navigate([`/page/${navigationLayout.defaultUrl}`]);
      }
    });
  }
}
