/**
 * Mock API: Single Sport Record Operations (GET, PUT, DELETE)
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

// 模擬運動記錄資料 (shared state for mock)
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

let nextAuditId = 2;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const recordId = parseInt(id as string, 10);

  if (isNaN(recordId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: '無效的記錄 ID',
        status: 400,
      },
    });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(recordId, res);
    case 'PUT':
      return handlePut(recordId, req, res);
    case 'DELETE':
      return handleDelete(recordId, res);
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

function handleGet(recordId: number, res: NextApiResponse) {
  const record = mockRecords.find((r) => r.id === recordId);

  if (!record) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '運動記錄不存在',
        status: 404,
      },
    });
  }

  res.status(200).json({
    data: {
      record,
    },
  });
}

function handlePut(recordId: number, req: NextApiRequest, res: NextApiResponse) {
  const recordIndex = mockRecords.findIndex((r) => r.id === recordId);

  if (recordIndex === -1) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '運動記錄不存在',
        status: 404,
      },
    });
  }

  const { value, test_date, notes, reason } = req.body;
  const now = new Date().toISOString();
  const previousValue = mockRecords[recordIndex].value;

  // Create audit record if value changed
  if (value !== undefined && value !== previousValue) {
    if (!mockAuditRecords[recordId]) {
      mockAuditRecords[recordId] = [];
    }
    mockAuditRecords[recordId].push({
      id: nextAuditId++,
      record_id: recordId,
      previous_value: previousValue,
      new_value: parseFloat(value),
      change_reason: reason || '數值更新',
      changed_at: now,
      changed_by: 1,
    });
  }

  mockRecords[recordIndex] = {
    ...mockRecords[recordIndex],
    value: value !== undefined ? parseFloat(value) : mockRecords[recordIndex].value,
    test_date: test_date || mockRecords[recordIndex].test_date,
    notes: notes ?? mockRecords[recordIndex].notes,
    updated_at: now,
  };

  res.status(200).json({
    data: {
      record: mockRecords[recordIndex],
    },
  });
}

function handleDelete(recordId: number, res: NextApiResponse) {
  const recordIndex = mockRecords.findIndex((r) => r.id === recordId);

  if (recordIndex === -1) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '運動記錄不存在',
        status: 404,
      },
    });
  }

  mockRecords.splice(recordIndex, 1);
  // Also remove audit records
  delete mockAuditRecords[recordId];

  res.status(200).json({
    data: {
      message: '運動記錄已成功刪除',
    },
  });
}

export { mockRecords, mockAuditRecords };
