import React from 'react';
import { GRADES } from '@/types/sports';

interface GradeClassSelectorProps {
  grade: number | null;
  className: string;
  onGradeChange: (grade: number | null) => void;
  onClassChange: (className: string) => void;
  disabled?: boolean;
}

export function GradeClassSelector({
  grade,
  className,
  onGradeChange,
  onClassChange,
  disabled = false,
}: GradeClassSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Grade selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          年級 <span className="text-red-500">*</span>
        </label>
        <select
          value={grade ?? ''}
          onChange={(e) => onGradeChange(e.target.value ? Number(e.target.value) : null)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">請選擇年級</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g} 年級
            </option>
          ))}
        </select>
      </div>

      {/* Class name input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          班級 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={className}
          onChange={(e) => onClassChange(e.target.value)}
          placeholder="例如：甲、A、1"
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
}

export default GradeClassSelector;
