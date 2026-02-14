// Import Types for Excel Batch Import Feature

export type ImportType = 'students' | 'records';
export type RowStatus = 'valid' | 'warning' | 'error';

// Preview response from backend
export interface ImportPreview {
  preview_id: string;
  type: ImportType;
  school_id: number;
  grade?: number;
  class?: string;
  file_name: string;
  total_rows: number;
  valid_rows: number;
  warning_rows: number;
  error_rows: number;
  expires_at: string;
  rows: ImportRow[];
}

// Single row in import preview
export interface ImportRow {
  row_number: number;
  status: RowStatus;
  data: StudentRowData | RecordRowData;
  errors: RowError[];
}

// Student data from Excel row
export interface StudentRowData {
  student_number: string;
  name: string;
  gender: string;
  grade: number;
  class_name: string;
  birth_date: string | null;
}

// Sport record data from Excel row
export interface RecordRowData {
  student_number: string;
  student_name: string;
  height: number | null;
  weight: number | null;
  sit_and_reach: number | null;
  standing_jump: number | null;
  situps: number | null;
  cardio: number | null;
  test_date: string;
}

// Validation error for a single field
export interface RowError {
  field: string;
  code: string;
  message: string;
  level: 'error' | 'warning';
}

// Import execution result
export interface ImportResult {
  preview_id: string;
  type: ImportType;
  success_count: number;
  skip_count: number;
  errors: ImportedError[];
  executed_at: string;
}

// Error detail for skipped row
export interface ImportedError {
  row_number: number;
  field?: string;
  message: string;
}

// Request to execute import
export interface ExecuteImportRequest {
  preview_id: string;
  include_warnings?: boolean;
}

// Student import preview request
export interface StudentPreviewRequest {
  file: File;
  school_id: number;
}

// Records import preview request
export interface RecordsPreviewRequest {
  file: File;
  school_id: number;
  grade: number;
  class_name: string;
}
