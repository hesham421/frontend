import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

/**
 * Shared handle returned by DialogService.open() / DrawerService.open().
 *
 * Mirrors ng-bootstrap's NgbModalRef contract on purpose (`result` promise
 * that resolves on close()/rejects on dismiss(), a settable
 * `componentInstance`) so existing call sites built against NgbModalRef
 * need minimal changes beyond the service/type import swap. `afterClosed()`
 * is the more idiomatic Angular/CDK-style API for anything built fresh.
 */
export class AvlOverlayRef<R = unknown> {
  private componentInstanceValue: unknown;
  private readonly afterClosedSubject = new Subject<R | undefined>();
  private resolveResult!: (value: R) => void;
  private rejectResult!: (reason?: unknown) => void;

  readonly result: Promise<R>;

  constructor(private readonly overlayRef: OverlayRef) {
    this.result = new Promise<R>((resolve, reject) => {
      this.resolveResult = resolve;
      this.rejectResult = reject;
    });
    // Prevent "unhandled promise rejection" console noise for callers that
    // never attach a .catch()/try-await to .result (e.g. fire-and-forget
    // .open() calls that only care about afterClosed()).
    this.result.catch(() => undefined);
  }

  set componentInstance(instance: unknown) {
    this.componentInstanceValue = instance;
  }

  get componentInstance(): any {
    return this.componentInstanceValue;
  }

  /** Closes with a result — resolves `.result` and emits it on afterClosed(). */
  close(result?: R): void {
    if (this.overlayRef.hasAttached()) {
      this.resolveResult(result as R);
      this.afterClosedSubject.next(result);
      this.afterClosedSubject.complete();
      this.overlayRef.dispose();
    }
  }

  /** Dismisses without a result — rejects `.result` (matches ngbModal's dismiss()). */
  dismiss(reason?: unknown): void {
    if (this.overlayRef.hasAttached()) {
      this.rejectResult(reason);
      this.afterClosedSubject.next(undefined);
      this.afterClosedSubject.complete();
      this.overlayRef.dispose();
    }
  }

  afterClosed(): Observable<R | undefined> {
    return this.afterClosedSubject.asObservable();
  }
}
