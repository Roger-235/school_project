import React, { useState, useMemo } from 'react';
import { useSchools } from '@/hooks/useSchools';
import { School } from '@/types/sports';

interface SchoolSelectorProps {
  selectedSchoolId: number | null;
  onSelect: (school: School | null) => void;
  disabled?: boolean;
}

export function SchoolSelector({
  selectedSchoolId,
  onSelect,
  disabled = false,
}: SchoolSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Fetch all schools (using large page size for selector)
  const { data, isLoading, error } = useSchools(1, 1000);

  const schools = data?.data?.schools || [];

  // Filter schools based on search term
  const filteredSchools = useMemo(() => {
    if (!searchTerm.trim()) return schools;
    const term = searchTerm.toLowerCase();
    return schools.filter(
      (school) =>
        school.name.toLowerCase().includes(term) ||
        school.county_name.toLowerCase().includes(term)
    );
  }, [schools, searchTerm]);

  // Get selected school object
  const selectedSchool = useMemo(() => {
    if (!selectedSchoolId) return null;
    return schools.find((s) => s.id === selectedSchoolId) || null;
  }, [schools, selectedSchoolId]);

  const handleSelect = (school: School) => {
    onSelect(school);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onSelect(null);
    setSearchTerm('');
  };

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        載入學校列表失敗，請重新整理頁面
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        選擇學校 <span className="text-red-500">*</span>
      </label>

      {/* Selected school display or search input */}
      {selectedSchool ? (
        <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
          <div>
            <p className="font-medium text-gray-900">{selectedSchool.name}</p>
            <p className="text-sm text-gray-500">{selectedSchool.county_name}</p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="搜尋學校名稱或縣市..."
            disabled={disabled || isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Dropdown list */}
      {isOpen && !selectedSchool && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredSchools.length === 0 ? (
            <div className="p-3 text-gray-500 text-center">
              {isLoading ? '載入中...' : searchTerm ? '找不到符合的學校' : '沒有學校資料'}
            </div>
          ) : (
            filteredSchools.map((school) => (
              <button
                key={school.id}
                type="button"
                onClick={() => handleSelect(school)}
                className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <p className="font-medium text-gray-900">{school.name}</p>
                <p className="text-sm text-gray-500">{school.county_name}</p>
              </button>
            ))
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default SchoolSelector;
