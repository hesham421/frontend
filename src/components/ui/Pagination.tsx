import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from './Button';

export interface PaginationProps {
  page: number; // zero-based, matches the search API's `page` field
  size: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  style?: React.CSSProperties;
}

/**
 * Reads the page/size/totalElements shape every Security search facade
 * already returns and was, until now, never rendered anywhere.
 */
export const Pagination: React.FC<PaginationProps> = ({ page, size, totalElements, onPageChange, style = {} }) => {
  const { t } = useLanguage();

  if (totalElements <= size) return null;

  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min(totalElements, (page + 1) * size);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '12px 18px',
        borderTop: '1px solid var(--border-subtle, #E6ECF3)',
        fontFamily: 'var(--font-sans)',
        fontSize: '13px',
        color: 'var(--text-muted, #647488)',
        ...style,
      }}
    >
      <span>
        {t('showing')} {start}–{end} {t('of')} {totalElements} {t('items')}
      </span>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button variant="secondary" size="sm" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
          {t('prevPage')}
        </Button>
        <span>
          {page + 1} / {totalPages}
        </span>
        <Button variant="secondary" size="sm" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>
          {t('nextPage')}
        </Button>
      </div>
    </div>
  );
};
