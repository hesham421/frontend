import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useFileStore } from '../../stores/useFileStore';
import { Card, Badge, Stat } from '../../components/ui/DataDisplay';
import { Button, IconButton } from '../../components/ui/Button';
import { Select } from '../../components/ui/FormControls';
import { Dialog, EmptyState, Alert } from '../../components/ui/OverlaysAndFeedback';

export interface FileAttachmentPanelProps {
  ownerId: string;
  ownerType: string;
  moduleCode: string;
}

export const FileAttachmentPanel: React.FC<FileAttachmentPanelProps> = ({
  ownerId,
  ownerType,
  moduleCode,
}) => {
  const { t, lang } = useLanguage();
  const {
    categories,
    isUploading,
    uploadProgress,
    uploadError,
    selectedCategoryFk,
    isDeleteConfirmOpen,
    setSelectedCategoryFk,
    getFilesByOwner,
    startMockUpload,
    openDeleteConfirm,
    closeDeleteConfirm,
    executeDeleteFile,
  } = useFileStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('fc-2');

  const files = getFilesByOwner(ownerId, moduleCode);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    startMockUpload(
      { name: file.name, size: file.size, type: file.type },
      ownerId,
      ownerType,
      moduleCode
    );
  };

  const categoryOptions = [
    { value: 'ALL', label: t('all') },
    ...categories.map((c) => ({ value: c.id, label: lang === 'ar' ? c.nameAr : c.nameEn })),
  ];

  const uploadCategoryOptions = categories.map((c) => ({
    value: c.id,
    label: lang === 'ar' ? c.nameAr : c.nameEn,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-strong, #14222F)', margin: 0, textAlign: 'start' }}>
            {t('fileAttachments')}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted, #647488)' }}>
            Owner: {ownerType} ({ownerId})
          </span>
        </div>
        <div style={{ width: '180px' }}>
          <Select
            options={categoryOptions}
            value={selectedCategoryFk}
            onChange={(e) => setSelectedCategoryFk(e.target.value)}
          />
        </div>
      </div>

      {uploadError && (
        <Alert variant="danger" message={uploadError} />
      )}

      {/* Drag & Drop Upload Dropzone */}
      <Card variant="flat" padding="md">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFilesSelected(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? 'var(--brand-primary, #2466D8)' : 'var(--border-default, #B7C3D1)'}`,
            borderRadius: 'var(--radius-md, 8px)',
            padding: '24px 16px',
            textAlign: 'center',
            background: isDragOver ? 'rgba(36, 102, 216, 0.04)' : 'var(--surface-page, #F8FAFC)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <i className="ti ti-cloud-upload" aria-hidden="true" style={{ fontSize: '32px', color: 'var(--brand-primary, #2466D8)', marginBottom: '8px', display: 'inline-block' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-strong, #14222F)', marginBottom: '4px' }}>
            {t('dragDropFile')}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted, #647488)' }}>
            {t('maxFileSize')}
          </div>
        </div>

        {/* Progress indicator during simulated 2-step token upload */}
        {isUploading && (
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-strong, #14222F)', marginBottom: '6px' }}>
              <span>{t('uploading')}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--surface-sunken, #E6ECF3)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${uploadProgress}%`,
                  background: 'var(--brand-primary, #2466D8)',
                  transition: 'width 200ms ease',
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Attached Files List */}
      <Card variant="flat" padding="none">
        {files.length === 0 ? (
          <EmptyState
            icon="ti ti-paperclip"
            title={t('noFilesFound')}
            description={t('noFilesDesc')}
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'start' }}>
              <thead>
                <tr style={{ background: 'var(--surface-page, #F8FAFC)', borderBottom: '1px solid var(--border-subtle, #E6ECF3)' }}>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    Document Name
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('fileCategory')}
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('fileSize')}
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'start' }}>
                    {t('uploadDate')}
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '12px', fontWeight: 600, color: 'var(--text-subtle, #8C9AAC)', textAlign: 'end' }}>
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => {
                  const cat = categories.find((c) => c.id === file.fileCategoryFk);
                  const isPdf = file.fileName.endsWith('.pdf');
                  return (
                    <tr
                      key={file.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle, #E6ECF3)',
                        transition: 'background 120ms ease',
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <i
                            className={isPdf ? 'ti ti-file-type-pdf' : 'ti ti-file-text'}
                            aria-hidden="true"
                            style={{
                              color: isPdf ? 'var(--red-500, #CB3A2D)' : 'var(--brand-primary, #2466D8)',
                              fontSize: '18px',
                            }}
                          />
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-strong, #14222F)' }}>
                            {file.fileName}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge variant="primary" size="sm">
                          {cat ? (lang === 'ar' ? cat.nameAr : cat.nameEn) : file.fileCategoryFk}
                        </Badge>
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted, #647488)' }}>
                        {formatFileSize(file.fileSize)}
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted, #647488)' }}>
                        {file.uploadDate}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'end' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <IconButton
                            icon="ti ti-download"
                            label={t('download')}
                            variant="ghost"
                            size="sm"
                            onClick={() => alert(`Downloading ${file.fileName}...`)}
                          />
                          <IconButton
                            icon="ti ti-trash"
                            label={t('delete')}
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteConfirm(file.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteConfirmOpen}
        onClose={closeDeleteConfirm}
        title={t('confirmActionTitle')}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="secondary" onClick={closeDeleteConfirm}>
              {t('cancel')}
            </Button>
            <Button variant="danger" onClick={executeDeleteFile}>
              {t('delete')}
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-body, #354456)' }}>
          {t('confirmDeleteFile')}
        </p>
      </Dialog>
    </div>
  );
};
