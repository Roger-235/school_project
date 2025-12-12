/**
 * Mock API: School Ranking for Sport Type
 * Feature: 003-student-sports-data (T075)
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

// Mock school data
const schoolsMap: Record<number, { name: string }> = {
  1: { name: '臺北市立建國高級中學' },
  2: { name: '臺北市立北一女子高級中學' },
  3: { name: '臺北市敦化國民小學' },
  4: { name: '臺北市立仁愛國民中學' },
  5: { name: '臺北市立復興高級中學' },
};

// Mock ranking data generator
function generateMockRankings(
  schoolId: number,
  sportTypeId: number,
  limit: number,
  valueType: string
) {
  const students = [
    { id: 1, name: '王小明', grade: 9, class: 'A' },
    { id: 2, name: '李小華', grade: 8, class: 'B' },
    { id: 3, name: '張大偉', grade: 9, class: 'A' },
    { id: 4, name: '陳美玲', grade: 7, class: 'C' },
    { id: 5, name: '林志強', grade: 8, class: 'B' },
    { id: 6, name: '黃雅婷', grade: 9, class: 'C' },
    { id: 7, name: '周建國', grade: 7, class: 'A' },
    { id: 8, name: '吳佳慧', grade: 8, class: 'A' },
    { id: 9, name: '蔡明德', grade: 9, class: 'B' },
    { id: 10, name: '劉雅琪', grade: 7, class: 'B' },
  ];

  // Generate random values based on sport type
  const baseValues: Record<string, { base: number; range: number }> = {
    time: { base: 12, range: 5 },
    distance: { base: 180, range: 40 },
    count: { base: 30, range: 15 },
  };

  const config = baseValues[valueType] || { base: 100, range: 20 };

  const rankings = students
    .slice(0, limit)
    .map((student, index) => {
      // For time, lower values should be ranked higher
      const value =
        valueType === 'time'
          ? config.base + (index * config.range) / limit
          : config.base + config.range - (index * config.range) / limit;

      return {
        rank: index + 1,
        student_id: student.id,
        student_name: student.name,
        grade: student.grade,
        class: student.class,
        best_value: Math.round(value * 10) / 10,
        test_date: `2024-0${3 + (index % 3)}-${10 + index}`,
      };
    });

  return rankings;
}

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

  const { school_id, sport_type_id, limit = '10' } = req.query;

  if (!school_id || !sport_type_id) {
    return res.status(400).json({
      error: {
        code: 'MISSING_PARAM',
        message: 'school_id 和 sport_type_id 為必填參數',
        status: 400,
      },
    });
  }

  const schoolIdNum = parseInt(school_id as string, 10);
  const sportTypeIdNum = parseInt(sport_type_id as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10) || 10, 50);

  const school = schoolsMap[schoolIdNum];
  const sportType = sportTypesMap[sportTypeIdNum];

  if (!school) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SCHOOL',
        message: '學校不存在',
        status: 400,
      },
    });
  }

  if (!sportType) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SPORT_TYPE',
        message: '運動項目不存在',
        status: 400,
      },
    });
  }

  const rankings = generateMockRankings(
    schoolIdNum,
    sportTypeIdNum,
    limitNum,
    sportType.value_type
  );

  res.status(200).json({
    data: {
      school_id: schoolIdNum,
      school_name: school.name,
      sport_type_id: sportTypeIdNum,
      sport_type_name: sportType.name,
      value_type: sportType.value_type,
      unit: sportType.default_unit,
      total_students: rankings.length,
      rankings,
    },
  });
}
