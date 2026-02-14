/**
 * Mock API: Sport Types List
 * 模擬後端 API，提供 17 種預設運動類型
 * Feature: 003-student-sports-data
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// 17 種預設運動類型（與後端 seed 資料一致）
// category 必須使用中文值以匹配 TypeScript 類型 SportCategory
const mockSportTypes = [
  // 體適能
  { id: 1, name: '800公尺', category: '體適能', default_unit: '秒', value_type: 'time' },
  { id: 2, name: '1600公尺', category: '體適能', default_unit: '秒', value_type: 'time' },
  { id: 3, name: '坐姿體前彎', category: '體適能', default_unit: '公分', value_type: 'distance' },
  { id: 4, name: '1分鐘仰臥起坐', category: '體適能', default_unit: '次', value_type: 'count' },
  { id: 5, name: '立定跳遠', category: '體適能', default_unit: '公分', value_type: 'distance' },
  { id: 6, name: '1分鐘屈膝仰臥起坐', category: '體適能', default_unit: '次', value_type: 'count' },

  // 田徑
  { id: 7, name: '100公尺', category: '田徑', default_unit: '秒', value_type: 'time' },
  { id: 8, name: '200公尺', category: '田徑', default_unit: '秒', value_type: 'time' },
  { id: 9, name: '400公尺', category: '田徑', default_unit: '秒', value_type: 'time' },
  { id: 10, name: '跳遠', category: '田徑', default_unit: '公分', value_type: 'distance' },
  { id: 11, name: '跳高', category: '田徑', default_unit: '公分', value_type: 'distance' },
  { id: 12, name: '鉛球', category: '田徑', default_unit: '公尺', value_type: 'distance' },
  { id: 13, name: '壘球擲遠', category: '田徑', default_unit: '公尺', value_type: 'distance' },

  // 球類
  { id: 14, name: '籃球運球', category: '球類', default_unit: '秒', value_type: 'time' },
  { id: 15, name: '足球運球', category: '球類', default_unit: '秒', value_type: 'time' },
  { id: 16, name: '排球墊球', category: '球類', default_unit: '次', value_type: 'count' },
  { id: 17, name: '桌球正手擊球', category: '球類', default_unit: '次', value_type: 'count' },
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

  const { category } = req.query;

  let filteredTypes = [...mockSportTypes];

  // Filter by category if specified
  if (category && typeof category === 'string') {
    filteredTypes = filteredTypes.filter((t) => t.category === category);
  }

  res.status(200).json({
    data: {
      sport_types: filteredTypes,
      total: filteredTypes.length,
    },
  });
}

// Export for use in other mock APIs
export { mockSportTypes };
