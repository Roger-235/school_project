import React, { useState, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { SchoolSelector } from './SchoolSelector';
import { PreviewTable } from './PreviewTable';
import { ImportResult as ImportResultComponent } from './ImportResult';
import {
  useStudentImportPreview,
  useStudentImportExecute,
  useCancelImportPreview,
  downloadStudentTemplate,
} from '@/hooks/useImport';
import { School } from '@/types/sports';
import { ImportPreview, ImportResult } from '@/types/import';

type WizardStep = 'select' | 'upload' | 'preview' | 'result';

export function StudentImportWizard() {
  const [step, setStep] = useState<WizardStep>('select');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [includeWarnings, setIncludeWarnings] = useState(true);

  const previewMutation = useStudentImportPreview();
  const executeMutation = useStudentImportExecute();
  const cancelMutation = useCancelImportPreview();

  // Calculate stats from preview
  const previewStats = preview?.rows.reduce(
    (acc, row) => {
      acc[row.status]++;
      return acc;
    },
    { valid: 0, warning: 0, error: 0 }
  ) || { valid: 0, warning: 0, error: 0 };

  const canExecute = previewStats.valid > 0 || (includeWarnings && previewStats.warning > 0);

  const handleSchoolSelect = useCallback((school: School | null) => {
    setSelectedSchool(school);
    if (school) {
      setStep('upload');
    }
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!selectedSchool) return;

    setSelectedFile(file);

    try {
      const result = await previewMutation.mutateAsync({
        file,
        schoolId: selectedSchool.id,
      });
      setPreview(result);
      setStep('preview');
    } catch (error) {
      console.error('Preview failed:', error);
    }
  }, [selectedSchool, previewMutation]);

  const handleExecute = useCallback(async () => {
    if (!preview) return;

    try {
      const result = await executeMutation.mutateAsync({
        previewId: preview.preview_id,
        includeWarnings,
      });
      setResult(result);
      setStep('result');
    } catch (error) {
      console.error('Execute failed:', error);
    }
  }, [preview, includeWarnings, executeMutation]);

  const handleCancel = useCallback(async () => {
    if (preview) {
      try {
        await cancelMutation.mutateAsync(preview.preview_id);
      } catch (error) {
        console.error('Cancel failed:', error);
      }
    }
    // Reset to initial state
    setStep('select');
    setSelectedSchool(null);
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  }, [preview, cancelMutation]);

  const handleNewImport = useCallback(() => {
    setStep('select');
    setSelectedSchool(null);
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
  }, []);

  const handleBack = useCallback(() => {
    if (step === 'upload') {
      setStep('select');
      setSelectedFile(null);
    } else if (step === 'preview') {
      if (preview) {
        cancelMutation.mutate(preview.preview_id);
      }
      setStep('upload');
      setPreview(null);
    }
  }, [step, preview, cancelMutation]);

  // Step indicators
  const steps = [
    { key: 'select', label: '選擇學校' },
    { key: 'upload', label: '上傳檔案' },
    { key: 'preview', label: '預覽確認' },
    { key: 'result', label: '匯入結果' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step indicators */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((s, idx) => (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    idx < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : idx === currentStepIndex
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx < currentStepIndex ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={`mt-2 text-sm ${
                    idx === currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`w-20 h-1 mx-2 ${
                    idx < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Step 1: Select School */}
        {step === 'select' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">選擇目標學校</h2>
              <p className="text-gray-600">請選擇要匯入學生名單的學校</p>
            </div>

            <SchoolSelector
              selectedSchoolId={selectedSchool?.id || null}
              onSelect={handleSchoolSelect}
            />

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">需要模板？</p>
              <button
                type="button"
                onClick={downloadStudentTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下載學生名單模板
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Upload File */}
        {step === 'upload' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">上傳 Excel 檔案</h2>
              <p className="text-gray-600">
                目標學校：<span className="font-medium">{selectedSchool?.name}</span>
              </p>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              disabled={previewMutation.isPending}
            />

            {previewMutation.isPending && (
              <div className="mt-4 flex items-center justify-center text-blue-600">
                <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                正在解析檔案...
              </div>
            )}

            {previewMutation.isError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-medium">解析失敗</p>
                <p className="text-sm">{(previewMutation.error as Error)?.message || '請確認檔案格式正確'}</p>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← 返回選擇學校
              </button>
              <button
                type="button"
                onClick={downloadStudentTemplate}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                下載模板
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && preview && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">預覽匯入資料</h2>
              <p className="text-gray-600">
                檔案：<span className="font-medium">{selectedFile?.name}</span> →{' '}
                <span className="font-medium">{selectedSchool?.name}</span>
              </p>
            </div>

            <PreviewTable rows={preview.rows} type="students" />

            {/* Options */}
            {previewStats.warning > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeWarnings}
                    onChange={(e) => setIncludeWarnings(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-yellow-800">
                    包含 {previewStats.warning} 筆有警告的資料
                  </span>
                </label>
              </div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <button
                type="button"
                onClick={handleBack}
                disabled={executeMutation.isPending}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                ← 重新上傳
              </button>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={executeMutation.isPending}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={!canExecute || executeMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {executeMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      匯入中...
                    </>
                  ) : (
                    <>
                      確認匯入
                      {canExecute && (
                        <span className="text-sm opacity-80">
                          ({previewStats.valid + (includeWarnings ? previewStats.warning : 0)} 筆)
                        </span>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>

            {executeMutation.isError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <p className="font-medium">匯入失敗</p>
                <p className="text-sm">{(executeMutation.error as Error)?.message || '請稍後再試'}</p>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Result */}
        {step === 'result' && result && (
          <ImportResultComponent
            result={result}
            type="students"
            onClose={() => window.history.back()}
            onNewImport={handleNewImport}
          />
        )}
      </div>
    </div>
  );
}

export default StudentImportWizard;
