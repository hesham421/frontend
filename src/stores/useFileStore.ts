import { create } from 'zustand';
import { FileAttachment, FileCategory, mockFileAttachments, mockFileCategories } from '../data/mockData';

export interface FileState {
  files: FileAttachment[];
  categories: FileCategory[];
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  selectedCategoryFk: string;
  isDeleteConfirmOpen: boolean;
  fileToDeleteId: string | null;

  // Actions
  setSelectedCategoryFk: (categoryFk: string) => void;
  getFilesByOwner: (ownerId: string, moduleCode?: string) => FileAttachment[];
  startMockUpload: (
    file: { name: string; size: number; type: string },
    ownerId: string,
    ownerType: string,
    moduleCode: string,
    onSuccess?: () => void
  ) => void;
  openDeleteConfirm: (fileId: string) => void;
  closeDeleteConfirm: () => void;
  executeDeleteFile: () => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: mockFileAttachments,
  categories: mockFileCategories,
  isUploading: false,
  uploadProgress: 0,
  uploadError: null,
  selectedCategoryFk: 'ALL',
  isDeleteConfirmOpen: false,
  fileToDeleteId: null,

  setSelectedCategoryFk: (selectedCategoryFk) => set({ selectedCategoryFk }),

  getFilesByOwner: (ownerId, moduleCode) => {
    const { files, selectedCategoryFk } = get();
    return files.filter((f) => {
      const matchOwner = f.ownerId === ownerId || (f.moduleCode === moduleCode && !f.ownerId);
      const matchCategory = selectedCategoryFk === 'ALL' || f.fileCategoryFk === selectedCategoryFk;
      return matchOwner && matchCategory;
    });
  },

  startMockUpload: (file, ownerId, ownerType, moduleCode, onSuccess) => {
    const { categories, selectedCategoryFk } = get();

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      set({ uploadError: 'File size exceeds maximum allowed limit of 5MB.' });
      return;
    }

    set({ isUploading: true, uploadProgress: 10, uploadError: null });

    // Step 1: Simulated /upload-token
    setTimeout(() => {
      set({ uploadProgress: 45 });

      // Step 2: Simulated /upload/{token}
      setTimeout(() => {
        set({ uploadProgress: 90 });

        setTimeout(() => {
          const category =
            selectedCategoryFk !== 'ALL'
              ? selectedCategoryFk
              : categories.find((c) => c.moduleCode === moduleCode)?.id || categories[0].id;

          const newFile: FileAttachment = {
            id: `file-${Date.now()}`,
            fileName: file.name,
            fileSize: file.size,
            fileCategoryFk: category,
            fileType: file.type || 'application/octet-stream',
            uploadDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
            ownerId,
            ownerType,
            moduleCode,
            downloadUrl: '#',
          };

          set((state) => ({
            files: [newFile, ...state.files],
            isUploading: false,
            uploadProgress: 100,
            uploadError: null,
          }));

          if (onSuccess) onSuccess();
        }, 300);
      }, 400);
    }, 300);
  },

  openDeleteConfirm: (fileId) => set({ fileToDeleteId: fileId, isDeleteConfirmOpen: true }),
  closeDeleteConfirm: () => set({ fileToDeleteId: null, isDeleteConfirmOpen: false }),
  executeDeleteFile: () => {
    const { fileToDeleteId } = get();
    if (!fileToDeleteId) return;
    set((state) => ({
      files: state.files.filter((f) => f.id !== fileToDeleteId),
      isDeleteConfirmOpen: false,
      fileToDeleteId: null,
    }));
  },
}));
