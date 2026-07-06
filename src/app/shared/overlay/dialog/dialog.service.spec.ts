import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from './dialog.service';
import { ConfirmDialogComponent } from 'src/app/core/components/confirm-dialog/confirm-dialog.component';

@Component({ standalone: true, template: '<p>content</p>' })
class DummyContentComponent {}

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogService);
  });

  it('opens a component without a title, matching ErpDialogService confirm-delete calls (else-branch portal outlet)', () => {
    expect(() => service.open(DummyContentComponent, { size: 'sm', closeOnScrim: false, closeOnEscape: true })).not.toThrow();
  });

  it('opens a component with a title (header shown, if-branch portal outlet)', () => {
    expect(() => service.open(DummyContentComponent, { size: 'sm', title: 'Confirm' })).not.toThrow();
  });
});

describe('DialogService with the real ConfirmDialogComponent (matches ErpDialogService.confirmDelete() exactly)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()] });
  });

  it('opens without throwing, and the dialog content actually renders (not blank)', () => {
    const service = TestBed.inject(DialogService);
    const ref = service.open(ConfirmDialogComponent, { size: 'sm', closeOnScrim: false, closeOnEscape: true });
    expect(ref.componentInstance).toBeInstanceOf(ConfirmDialogComponent);

    const overlayPane = document.querySelector('.avl-dialog-overlay-pane');
    expect(overlayPane).toBeTruthy();
    expect(overlayPane?.querySelector('.modal-footer button')).toBeTruthy();

    ref.dismiss();
  });
});
