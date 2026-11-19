import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';

export interface RequestLogEntry {
  method: string;
  url: string;
  status: number | string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class RequestLogService {
  private readonly entries = new BehaviorSubject<RequestLogEntry[]>([]);

  public readonly entries$: Observable<RequestLogEntry[]> = this.entries.asObservable();

  public record(entry: RequestLogEntry): void {
    this.entries.next([...this.entries.value, entry].slice(-200));
  }
}

export const requestLogInterceptor: HttpInterceptorFn = (req, next) => {
  const logService = inject(RequestLogService);

  return new Observable<HttpEvent<unknown>>((subscriber) => {
    next(req).subscribe({
      next: (event) => {
        if (event instanceof HttpResponse) {
          logService.record({
            method: req.method,
            url: req.urlWithParams,
            status: event.status,
            timestamp: new Date().toISOString()
          });
        }

        subscriber.next(event);
      },
      error: (error) => {
        logService.record({
          method: req.method,
          url: req.urlWithParams,
          status: error?.status ?? 'error',
          timestamp: new Date().toISOString()
        });

        subscriber.error(error);
      },
      complete: () => subscriber.complete()
    });
  });
};
