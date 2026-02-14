/**
 * Mock API: Sport Record Trend Data
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
const mockRecords = [
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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed',
        status: 405,
      },
    });
  }

  const { student_id, sport_type_id } = req.query;

  if (!student_id || !sport_type_id) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'student_id 和 sport_type_id 為必填參數',
        status: 400,
      },
    });
  }

  const studentIdNum = parseInt(student_id as string, 10);
  const sportTypeIdNum = parseInt(sport_type_id as string, 10);

  // Filter records for this student and sport type
  const filteredRecords = mockRecords
    .filter((r) => r.student_id === studentIdNum && r.sport_type_id === sportTypeIdNum)
    .sort((a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime());

  // Need at least 2 records for trend analysis
  const hasEnoughData = filteredRecords.length >= 2;

  res.status(200).json({
    data: {
      records: filteredRecords,
      has_enough_data: hasEnoughData,
      record_count: filteredRecords.length,
    },
  });
}
