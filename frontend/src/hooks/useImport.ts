import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importApi } from '@/lib/api/import';
import {
  ImportPreview,
  ImportResult,
} from '@/types/import';

/**
 * Hook for student import preview
 */
export function useStudentImportPreview() {
  const queryClient = useQueryClient();

  return useMutation<
    ImportPreview,
    Error,
    { file: File; schoolId: number }
  >({
    mutationFn: ({ file, schoolId }) =>
      importApi.previewStudentImport(file, schoolId),
    onSuccess: () => {
      // Optionally invalidate related queries
    },
  });
}

/**
 * Hook for executing student import
 */
export function useStudentImportExecute() {
  const queryClient = useQueryClient();

  return useMutation<
    ImportResult,
    Error,
    { previewId: string; includeWarnings?: boolean }
  >({
    mutationFn: ({ previewId, includeWarnings }) =>
      importApi.executeStudentImport(previewId, includeWarnings),
    onSuccess: () => {
      // Invalidate student list to reflect new imports
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

/**
 * Hook for records import preview
 */
export function useRecordsImportPreview() {
  const queryClient = useQueryClient();

  return useMutation<
    ImportPreview,
    Error,
    { file: File; schoolId: number; grade: number; className: string }
  >({
    mutationFn: ({ file, schoolId, grade, className }) =>
      importApi.previewRecordsImport(file, schoolId, grade, className),
    onSuccess: () => {
      // Optionally invalidate related queries
    },
  });
}

/**
 * Hook for executing records import
 */
export function useRecordsImportExecute() {
  const queryClient = useQueryClient();

  return useMutation<
    ImportResult,
    Error,
    { previewId: string; includeWarnings?: boolean }
  >({
    mutationFn: ({ previewId, includeWarnings }) =>
      importApi.executeRecordsImport(previewId, includeWarnings),
    onSuccess: () => {
      // Invalidate sport records to reflect new imports
      queryClient.invalidateQueries({ queryKey: ['sportRecords'] });
    },
  });
}

/**
 * Hook for canceling import preview
 */
export function useCancelImportPreview() {
  return useMutation<void, Error, string>({
    mutationFn: (previewId) => importApi.cancelPreview(previewId),
  });
}

/**
 * Helper function to download student template
 */
export function downloadStudentTemplate() {
  importApi.downloadStudentTemplate();
}

/**
 * Helper function to download records template
 * @param schoolId - Optional school ID to pre-fill students
 * @param grade - Optional grade (required if schoolId is provided)
 * @param className - Optional class name
 */
export function downloadRecordsTemplate(schoolId?: number, grade?: number, className?: string) {
  importApi.downloadRecordsTemplate(schoolId, grade, className);
}
