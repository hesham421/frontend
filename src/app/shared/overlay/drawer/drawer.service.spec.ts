import { Component, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DrawerService } from './drawer.service';

@Component({ standalone: true, template: '<p>content</p>' })
class DummyContentComponent {}

@Component({
  standalone: true,
  template: `<ng-template #tpl>drawer body</ng-template>`
})
class HostWithTemplateComponent {
  @ViewChild('tpl') tpl!: TemplateRef<unknown>;
  constructor(readonly viewContainerRef: ViewContainerRef) {}
}

describe('DrawerService', () => {
  let service: DrawerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DrawerService);
  });

  it('opens a component without a title (no header, else-branch portal outlet)', () => {
    expect(() => service.open(DummyContentComponent, { size: 'md' })).not.toThrow();
  });

  it('opens a component with a title (header shown, if-branch portal outlet)', () => {
    expect(() => service.open(DummyContentComponent, { size: 'md', title: 'Add Detail' })).not.toThrow();
  });

  it('opens a TemplateRef content, matching lookup-detail-form-modal / user-list call sites', () => {
    const hostFixture = TestBed.createComponent(HostWithTemplateComponent);
    hostFixture.detectChanges();
    const host = hostFixture.componentInstance;

    expect(() =>
      service.open(host.tpl, {
        size: 'md',
        closeOnScrim: false,
        closeOnEscape: false,
        viewContainerRef: host.viewContainerRef
      })
    ).not.toThrow();
  });
});
