import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { mapApiError } from '../../lib/errors/mapApiError';
import { EmptyState } from './OverlaysAndFeedback';

export interface TableColumn<T> {
  key: string;
  header: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  /** Fixed/constrained column width (e.g. '140px'). Omit to let the column size to content. */
  width?: string;
  render: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => React.Key;
  /** True only while the list itself is (re)loading — not while an unrelated mutation (e.g. Save) is pending. */
  isLoading?: boolean;
  /** The error from the list-load request, if the last attempt failed. Rendered as a distinct state from "no data." */
  loadError?: unknown;
  onRetry?: () => void;
  emptyIcon?: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: { label: string; onClick: () => void };
}

/**
 * Shared list table. Every Security screen previously hand-rolled this same
 * markup independently (identical header/row styling) and, more importantly,
 * had no way to distinguish "the load failed" from "there is genuinely no
 * data" — both rendered the same empty state. This component fixes both at
 * once, in one place.
 */
export function Table<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  loadError = null,
  onRetry,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: TableProps<T>) {
  const { t } = useLanguage();
  // Fixed layout only when at least one column asks for a specific width —
  // otherwise columns keep auto-sizing to content, as every table without
  // explicit widths already relies on.
  const tableLayout = columns.some((c) => c.width) ? 'fixed' : undefined;

  if (isLoading && rows.length === 0 && !loadError) {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', tableLayout }}>
          <thead>
            <tr style={{ background: 'var(--surface-page, #F8FAFC)', borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '12px 18px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-subtle, #8C9AAC)',
                    textAlign: col.align || 'start',
                    width: col.width,
                    ...(col.width ? { maxWidth: col.width } : {}),
                  }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, rowIdx) => (
              <tr key={rowIdx} style={{ borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '14px 18px', width: col.width, ...(col.width ? { maxWidth: col.width } : {}) }}>
                    <span
                      className="avl-skeleton-bar"
                      style={{
                        display: 'block',
                        height: '14px',
                        width: `${55 + ((rowIdx * 13 + col.key.length * 7) % 35)}%`,
                        borderRadius: '4px',
                        background: 'var(--surface-sunken, #F1F5F9)',
                        animation: 'avl-pulse 1.3s ease-in-out infinite',
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (loadError) {
    return (
      <EmptyState
        tone="error"
        title={t('unableToLoadTitle')}
        description={mapApiError(loadError, t)}
        action={onRetry ? { label: t('retry'), onClick: onRetry } : undefined}
      />
    );
  }

  if (rows.length === 0) {
    return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  }

  return (
    <div className="avl-table-scroll" style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start', tableLayout }}>
        <thead>
          <tr style={{ background: 'var(--surface-page, #F8FAFC)', borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '12px 18px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-subtle, #8C9AAC)',
                  textAlign: col.align || 'start',
                  width: col.width,
                  // Long unbroken text (a code, a URL, an id) wraps inside its
                  // own column instead of spilling past the cell boundary and
                  // visually overlapping the next column's content.
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                  ...(col.width ? { maxWidth: col.width, overflow: 'hidden' } : {}),
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} style={{ borderBottom: '1px solid var(--border-subtle, #E6ECF3)', transition: 'background 120ms ease' }}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: '14px 18px',
                    textAlign: col.align || 'start',
                    width: col.width,
                    verticalAlign: 'middle',
                    // Same overflow containment as the header — see comment above.
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    ...(col.width ? { maxWidth: col.width, overflow: 'hidden' } : {}),
                  }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
