import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { compileEntityMetadata, EntityMetadata } from '@ballware/rest-meta-api';
import { TENANT_SERVICE } from '@ballware/meta-services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RequestLogEntry, RequestLogService } from '../request-log';

interface EntityInspection {
  id: string;
  application?: string;
  entity?: string;
  baseUrl?: string;
  gridLayouts: number;
  editLayouts: number;
  overlay: boolean;
}

interface RightInspection {
  right: string;
  allowed: boolean;
}

@Component({
    selector: 'ballware-inspector',
    templateUrl: './inspector.component.html',
    imports: [CommonModule]
})
export class InspectorComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly tenantService = inject(TENANT_SERVICE);
  private readonly destroyRef = inject(DestroyRef);
  private readonly requestLogService = inject(RequestLogService);

  public roots: string[] = [];
  public tenants: Array<{ Id: string, Name: string }> = [];
  public revision = '';
  public overlays: Array<{ kind: string, id: string }> = [];
  public entities: EntityInspection[] = [];
  public rights: RightInspection[] = [];
  public requests: RequestLogEntry[] = [];

  public readonly requests$ = this.requestLogService.entries$;

  public get tenantNames(): string {
    return this.tenants.map((tenant) => tenant.Id).join(', ');
  }

  ngOnInit(): void {
    this.http.get<{ roots: string[] }>('/designer/roots')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.roots = result.roots);

    this.http.get<Array<{ Id: string, Name: string }>>('/designer/tenants')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tenants) => this.tenants = tenants);

    this.http.get<{ revision: string }>('/designer/revision')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.revision = result.revision);

    this.http.get<{ overlays: Array<{ kind: string, id: string }> }>('/designer/overlay')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => this.overlays = result.overlays);

    this.http.get<Array<Record<string, unknown>>>('/meta/entity/selectlist')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((entityRecords) => {
        this.entities = entityRecords.map((record) => {
          const id = (record['Id'] ?? '').toString();

          let inspection: EntityInspection = {
            id,
            gridLayouts: 0,
            editLayouts: 0,
            overlay: this.overlays.some((overlay) => overlay.kind === 'entity' && overlay.id === id)
          };

          this.http.get<EntityMetadata>(`/meta/entity/metadataforentity/${id}`)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((metadata) => {
              const compiled = compileEntityMetadata(metadata);

              inspection = {
                id,
                application: compiled.application,
                entity: compiled.entity,
                baseUrl: compiled.baseUrl,
                gridLayouts: compiled.gridLayouts?.length ?? 0,
                editLayouts: compiled.editLayouts?.length ?? 0,
                overlay: inspection.overlay
              };

              this.entities = this.entities.map((entity) => entity.id === id ? inspection : entity);
            });

          return inspection;
        });
      });

    this.tenantService.hasRight$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((hasRight) => {
        if (!hasRight) {
          return;
        }

        this.http.get<Array<Record<string, unknown>>>('/meta/page/selectlist')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((pages) => {
            this.rights = pages.map((page) => {
              const identifier = (page['Identifier'] ?? page['Id'] ?? '').toString();

              return { right: `generic.page.${identifier}`, allowed: hasRight(`generic.page.${identifier}`) };
            });
          });
      });

    this.requests$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((requests) => this.requests = requests);
  }
}
