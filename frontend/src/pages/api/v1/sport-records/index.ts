/**
 * Mock API: Sport Records List and Create
 * 模擬後端 API，提供運動記錄 CRUD
 * Feature: 003-student-sports-data
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// 運動類型映射（category 使用中文以匹配 TypeScript 類型）
const sportTypesMap: Record<number, { name: string; category: string; default_unit: string; value_type: string }> = {
  1: { name: '800公尺', category: '體適能', default_unit: '秒', value_type: 'time' },
  2: { name: '1600公尺', category: '體適能', default_unit: '秒', value_type: 'time' },
  3: { name: '坐姿體前彎', category: '體適能', default_unit: '公分', value_type: 'distance' },
  4: { name: '1分鐘仰臥起坐', category: '體適能', default_unit: '次', value_type: 'count' },
  5: { name: '立定跳遠', category: '體適能', default_unit: '公分', value_type: 'distance' },
  6: { name: '1分鐘屈膝仰臥起坐', category: '體適能', default_unit: '次', value_type: 'count' },
  7: { name: '100公尺', category: '田徑', default_unit: '秒', value_type: 'time' },
  8: { name: '200公尺', category: '田徑', default_unit: '秒', value_type: 'time' },
  9: { name: '400公尺', category: '田徑', default_unit: '秒', value_type: 'time' },
  10: { name: '跳遠', category: '田徑', default_unit: '公分', value_type: 'distance' },
  11: { name: '跳高', category: '田徑', default_unit: '公分', value_type: 'distance' },
  12: { name: '鉛球', category: '田徑', default_unit: '公尺', value_type: 'distance' },
  13: { name: '壘球擲遠', category: '田徑', default_unit: '公尺', value_type: 'distance' },
  14: { name: '籃球運球', category: '球類', default_unit: '秒', value_type: 'time' },
  15: { name: '足球運球', category: '球類', default_unit: '秒', value_type: 'time' },
  16: { name: '排球墊球', category: '球類', default_unit: '次', value_type: 'count' },
  17: { name: '桌球正手擊球', category: '球類', default_unit: '次', value_type: 'count' },
};

// 模擬運動記錄資料
let mockRecords = [
  {
    id: 1,
    student_id: 1,
    sport_type_id: 5,
    sport_type: { id: 5, ...sportTypesMap[5] },
    value: 185.5,
    test_date: '2024-03-15',
    notes: '初次測試',
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
    created_by: 1,
  },
  {
    id: 2,
    student_id: 1,
    sport_type_id: 5,
    sport_type: { id: 5, ...sportTypesMap[5] },
    value: 190.2,
    test_date: '2024-04-20',
    notes: '進步 4.7 公分',
    created_at: '2024-04-20T10:00:00Z',
    updated_at: '2024-04-20T10:00:00Z',
    created_by: 1,
  },
  {
    id: 3,
    student_id: 1,
    sport_type_id: 7,
    sport_type: { id: 7, ...sportTypesMap[7] },
    value: 14.2,
    test_date: '2024-03-20',
    notes: '',
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
    created_by: 1,
  },
  {
    id: 4,
    student_id: 2,
    sport_type_id: 4,
    sport_type: { id: 4, ...sportTypesMap[4] },
    value: 35,
    test_date: '2024-03-18',
    notes: '表現良好',
    created_at: '2024-03-18T10:00:00Z',
    updated_at: '2024-03-18T10:00:00Z',
    created_by: 1,
  },
];

// 模擬審計記錄
let mockAuditRecords: Record<number, Array<{
  id: number;
  record_id: number;
  previous_value: number | null;
  new_value: number;
  change_reason: string;
  changed_at: string;
  changed_by: number;
}>> = {
  2: [
    {
      id: 1,
      record_id: 2,
      previous_value: 188.0,
      new_value: 190.2,
      change_reason: '修正測量誤差',
      changed_at: '2024-04-21T10:00:00Z',
      changed_by: 1,
    },
  ],
};

let nextRecordId = 5;
let nextAuditId = 2;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method not allowed',
          status: 405,
        },
      });
  }
}

function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = '1',
    page_size = '20',
    student_id,
    sport_type_id,
  } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(page_size as string, 10);

  let filteredRecords = [...mockRecords];

  // Filter by student_id (required)
  if (student_id) {
    const studentIdNum = parseInt(student_id as string, 10);
    filteredRecords = filteredRecords.filter((r) => r.student_id === studentIdNum);
  }

  // Filter by sport_type_id
  if (sport_type_id) {
    const sportTypeIdNum = parseInt(sport_type_id as string, 10);
    filteredRecords = filteredRecords.filter((r) => r.sport_type_id === sportTypeIdNum);
  }

  // Sort by test_date desc
  filteredRecords.sort((a, b) => new Date(b.test_date).getTime() - new Date(a.test_date).getTime());

  // Pagination
  const total = filteredRecords.length;
  const totalPages = Math.ceil(total / pageSizeNum);
  const offset = (pageNum - 1) * pageSizeNum;
  const paginatedRecords = filteredRecords.slice(offset, offset + pageSizeNum);

  res.status(200).json({
    data: {
      records: paginatedRecords,
      pagination: {
        page: pageNum,
        page_size: pageSizeNum,
        total,
        total_pages: totalPages,
      },
    },
  });
}

function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { student_id, sport_type_id, value, test_date, notes } = req.body;

  // Basic validation
  if (!student_id || !sport_type_id || value === undefined || !test_date) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: '學生 ID、運動類型、數值和測試日期為必填欄位',
        status: 400,
      },
    });
  }

  // Check sport type exists
  const sportType = sportTypesMap[sport_type_id];
  if (!sportType) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SPORT_TYPE',
        message: '無效的運動類型 ID',
        status: 400,
      },
    });
  }

  const now = new Date().toISOString();
  const newRecord = {
    id: nextRecordId++,
    student_id,
    sport_type_id,
    sport_type: { id: sport_type_id, ...sportType },
    value: parseFloat(value),
    test_date,
    notes: notes || '',
    created_at: now,
    updated_at: now,
    created_by: 1, // Mock user ID
  };

  mockRecords.push(newRecord);

  res.status(201).json({
    data: {
      record: newRecord,
    },
  });
}

// Export for use in other endpoints
export { mockRecords, mockAuditRecords, sportTypesMap, nextRecordId, nextAuditId };
