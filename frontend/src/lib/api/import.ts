import axios from 'axios';
import {
  ImportPreview,
  ImportResult,
  ExecuteImportRequest,
} from '@/types/import';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Create axios instance for import API
const importAxios = axios.create({
  baseURL: `${API_BASE}/import`,
});

// Add auth token to requests
importAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const importApi = {
  /**
   * Download student list Excel template
   */
  downloadStudentTemplate: () => {
    // Use window.location for file download to trigger browser download
    const token = localStorage.getItem('token');
    const url = `${API_BASE}/import/templates/students`;

    // Create a temporary link to download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student-list-template.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Download sport records Excel template
   * @param schoolId - Optional school ID to pre-fill students
   * @param grade - Optional grade (required if schoolId is provided)
   * @param className - Optional class name
   */
  downloadRecordsTemplate: (schoolId?: number, grade?: number, className?: string) => {
    let url = `${API_BASE}/import/templates/records`;

    // Add query parameters if provided
    if (schoolId && grade) {
      const params = new URLSearchParams();
      params.append('school_id', schoolId.toString());
      params.append('grade', grade.toString());
      if (className) {
        params.append('class', className);
      }
      url += `?${params.toString()}`;
    }

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sport-records-template.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Preview student import - upload and validate Excel file
   */
  previewStudentImport: async (
    file: File,
    schoolId: number
  ): Promise<ImportPreview> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('school_id', schoolId.toString());

    const response = await importAxios.post('/students/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Preview records import - upload and validate Excel file
   */
  previewRecordsImport: async (
    file: File,
    schoolId: number,
    grade: number,
    className: string
  ): Promise<ImportPreview> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('school_id', schoolId.toString());
    formData.append('grade', grade.toString());
    formData.append('class', className);

    const response = await importAxios.post('/records/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Execute student import from preview
   */
  executeStudentImport: async (
    previewId: string,
    includeWarnings: boolean = true
  ): Promise<ImportResult> => {
    const request: ExecuteImportRequest = {
      preview_id: previewId,
      include_warnings: includeWarnings,
    };

    const response = await importAxios.post('/students/execute', request);
    return response.data.data;
  },

  /**
   * Execute records import from preview
   */
  executeRecordsImport: async (
    previewId: string,
    includeWarnings: boolean = true
  ): Promise<ImportResult> => {
    const request: ExecuteImportRequest = {
      preview_id: previewId,
      include_warnings: includeWarnings,
    };

    const response = await importAxios.post('/records/execute', request);
    return response.data.data;
  },

  /**
   * Cancel an import preview (free memory)
   */
  cancelPreview: async (previewId: string): Promise<void> => {
    await importAxios.delete(`/preview/${previewId}`);
  },
};

export default importApi;
