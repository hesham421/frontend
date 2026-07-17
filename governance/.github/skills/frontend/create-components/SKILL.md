---
name: create-components
description: "Generates all frontend components: Search page (extends ErpListComponent + AG Grid), Entry page (signal + Reactive Forms + Location.replaceState), Grid Config, Actions Cell Renderer, and optional child modal. Phase 2, Steps 2.5–2.9."
---

# Skill: create-components

## Name
`create-components`

## Description
Generates all frontend components for a feature: Page A (Search with AG Grid), Page B (Entry with Reactive Forms), Grid Config, Actions Cell Renderer, and optional child components (Section + Form Modal). This is **Phase 2, Steps 2.5–2.9** of the execution template.

## When to Use
- When implementing frontend components for a feature
- When the execution template Phase 2, Steps 2.5–2.9 are being started
- AFTER models, API service, facade, and confirm actions are defined

## When NOT to Use
- Before models, API service, facade, and routing are complete — components depend on all of them
- For `shared/` or `core/` components that are not feature-specific (those are manually curated)
- For adding a single field to an existing form (edit directly)
- For backend controllers — use `create-controller` instead

## Variables (Must Be Defined First)

| Variable | Example | Description |
|----------|---------|-------------|
| `DOMAIN_DIR` | `master-data` | Module domain directory (kebab-case) |
| `FEATURE_DIR` | `master-lookups` | Feature directory (kebab-case plural) |
| `ENTITY_NAME` | `MasterLookup` | PascalCase entity name |
| `ENTITY_KEBAB` | `master-lookup` | kebab-case entity name |
| `ENTITY_PERM` | `MASTER_LOOKUP` | UPPER_SNAKE permission suffix |
| `HAS_CHILD` | `true/false` | Whether entity has child entities |
| `CHILD_NAME` | `LookupDetail` | PascalCase child name (if applicable) |

## Responsibilities

- Generate search page component extending `ErpListComponent` with AG Grid integration
- Generate entry page component with signal-based `FormGroup` and `FormMapper`
- Generate grid config in separate `<feature>-grid.config.ts` file
- Generate actions cell renderer as standalone component
- Generate optional child components: section component and form modal

## Constraints

- MUST NOT generate models, API service, facade, or routing code
- MUST NOT use default change detection — must use `ChangeDetectionStrategy.OnPush`
- MUST NOT call API directly from components — must go through facade
- MUST NOT use `router.navigate` after create — must use `Location.replaceState()`
- MUST NOT define inline column definitions — must use external grid config file
- All components MUST be `standalone: true`

## Output

- Grid config: `pages/<feature>-search/<feature>-grid.config.ts`
- Search page: `pages/<feature>-search/<feature>-search.component.ts`
- Entry page: `pages/<feature>-entry/<feature>-entry.component.ts`
- Actions cell: `components/<feature>-actions-cell/<feature>-actions-cell.component.ts`
- *(If HAS_CHILD)* Child section + modal components

---

## PART 1: Grid Config

### File Location
`src/app/modules/<DOMAIN_DIR>/<FEATURE_DIR>/pages/<ENTITY_KEBAB>-search/<ENTITY_KEBAB>-grid.config.ts`

### Structure
```typescript
import { ColDef, GridOptions } from 'ag-grid-community';
import { TranslateService } from '@ngx-translate/core';
import { NgZone } from '@angular/core';
import { <ENTITY_NAME>ActionsCellComponent } from '../../components/<ENTITY_KEBAB>-actions-cell/<ENTITY_KEBAB>-actions-cell.component';
import { SpecFieldOption, SpecOperatorOption } from '../../../../shared/models/spec-filter.model';
import { createActiveColumnDef } from '../../../../shared/ag-grid/active-column-def';
import { ERP_DEFAULT_COL_DEF } from '../../../../shared/ag-grid/default-col-def';

export { ERP_DEFAULT_COL_DEF };

export function create<ENTITY_NAME>FilterOptions(translate: TranslateService): {
  fields: SpecFieldOption[];
  operators: SpecOperatorOption[];
} {
  return {
    fields: [
      { value: 'fieldName', label: translate.instant('<FEATURE>S.FIELD_NAME') },
      { value: 'description', label: translate.instant('<FEATURE>S.DESCRIPTION') }
    ],
    operators: [
      { value: 'CONTAINS', label: translate.instant('COMMON.CONTAINS') },
      { value: 'EQUALS', label: translate.instant('COMMON.EQUALS') },
      { value: 'STARTS_WITH', label: translate.instant('COMMON.STARTS_WITH') }
    ]
  };
}

export function create<ENTITY_NAME>ColumnDefs(
  translate: TranslateService,
  zone: NgZone,
  callbacks: {
    onEdit: (data: any) => void;
    onToggleActive: (data: any) => void;
    onDelete: (data: any) => void;
  }
): ColDef[] {
  const activeLabels = {
    active: translate.instant('COMMON.ACTIVE'),
    inactive: translate.instant('COMMON.INACTIVE')
  };

  return [
    { field: 'fieldName', headerName: translate.instant('<FEATURE>S.FIELD_NAME'), sortable: true, flex: 2 },
    { field: 'description', headerName: translate.instant('<FEATURE>S.DESCRIPTION'), sortable: true, flex: 3 },
    createActiveColumnDef(activeLabels, { flex: 1 }),
    {
      headerName: translate.instant('COMMON.ACTIONS'),
      cellRenderer: <ENTITY_NAME>ActionsCellComponent,
      cellRendererParams: {
        onEdit: (data: any) => zone.run(() => callbacks.onEdit(data)),
        onToggleActive: (data: any) => zone.run(() => callbacks.onToggleActive(data)),
        onDelete: (data: any) => zone.run(() => callbacks.onDelete(data))
      },
      sortable: false,
      filter: false,
      flex: 1.5,
      minWidth: 150
    }
  ];
}

export function create<ENTITY_NAME>GridOptions(translate: TranslateService): {
  gridOptions: GridOptions;
  localeText: Record<string, string>;
} {
  return {
    gridOptions: {
      pagination: true,
      paginationPageSize: 20,
      paginationPageSizeSelector: [10, 20, 50, 100],
      rowSelection: 'single',
      suppressRowClickSelection: true,
      animateRows: true,
      domLayout: 'autoHeight'
    },
    localeText: {
      noRowsToShow: translate.instant('COMMON.NO_DATA'),
      page: translate.instant('COMMON.PAGE'),
      of: translate.instant('COMMON.OF'),
      to: translate.instant('COMMON.TO')
    }
  };
}
```

---

## PART 2: Actions Cell Component

### File Location
`src/app/modules/<DOMAIN_DIR>/<FEATURE_DIR>/components/<ENTITY_KEBAB>-actions-cell/<ENTITY_KEBAB>-actions-cell.component.ts`

### Structure
```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { ErpPermissionDirective } from '../../../../shared/directives/erp-permission.directive';
import { AvlIconButtonComponent } from '../../../../shared/buttons/avl-icon-button';
import { TranslateModule } from '@ngx-translate/core';

// AVELYNQ migration note: actions cells use AvlIconButtonComponent, not raw
// Bootstrap `btn btn-*` classes. This mirrors the real pattern established
// across every actions-cell rebuilt during the AVELYNQ migration
// (role-actions-cell, user-actions-cell, page-actions-cell,
// master-lookup-actions-cell) — each implements ICellRendererAngularComp
// directly (the shared `erp-crud-actions-cell` component does NOT
// implement that contract and is not a substitute here) and is composed
// from `avl-icon-button` internally. Use Tabler icon classes (`ti ti-*`),
// never FontAwesome/Bootstrap-Icons (`bi bi-*`, `fa-*`).
@Component({
  standalone: true,
  imports: [ErpPermissionDirective, AvlIconButtonComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="d-flex gap-1">
      <avl-icon-button
        variant="ghost" size="sm"
        icon="ti ti-pencil"
        [erpPermission]="'PERM_<ENTITY_PERM>_UPDATE'"
        [label]="'COMMON.EDIT' | translate"
        (clicked)="onEdit()">
      </avl-icon-button>
      <avl-icon-button
        variant="ghost" size="sm"
        [icon]="params?.data?.isActive ? 'ti ti-toggle-left' : 'ti ti-toggle-right'"
        [erpPermission]="'PERM_<ENTITY_PERM>_UPDATE'"
        [label]="(params?.data?.isActive ? 'COMMON.DEACTIVATE' : 'COMMON.ACTIVATE') | translate"
        (clicked)="onToggleActive()">
      </avl-icon-button>
      <avl-icon-button
        variant="ghost" size="sm"
        icon="ti ti-trash"
        [erpPermission]="'PERM_<ENTITY_PERM>_DELETE'"
        [label]="'COMMON.DELETE' | translate"
        (clicked)="onDelete()">
      </avl-icon-button>
    </div>
  `
})
export class <ENTITY_NAME>ActionsCellComponent implements ICellRendererAngularComp {
  params: any;

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onEdit(): void { this.params?.onEdit?.(this.params.data); }
  onToggleActive(): void { this.params?.onToggleActive?.(this.params.data); }
  onDelete(): void { this.params?.onDelete?.(this.params.data); }
}
```

---

## PART 3: Page A — Search Component

### File Location
`src/app/modules/<DOMAIN_DIR>/<FEATURE_DIR>/pages/<ENTITY_KEBAB>-search/<ENTITY_KEBAB>-search.component.ts`

### Structure
```typescript
import { Component, OnInit, ChangeDetectionStrategy, inject, NgZone, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';

import { ErpListComponent } from '../../../../shared/base/erp-list.component';
import { ErpGridState } from '../../../../shared/models/erp-grid-state.model';
import { ErpEmptyStateComponent } from '../../../../shared/components/erp-empty-state/erp-empty-state.component';
import { ErpPermissionDirective } from '../../../../shared/directives/erp-permission.directive';
import { SpecificationFilterComponent } from '../../../../shared/components/specification-filter/specification-filter.component';
import { ThemeService } from '../../../../core/services/theme.service';
import { AuthenticationService } from '../../../../core/services/authentication.service';
import { ErpDialogService } from '../../../../shared/services/erp-dialog.service';
import { ErpNotificationService } from '../../../../shared/services/erp-notification.service';

import { <ENTITY_NAME>Facade } from '../../facades/<ENTITY_KEBAB>.facade';
import { <ENTITY_NAME>ApiService } from '../../services/<ENTITY_KEBAB>-api.service';
import {
  create<ENTITY_NAME>ColumnDefs,
  create<ENTITY_NAME>FilterOptions,
  create<ENTITY_NAME>GridOptions,
  ERP_DEFAULT_COL_DEF
} from './<ENTITY_KEBAB>-grid.config';
import { confirmToggle<ENTITY_NAME>Active, confirmDelete<ENTITY_NAME>, ConfirmActionDeps } from '../../helpers/<ENTITY_KEBAB>-confirm-actions';

@Component({
  standalone: true,
  imports: [
    AgGridAngular,
    TranslateModule,
    ErpEmptyStateComponent,
    ErpPermissionDirective,
    SpecificationFilterComponent
  ],
  providers: [<ENTITY_NAME>Facade, <ENTITY_NAME>ApiService],  // Component-scoped!
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './<ENTITY_KEBAB>-search.component.html',
  styleUrls: ['./<ENTITY_KEBAB>-search.component.scss']
})
export class <ENTITY_NAME>SearchComponent extends ErpListComponent implements OnInit {

  private readonly zone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly themeService = inject(ThemeService);
  readonly facade = inject(<ENTITY_NAME>Facade);
  private readonly authService = inject(AuthenticationService);
  private readonly dialog = inject(ErpDialogService);
  private readonly notify = inject(ErpNotificationService);

  // AG Grid
  columnDefs: ColDef[] = [];
  defaultColDef = ERP_DEFAULT_COL_DEF;
  gridOptions!: GridOptions;
  localeText: Record<string, string> = {};
  agGridTheme = this.themeService.createAgGridTheme();

  // Filter
  filterOptions = create<ENTITY_NAME>FilterOptions(this.translate);

  private confirmDeps: ConfirmActionDeps = {
    dialog: this.dialog,
    notify: this.notify,
    auth: this.authService,
    facade: this.facade
  };

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.initGridConfig();
    this.initErpList();

    // Rebuild grid config on language change
    this.translate.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.initGridConfig();
      });
  }

  private initGridConfig(): void {
    this.columnDefs = create<ENTITY_NAME>ColumnDefs(this.translate, this.zone, {
      onEdit: (data) => this.router.navigate(['./', 'edit', data.id], { relativeTo: this.route }),
      onToggleActive: (data) => confirmToggle<ENTITY_NAME>Active(this.confirmDeps, data, () => this.reload()),
      onDelete: (data) => confirmDelete<ENTITY_NAME>(this.confirmDeps, data, () => this.reload())
    });

    const gridConfig = create<ENTITY_NAME>GridOptions(this.translate);
    this.gridOptions = gridConfig.gridOptions;
    this.localeText = gridConfig.localeText;
    this.filterOptions = create<ENTITY_NAME>FilterOptions(this.translate);
  }

  protected load(state: ErpGridState): void {
    this.facade.applyGridStateAndLoad({
      page: state.page,
      size: state.size,
      sortBy: state.sortBy,
      sortDir: state.sortDir,
      filters: state.filters
    });
  }

  onCreateNew(): void {
    this.router.navigate(['./', 'create'], { relativeTo: this.route });
  }
}
```

### Template (`<ENTITY_KEBAB>-search.component.html`)
```html
<div class="container-fluid">
  <!-- Page header — use the REAL shared component, don't hand-roll title
       + buttons. erp-page-header's inputs take raw translation KEYS
       (`titleKey`), NOT pre-translated strings — it applies `| translate`
       internally. Same convention applies to EVERY `erp-*` shared
       component's `xKey`-suffixed inputs (labelKey, hintKey, messageKey,
       etc.) — never pipe `| translate` yourself before passing one in. -->
  <erp-page-header
    [titleKey]="'<FEATURE>S.TITLE'"
    [showAdd]="true"
    [showRefresh]="true"
    [addPermission]="'PERM_<ENTITY_PERM>_CREATE'"
    (addClicked)="onCreateNew()"
    (refreshClicked)="reload()">
  </erp-page-header>

  <!-- Specification Filter -->
  <app-specification-filter
    [fields]="filterOptions.fields"
    [operators]="filterOptions.operators"
    (filtersChanged)="onFiltersChanged($event)">
  </app-specification-filter>

  <!-- Loading State (no AVELYNQ spinner primitive exists yet — Bootstrap's
       spinner-border is an accepted pragmatic exception here, it carries
       no brand-identity styling to migrate) -->
  @if (facade.loading()) {
    <div class="text-center py-5"><div class="spinner-border"></div></div>
  }

  <!-- Error State — erp-empty-state has no `type`/"error" variant input;
       use messageKey (+ optional titleKey/icon) regardless of state -->
  @if (facade.error()) {
    <erp-empty-state [messageKey]="facade.error()!" icon="ti ti-alert-triangle"></erp-empty-state>
  }

  <!-- AG Grid -->
  @if (!facade.loading() && !facade.error()) {
    @if (facade.entities().length === 0) {
      <erp-empty-state [messageKey]="'<FEATURE>S.NO_<ENTITIES>'"></erp-empty-state>
    } @else {
      <ag-grid-angular
        [theme]="agGridTheme"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [rowData]="facade.entities()"
        [gridOptions]="gridOptions"
        [localeText]="localeText"
        (sortChanged)="onSortChanged($event)"
        (paginationChanged)="onPageChanged($event)"
        style="width: 100%;">
      </ag-grid-angular>
    }
  }
</div>
```

Note: `facade.error()` must hold a translation KEY string (e.g.
`'<FEATURE>S.LOAD_ERROR'`), not an already-translated message — this is
what makes it valid to pass straight into `[messageKey]` here.

Note: `[theme]="agGridTheme"` must reference the shared AVELYNQ grid theme
factory (`src/app/shared/ag-grid/agGridTableStyle.ts`) — never a bare
`ag-theme-quartz`/`ag-theme-alpine` CSS class, and never a one-off theme
object per feature.

---

## PART 4: Page B — Entry Component

### File Location
`src/app/modules/<DOMAIN_DIR>/<FEATURE_DIR>/pages/<ENTITY_KEBAB>-entry/<ENTITY_KEBAB>-entry.component.ts`

### Structure
```typescript
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ErpFormFieldComponent } from '../../../../shared/components/erp-form-field/erp-form-field.component';
import { ErpSectionComponent } from '../../../../shared/components/erp-section/erp-section.component';
import { ErpBackButtonComponent } from '../../../../shared/components/erp-back-button/erp-back-button.component';
import { ErpPermissionDirective } from '../../../../shared/directives/erp-permission.directive';
import { ErpNotificationService } from '../../../../shared/services/erp-notification.service';
import { AuthenticationService } from '../../../../core/services/authentication.service';

import { <ENTITY_NAME>Facade } from '../../facades/<ENTITY_KEBAB>.facade';
import { <ENTITY_NAME>ApiService } from '../../services/<ENTITY_KEBAB>-api.service';
import { <ENTITY_NAME>FormMapper, <ENTITY_NAME>FormModel } from '../../models/<ENTITY_KEBAB>-form.model';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    ErpFormFieldComponent,
    ErpSectionComponent,
    ErpBackButtonComponent,
    ErpPermissionDirective
  ],
  providers: [<ENTITY_NAME>Facade, <ENTITY_NAME>ApiService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './<ENTITY_KEBAB>-entry.component.html',
  styleUrls: ['./<ENTITY_KEBAB>-entry.component.scss']
})
export class <ENTITY_NAME>EntryComponent implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly notify = inject(ErpNotificationService);
  private readonly authService = inject(AuthenticationService);
  readonly facade = inject(<ENTITY_NAME>Facade);

  readonly model = signal<<ENTITY_NAME>FormModel>(<ENTITY_NAME>FormMapper.createEmpty());
  form!: FormGroup;
  readonly isEditMode = signal(false);
  readonly entityId = signal<number | null>(null);
  readonly loading = signal(false);

  // Error effect — display save errors via notification
  private saveErrorEffect = effect(() => {
    const error = this.facade.saveError();
    if (error) {
      this.notify.showError(this.translate.instant(error));
    }
  });

  ngOnInit(): void {
    this.buildForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.entityId.set(+id);
      this.loadForEdit(this.entityId()!);
    } else {
      this.loadForCreate();
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      fieldName: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(200)]],
      // Add all form controls matching FormModel
    });
  }

  private loadForEdit(id: number): void {
    this.facade.getById(id);

    // When entity loads, patch form
    effect(() => {
      const entity = this.facade.currentEntity();
      if (entity) {
        const formModel = <ENTITY_NAME>FormMapper.fromDomain(entity);
        this.model.set(formModel);
        this.form.patchValue(formModel);
        this.disableImmutableFields();
        // Load children + usage (if applicable)
        this.facade.loadChildren?.(entity.id);
        this.facade.getUsageInfo(entity.id);
      }
    });
  }

  private loadForCreate(): void {
    // Permission check
    if (!this.authService.hasPermission('PERM_<ENTITY_PERM>_CREATE')) {
      return;
    }
    this.form.reset(<ENTITY_NAME>FormMapper.createEmpty());
  }

  private disableImmutableFields(): void {
    // Disable fields that are immutable after creation
    this.form.get('fieldName')?.disable();  // e.g., code, key
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.getRawValue() as <ENTITY_NAME>FormModel;

    if (this.isEditMode() && this.entityId()) {
      const request = <ENTITY_NAME>FormMapper.toUpdateRequest(formValue);
      this.facade.update(this.entityId()!, request, (entity) => {
        this.notify.showSuccess(this.translate.instant('<FEATURE>S.UPDATED_SUCCESS'));
      });
    } else {
      const request = <ENTITY_NAME>FormMapper.toCreateRequest(formValue);
      this.facade.create(request, (entity) => {
        this.notify.showSuccess(this.translate.instant('<FEATURE>S.CREATED_SUCCESS'));
        // Switch to edit mode IN-PLACE — NOT router.navigate
        this.isEditMode.set(true);
        this.entityId.set(entity.id);
        this.disableImmutableFields();
        this.location.replaceState(`/<DOMAIN_DIR>/<ENTITY_URL>/edit/${entity.id}`);
        // Load children + usage
        this.facade.getUsageInfo(entity.id);
      });
    }
  }

  ngOnDestroy(): void {
    this.facade.clearCurrentEntity();
  }
}
```

### Template (`<ENTITY_KEBAB>-entry.component.html`)
```html
<div class="container-fluid">
  <!-- Header — title only; Back/Cancel/Save all live in erp-action-bar
       below (it already renders a Back button via showBack, so do not
       also place a separate erp-back-button here — that would duplicate
       it). Real shared component selectors carry NO `app-` prefix. -->
  <div class="d-flex align-items-center mb-3">
    <h4>{{ (isEditMode() ? '<FEATURE>S.EDIT' : '<FEATURE>S.CREATE') | translate }}</h4>
  </div>

  <!-- Form — Reactive Forms only (see enforce-frontend-architecture rule
       #7). Every `erp-*` shared component input ending in `Key` takes a
       RAW translation key, not a pre-translated string — never pipe
       `| translate` before passing one in; the component does that
       internally. -->
  <form [formGroup]="form">
    <erp-section [titleKey]="'<FEATURE>S.GENERAL_INFO'">
      <div class="row">
        <div class="col-md-6">
          <erp-form-field
            [labelKey]="'<FEATURE>S.FIELD_NAME'"
            [control]="form.get('fieldName')!"
            [hintKey]="isEditMode() ? '<FEATURE>S.FIELD_READONLY_HINT' : undefined">
            <avl-input formControlName="fieldName" [readOnly]="isEditMode()"></avl-input>
          </erp-form-field>
        </div>
        <div class="col-md-6">
          <erp-form-field
            [labelKey]="'<FEATURE>S.DESCRIPTION'"
            [control]="form.get('description')!">
            <avl-input formControlName="description"></avl-input>
          </erp-form-field>
        </div>
      </div>
    </erp-section>
  </form>

  <!-- Bootstrap `row`/`col-md-*` above are the grid/layout utility
       exception — AVELYNQ defines no general-purpose form-field grid
       primitive, only card/stat display grids, so this is not a
       violation. -->

  <!-- Action bar — self-contained Back/Cancel/Save, do not hand-roll
       these buttons. saveKey/cancelKey/loadingKey are raw translation
       keys (defaults already point at COMMON.SAVE/CANCEL/SAVING — only
       override if this entity needs different copy). -->
  <erp-action-bar
    [loading]="facade.saving()"
    [disabled]="form.invalid"
    (backClicked)="cancel()"
    (cancelClicked)="cancel()"
    (saveClicked)="save()">
  </erp-action-bar>

  <!-- Child Section (if applicable) -->
  @if (isEditMode()) {
    <app-<CHILD_KEBAB>-section
      [details]="facade.childEntities()"
      [loading]="facade.childLoading()"
      (add)="onAddChild()"
      (edit)="onEditChild($event)"
      (toggleActive)="onToggleChildActive($event)"
      (delete)="onDeleteChild($event)">
    </app-<CHILD_KEBAB>-section>
  }
</div>
```

---

## PART 5: Child Components (if `HAS_CHILD = true`)

### Section Component (Presentational/Dumb)
**Location:** `components/<CHILD_KEBAB>-section/<CHILD_KEBAB>-section.component.ts`

```typescript
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  // @Input/@Output ONLY — no service injection
})
export class <CHILD_NAME>SectionComponent {
  @Input() details: <CHILD_NAME>Dto[] = [];
  @Input() loading = false;
  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<<CHILD_NAME>Dto>();
  @Output() toggleActive = new EventEmitter<<CHILD_NAME>Dto>();
  @Output() delete = new EventEmitter<<CHILD_NAME>Dto>();
}
```

### Form Modal Component (Self-Contained)
**Location:** `components/<CHILD_KEBAB>-form-modal/<CHILD_KEBAB>-form-modal.component.ts`

> **AVELYNQ migration note — critical:** `ng-bootstrap` (and `NgbModal`
> with it) was fully removed from `package.json` in Phase 3 of the
> AVELYNQ migration. `inject(NgbModal)` will fail to compile — the package
> no longer exists. Use `DrawerService` (record-detail/create-edit forms —
> the right choice for this scaffold) or `DialogService` (short
> confirmations only) from `shared/overlay/`. `AvlOverlayRef`'s `.result`
> promise and `.componentInstance` setter deliberately mirror
> `NgbModalRef`'s shape, so the calling convention is nearly identical to
> the old ngbModal pattern this replaced.

```typescript
import { DrawerService } from '../../../../shared/overlay/drawer/drawer.service';
import { AvlOverlayRef } from '../../../../shared/overlay/avl-overlay-ref';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <CHILD_NAME>FormModalComponent {
  private readonly drawer = inject(DrawerService);
  private readonly fb = inject(FormBuilder);
  // Injected automatically when this component is opened as
  // DrawerService.open()'s componentPortal — see the child injector
  // DrawerService wires internally.
  private readonly drawerRef = inject(AvlOverlayRef<<CHILD_NAME>Dto | undefined>);

  form!: FormGroup;
  readonly isEditMode = signal(false);

  // Called by the PARENT (e.g. <CHILD_NAME>SectionComponent's (add)/(edit)
  // handler), which owns the DrawerService.open() call — this component
  // does NOT call DrawerService itself; it's the content DrawerService
  // opens. See "Parent wiring" below.
  initialize(entity?: <CHILD_NAME>Dto): void {
    this.isEditMode.set(!!entity);
    this.buildForm();
    if (entity) {
      this.form.patchValue(entity);
      this.form.get('code')?.disable();  // Immutable in edit
    }
  }

  onSave(): void {
    if (this.form.invalid) return;
    const formValue = this.form.getRawValue();
    // Use ?? for numeric fields, NOT ||
    const request = {
      ...formValue,
      sortOrder: formValue.sortOrder ?? undefined  // Preserves 0
    };
    this.drawerRef.close(request as <CHILD_NAME>Dto);
  }

  onCancel(): void {
    this.drawerRef.dismiss();
  }
}
```

**Parent wiring** (in `<CHILD_NAME>SectionComponent`'s host, e.g. the
Entry page):
```typescript
private readonly drawer = inject(DrawerService);

openFormModal(entity?: <CHILD_NAME>Dto): void {
  const drawerRef = this.drawer.open(<CHILD_NAME>FormModalComponent, {
    title: entity ? ('<FEATURE>S.EDIT_<CHILD>' | translate) : ('<FEATURE>S.ADD_<CHILD>' | translate),
    size: 'md'
  });
  (drawerRef.componentInstance as <CHILD_NAME>FormModalComponent).initialize(entity);
  drawerRef.afterClosed().subscribe((result) => {
    if (result) { /* handle save */ }
  });
}
```

---

## SHARED COMPONENT CONSUMPTION CHECKLIST

Before creating new components, verify ALL of the following shared resources are imported and used — do NOT recreate equivalent logic:

| # | Shared Resource | Import Path | Purpose |
|---|----------------|-------------|---------|
| SH.1 | `ErpListComponent` | `shared/base/erp-list.component` | Base class for Page A — handles pagination, sort, filter |
| SH.2 | `ERP_DEFAULT_COL_DEF` | `shared/ag-grid/default-col-def` | Default column config for AG Grid |
| SH.3 | `createActiveColumnDef()` | `shared/ag-grid/active-column-def` | Active/Inactive boolean column |
| SH.4 | `createAgGridTheme()` | `core/services/theme.service` | Grid theme factory |
| SH.5 | `ErpFormFieldComponent` | `shared/components/erp-form-field/` | Form field wrapper with validation |
| SH.6 | `ErpSectionComponent` | `shared/components/erp-section/` | Section container |
| SH.7 | `ErpBackButtonComponent` | `shared/components/erp-back-button/` | Back navigation button |
| SH.8 | `ErpPermissionDirective` | `shared/directives/erp-permission.directive` | Permission-based visibility |
| SH.9 | `ErpEmptyStateComponent` | `shared/components/erp-empty-state/` | No data / error display |
| SH.10 | `SpecificationFilterComponent` | `shared/components/specification-filter/` | Filter bar |
| SH.11 | `ErpNotificationService` | `shared/services/erp-notification.service` | Toast notifications |
| SH.12 | `ErpDialogService` | `shared/services/erp-dialog.service` | Confirmation dialogs |

**Rules:**
- NEVER create a custom pagination component — extend `ErpListComponent`
- NEVER create a custom empty state — use `ErpEmptyStateComponent`
- NEVER create a custom form field wrapper — use `ErpFormFieldComponent`
- NEVER create a custom notification system — use `ErpNotificationService`
- NEVER define grid options inline in the component — use grid config file functions
- NEVER create a custom active column renderer — use `createActiveColumnDef()`
- NEVER create a custom grid theme — use `createAgGridTheme()` from `ThemeService`

> **Cross-reference:** After creating components, run [`enforce-reusability`](../enforce-reusability/SKILL.md) to verify no shared code was duplicated.

---

## Contract Rules

| # | Rule | Source | Violation |
|---|------|--------|-----------|
| B.4.1 | All components use `standalone: true` | Contract B.4.1 | NgModule-based components |
| B.4.2 | All components use `ChangeDetectionStrategy.OnPush` | Contract B.4.2 | Default change detection |
| B.4.3 | Facade + ApiService provided via `providers: [...]` in component | Contract B.4.3 | `providedIn: 'root'` |
| B.4.4 | Page A extends `ErpListComponent` | Contract B.4.4 | Custom pagination/sort handling |
| B.4.5 | Grid config in separate `<feature>-grid.config.ts` file | Contract B.4.5 | Inline column definitions |
| B.4.6 | Grid config functions accept `TranslateService` — rebuilt on lang change | Contract B.4.6 | Hardcoded column headers |
| B.4.7 | Actions cell is a standalone AG Grid cell renderer component | Contract B.4.7 | Inline button templates in column def |
| B.4.8 | Page B uses `signal<FormModel>()` + Reactive `FormGroup` | Contract B.4.8 | Template-driven forms |
| B.4.9 | On create success → edit mode in-place (`Location.replaceState()`) NOT `router.navigate` | Contract B.4.9 | `router.navigate` to edit route |
| B.4.10 | Edit mode: disable immutable form fields | Contract B.4.10 | Allowing immutable field editing |
| B.4.11 | `ngOnDestroy` calls `facade.clearCurrentEntity()` | Contract B.4.11 | State leaking between navigations |
| B.4.12 | Error/save-error effects display via `ErpNotificationService` | Contract B.4.12 | Inline error display logic |
| B.4.13 | Permission check in `ngOnInit` before loading data | Contract B.4.13 | Loading data then checking permission |
| B.4.14 | Presentational components: `@Input/@Output` only, no service injection | Contract B.4.14 | Smart child components |
| B.4.15 | Modal manages own `FormGroup` and `AvlOverlayRef` lifecycle (via `DrawerService`/`DialogService`, never `NgbModal` — removed in Phase 3) | Contract B.4.15 | Parent managing modal form state, or any use of `NgbModal` |
| B.4.16 | Numeric form→DTO mappings use `??` NOT `\|\|` | Contract B.4.16 | `sortOrder \|\| undefined` |
| B.4.17 | Component SCSS MUST NOT override `.card-header-right` positioning | See enforce-design-system DS.18 (card-header-right flex) | See enforce-design-system DS.18 |
| B.4.18 | Theme operations use `ThemeService` methods — NEVER direct DOM manipulation | See enforce-design-system DS.19 (::ng-deep forbidden) | See enforce-design-system DS.19 |
| B.4.19 | Component SCSS MUST NOT contain `::ng-deep` for globally-managed styles | See enforce-design-system ThemeService token rules | See enforce-design-system ThemeService token rules |

---

## Component SCSS Rules

### Card Header Layout (CRITICAL)
`.card-header-right` positioning is managed **globally** by `card.scss` using flexbox. Components MUST NOT override it.

**❌ FORBIDDEN in component SCSS:**
```scss
::ng-deep .card-header-right {
  position: absolute;
  right: 20px;
  top: 14px;
}
```

**✅ CORRECT:** Do not include any `.card-header-right` positioning in component SCSS — the global `card.scss` handles it via `display: flex; align-items: center`.

### Theme Integration
- Use `ThemeService.setThemeColor()`, `ThemeService.toggleDarkMode()`, `ThemeService.toggleContainerMode()` — NEVER manipulate DOM directly
- Use `ThemeService.createAgGridTheme()` for AG Grid theme — already listed in SH.4
- ThemeService persists to localStorage and syncs to DOM via `effect()` — components must NOT duplicate this logic

### Arabic Font
- Arabic font is managed globally by `font-family.scss` — components MUST NOT define `[lang="ar"]` font-family overrides in their SCSS

---

## Violations Requiring Immediate Rejection

| Pattern | Rule Violated |
|---------|--------------|
| Missing `standalone: true` on any component | B.4.1 |
| Missing `ChangeDetectionStrategy.OnPush` on any component | B.4.2 |
| `providedIn: 'root'` on facade or API service | B.4.3 |
| Column definitions inline in component class | B.4.5 |
| Hardcoded column headers without `translate.instant()` | B.4.6 |
| `router.navigate` to switch from create to edit mode | B.4.9 |
| Missing `ngOnDestroy` → `facade.clearCurrentEntity()` | B.4.11 |
| Template-driven forms (`[(ngModel)]`) | B.4.8 |
| Presentational child component injecting services | B.4.14 |
| `formValue.numericField \|\| undefined` for numeric mapping | B.4.16 |
| Missing `providers: [Facade, ApiService]` on page component | B.4.3 |
| Grid config not rebuilt on language change | B.4.6 |
| `::ng-deep .card-header-right` in component SCSS | B.4.17 |
| Direct DOM manipulation for theme/dark mode in component | B.4.18 |
| `[lang="ar"] { font-family: ... }` in component SCSS | B.4.19 |

---

## ANGULAR/SKILLS COMPATIBILITY

> This section documents how this skill relates to the official `angular/skills` guidance.
> **ERP contracts always take precedence.** See `erp-priority-override` for the full precedence rule.

### What angular/skills adds that is SAFE to use alongside this skill
- Standalone component syntax — fully aligned with B.4.1
- OnPush change detection — fully aligned with B.4.2
- Signal-based `input()` / `output()` — allowed in presentational components only (B.4.14)
- `viewChild()` for template queries — allowed in all components
- Animations — use patterns from `angular-animations` skill
- ARIA attributes — use patterns from `angular-aria` skill

### What angular/skills suggests that this skill OVERRIDES

| angular/skills Suggestion | This Skill Requires | Rule |
|--------------------------|--------------------|----|
| Signal Forms (`FormField`, `SignalForm`) | `FormGroup + FormBuilder` in Entry component | B.4.8 — automatic rejection |
| `[(ngModel)]` template-driven forms | Reactive Forms only | B.4.8 — automatic rejection |
| `model()` inputs in page components | `@Input()` decorator only on page components | B.4.14 |
| `router.navigate` for create→edit | `Location.replaceState()` | B.4.9 — automatic rejection |
| `providedIn: 'root'` on providers | `providers: [Facade, ApiService]` in component | B.4.3 — automatic rejection |
| Plain class properties for state | `signal()` for all state (`isEditMode`, `entityId`, `loading`) | S.1.9 — automatic rejection |
| `*ngFor` / `*ngIf` directives | `@for` / `@if` Angular 17+ control flow | angular-directives hard rule |

> **Documented historical exception — not a precedent.** `auth-login` and
> `auth-register` (`src/app/modules/security/authentication/pages/`) use
> Angular's experimental `@angular/forms/signals` API. These pre-date
> strict enforcement of this rule and are NOT an approved pattern to
> replicate — Signal Forms remains prohibited for all new/generated
> components per B.4.8. If either screen is ever regenerated or
> significantly reworked, migrate it to Reactive Forms at that time rather
> than treating its current implementation as sanctioned. Reason for
> keeping the prohibition (not merely inertia): Signal Forms was found to
> NOT auto-intercept a `<form>`'s native `submit` event the way
> `FormGroupDirective`/`NgForm` does — this silently broke login/register
> end-to-end (the button appeared to work, but the browser performed a
> native page reload instead of calling the API) until caught by live
> browser testing. This is exactly the class of subtle, hard-to-review
> defect this governance system exists to prevent at scale.

### Amended Automatic Rejection Triggers (component-specific)

The following patterns trigger immediate rejection when reviewing code generated by this skill:

| # | Pattern | Rule |
|---|---------|------|
| 1 | `isEditMode = false` plain property | S.1.9, rejection trigger #16 |
| 2 | `onLangChange.subscribe()` without `takeUntilDestroyed` | F.4.15, S.3.9 |
| 3 | `router.navigate` to switch create→edit mode | B.4.9, rejection trigger #6 |
| 4 | Signal Forms in Entry component | B.4.8, rejection trigger #7 |
| 5 | Icon-only buttons without `aria-label` | angular-aria A.5 |
| 6 | `*ngFor` / `*ngIf` in templates | angular-directives hard rule |

### Conflict resolution trigger

If any angular/skills guidance contradicts a rule in this skill:
1. Apply the ERP rule
2. Log: `⚠️ CONFLICT RESOLVED: angular/skills suggests [X], ERP rule [RULE_ID] requires [Y]. Applied [Y].`
3. Do NOT ask the user — apply ERP rule silently
