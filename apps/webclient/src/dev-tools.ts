// dev-tools.ts — Development‑only tracing helpers for Angular apps (ESM-friendly)
// Usage:
//   In main.ts (Dev only):
//     import 'zone.js';
//     if (isDevMode()) {
//       const { runWithTracing } = await import('./dev-tools');
//       await runWithTracing(async () => {
//         const appRef = await bootstrapApplication(AppComponent);
//         const { installAngularProbes } = await import('./dev-tools');
//         const { NgZone } = await import('@angular/core');
//         const ngZone = appRef.injector.get(NgZone);
//         await installAngularProbes(appRef, ngZone);
//       });
//       return;
//     }
//   No CommonJS `require` is used; dynamic `import()` handles optional bits.

// IMPORTANT: Ensure 'zone.js' is already imported (e.g., in main.ts or polyfills.ts)
// BEFORE importing this file. This module imports the long stack trace plugin.

import 'zone.js/plugins/long-stack-trace-zone';

// Helper: trim stack to first N lines to keep console readable
function trimStack(stack: string | undefined, lines = 10): string {
  if (!stack) return 'n/a';
  const parts = stack.split('\n');
  // Drop the first line (Error: ...)
  return parts.slice(1, lines + 1).join('\n');
}

// Helper: capture a stack with a label
function capture(label: string): string {
  try {
    return `${label}\n${trimStack(new Error(label).stack ?? '')}`;
  } catch {
    return label;
  }
}

/**
 * runWithTracing
 * Forks a Zone with a ZoneSpec that traces scheduling/execution of setTimeout/setInterval
 * and runs the provided bootstrap function inside it.
 */
export async function runWithTracing<T>(bootstrap: () => T | Promise<T>): Promise<T> {
  if ((globalThis as any).__DEV_TRACING_INSTALLED__) {
    const result = bootstrap();
    return result instanceof Promise ? await result : (result as T);
  }

  // Map Task -> origin stack (creation). WeakMap so GC can collect tasks.
  const originByTask = new WeakMap<object, string>();
  // Fallback: id -> origin when a library circumvents Zone task metadata
  const idToOrigin = new Map<number, string>();

  // Patch timers once to record origins by handle ID as a robust fallback
  patchTimersOnce(idToOrigin);

  // ZoneSpec to intercept schedule/invoke of macroTasks
  const spySpec: ZoneSpec = {
    name: 'timeout-trace',

    onScheduleTask(delegate, curr, target, task) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyTask: any = task;
      if (task.type === 'macroTask' && (task.source === 'setTimeout' || task.source === 'setInterval')) {
        const creation =
          anyTask.creationLocation?.stack ||
          (Array.isArray(anyTask._creationTrace) ? (anyTask._creationTrace as string[]).join('\n') : undefined) ||
          capture(`[${task.source} scheduled] delay=${anyTask.data?.delay ?? 'n/a'}`);
        originByTask.set(task, creation);
      }
      return delegate.scheduleTask(target, task);
    },

    onInvokeTask(delegate, curr, target, task, applyThis, applyArgs) {
      if (task.type === 'macroTask' && (task.source === 'setTimeout' || task.source === 'setInterval')) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyTask: any = task;
        const id = anyTask.data?.handleId ?? anyTask.data?.handleId_ ?? anyTask.data?.timerId;
        const origin = originByTask.get(task) || (id != null ? idToOrigin.get(id as number) : undefined) || 'n/a';

        // Pretty console output
        // eslint-disable-next-line no-console
        console.groupCollapsed(`[invoke] ${task.source} id=${id ?? 'n/a'} zone=${(globalThis as any).Zone?.current?.name}`);
        // eslint-disable-next-line no-console
        console.log('SCHEDULED AT:\n' + origin);
        // eslint-disable-next-line no-console
        console.trace('CALLBACK STACK');
        // eslint-disable-next-line no-console
        console.groupEnd();
      }
      return delegate.invokeTask(target, task, applyThis, applyArgs);
    },
  };

  const zone = (globalThis as any).Zone.current.fork(spySpec);
  (globalThis as any).__DEV_TRACING_INSTALLED__ = true;

  const result = zone.run(bootstrap);
  return result instanceof Promise ? await result : (result as T);
}

/**
 * Enable NgZone / Change Detection probes after bootstrap.
 * ESM-friendly: uses dynamic import() to touch optional symbols.
 */
export async function installAngularProbes(appRef: any, ngZone: any): Promise<void> {
  try {
    if (!appRef || typeof appRef.tick !== 'function' || !ngZone) {
      // eslint-disable-next-line no-console
      console.warn('[dev-tools] installAngularProbes: invalid arguments; probes not installed.');
      return;
    }

    // 1) Count ApplicationRef ticks
    const originalTick = appRef.tick.bind(appRef);
    appRef.tick = () => {
      // eslint-disable-next-line no-console
      console.count('ApplicationRef.tick');
      return originalTick();
    };

    // 2) Log NgZone stability transitions
    if (ngZone.onUnstable?.subscribe) {
      ngZone.onUnstable.subscribe(() => console.debug('[NgZone] onUnstable'));
    }
    if (ngZone.onStable?.subscribe) {
      ngZone.onStable.subscribe(() => console.debug('[NgZone] onStable'));
    }

    // 3) Who re-enters Angular? Patch NgZone.run / runOutsideAngular
    const nzProto = Object.getPrototypeOf(ngZone);
    const runOrig = nzProto?.run as (this: any, ...a: any[]) => any;
    if (typeof runOrig === 'function' && !(runOrig as any).__devPatched) {
      nzProto.run = function (this: any, ...args: unknown[]) {
        console.groupCollapsed('[NgZone.run] reentry');
        console.trace('caller');
        console.groupEnd();
        return runOrig.apply(this, args as any);
      };
      (nzProto.run as any).__devPatched = true;
    }

    const runOutOrig = nzProto?.runOutsideAngular as (this: any, fn: (...a: any[]) => any) => any;
    if (typeof runOutOrig === 'function' && !(runOutOrig as any).__devPatched) {
      nzProto.runOutsideAngular = function <T>(this: any, fn: (...a: any[]) => T): T {
        console.groupCollapsed('[NgZone.runOutsideAngular]');
        console.trace('caller (scheduling outside)');
        console.groupEnd();
        return runOutOrig.apply(this as any, [fn]);
      } as any;
      (nzProto.runOutsideAngular as any).__devPatched = true;
    }

    // 4) Who triggers CD directly? Patch ChangeDetectorRef methods via dynamic import
    try {
      const { ChangeDetectorRef } = await import('@angular/core');
      const cdrProto = (ChangeDetectorRef as any)?.prototype ?? (ChangeDetectorRef as any)?.constructor?.prototype;
      if (cdrProto) {
        ['markForCheck', 'detectChanges', 'checkNoChanges', 'detach', 'reattach'].forEach((fn) => {
          const orig = cdrProto[fn];
          if (typeof orig === 'function' && !orig.__devPatched) {
            cdrProto[fn] = function (this: any, ...args: unknown[]) {
              console.groupCollapsed(`[CD] ${fn} (zone=${(globalThis as any).Zone?.current?.name})`);
              console.trace('caller');
              console.groupEnd();
              return orig.apply(this, args as any);
            };
            cdrProto[fn].__devPatched = true;
          }
        });
      }
    } catch {
      // ignore if dynamic import fails
    }

    // 5) RxJS asyncScheduler probe (optional)
    try {
      const { asyncScheduler } = await import('rxjs');
      const anyScheduler: any = asyncScheduler as any;
      if (anyScheduler && !anyScheduler.__devPatched) {
        const scheduleOrig = anyScheduler.schedule.bind(anyScheduler);
        anyScheduler.schedule = function (work: any, delay?: number, state?: unknown) {
          const origin = capture(`[rxjs asyncScheduler] delay=${delay ?? 0}`);
          return scheduleOrig(function (this: unknown, s: unknown) {
            console.debug(origin);
            return work.call(this, s);
          }, delay, state);
        };
        anyScheduler.__devPatched = true;
      }
    } catch {
      // rxjs not present — ignore
    }

    console.info('[dev-tools] Angular probes installed.');
  } catch (err) {
    console.warn('[dev-tools] Failed to install Angular probes', err);
  }
}

/** Patch window.setTimeout / setInterval once to record scheduling origins by handle ID */
function patchTimersOnce(idToOrigin: Map<number, string>): void {
  if ((globalThis as any).__DEV_TRACING_TIMERS_PATCHED__) return;
  const nativeSetTimeout = window.setTimeout.bind(window);
  const nativeSetInterval = window.setInterval.bind(window);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).setTimeout = function (handler: TimerHandler, timeout?: number, ...args: any[]) {
    const id = nativeSetTimeout(handler as any, timeout as any, ...args) as unknown as number;
    idToOrigin.set(id, capture(`[setTimeout scheduled] delay=${timeout ?? 0}`));
    return id as any;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).setInterval = function (handler: TimerHandler, timeout?: number, ...args: any[]) {
    const id = nativeSetInterval(handler as any, timeout as any, ...args) as unknown as number;
    idToOrigin.set(id, capture(`[setInterval scheduled] delay=${timeout ?? 0}`));
    return id as any;
  };

  (globalThis as any).__DEV_TRACING_TIMERS_PATCHED__ = true;
}
