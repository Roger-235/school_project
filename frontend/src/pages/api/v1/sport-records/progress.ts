/**
 * Mock API: Sport Record Progress Analysis
 * Feature: 003-student-sports-data (T074)
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// Sport types map
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

// Mock progress data
const mockProgressData: Record<string, {
  first_value: number;
  last_value: number;
  record_count: number;
}> = {
  '1-5': { first_value: 185.5, last_value: 190.2, record_count: 2 },
  '1-7': { first_value: 14.5, last_value: 14.2, record_count: 3 },
  '2-4': { first_value: 32, last_value: 38, record_count: 4 },
};

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
        code: 'MISSING_PARAM',
        message: 'student_id 和 sport_type_id 為必填參數',
        status: 400,
      },
    });
  }

  const studentIdNum = parseInt(student_id as string, 10);
  const sportTypeIdNum = parseInt(sport_type_id as string, 10);
  const sportType = sportTypesMap[sportTypeIdNum];

  if (!sportType) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SPORT_TYPE',
        message: '無效的運動項目 ID',
        status: 400,
      },
    });
  }

  const key = `${studentIdNum}-${sportTypeIdNum}`;
  const progressData = mockProgressData[key];

  if (!progressData || progressData.record_count < 2) {
    return res.status(400).json({
      error: {
        code: 'ANALYSIS_ERROR',
        message: '需要至少 2 筆記錄才能進行分析',
        status: 400,
      },
    });
  }

  const change = progressData.last_value - progressData.first_value;
  const changePercent = (change / progressData.first_value) * 100;

  // For time, lower is better
  const isImprovement = sportType.value_type === 'time' ? change < 0 : change > 0;

  res.status(200).json({
    data: {
      student_id: studentIdNum,
      sport_type_id: sportTypeIdNum,
      sport_type_name: sportType.name,
      first_value: progressData.first_value,
      last_value: progressData.last_value,
      change,
      change_percent: changePercent,
      is_improvement: isImprovement,
      record_count: progressData.record_count,
      value_type: sportType.value_type,
      unit: sportType.default_unit,
    },
  });
}
