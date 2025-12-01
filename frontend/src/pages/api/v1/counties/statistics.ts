/**
 * Mock API: Get all county statistics
 * 模擬後端 API，提供假資料用於前端測試
 * 實際生產環境應該使用 Go backend
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// 模擬台灣 22 個縣市的統計資料
const mockCountyStats = [
  { county_name: '臺北市', school_count: 150, student_count: 3200, has_data: true },
  { county_name: '新北市', school_count: 200, student_count: 4500, has_data: true },
  { county_name: '桃園市', school_count: 120, student_count: 2800, has_data: true },
  { county_name: '臺中市', school_count: 180, student_count: 3600, has_data: true },
  { county_name: '臺南市', school_count: 140, student_count: 2900, has_data: true },
  { county_name: '高雄市', school_count: 190, student_count: 4100, has_data: true },
  { county_name: '基隆市', school_count: 45, student_count: 850, has_data: true },
  { county_name: '新竹市', school_count: 60, student_count: 1200, has_data: true },
  { county_name: '嘉義市', school_count: 35, student_count: 680, has_data: true },
  { county_name: '新竹縣', school_count: 80, student_count: 1600, has_data: true },
  { county_name: '苗栗縣', school_count: 70, student_count: 1350, has_data: true },
  { county_name: '彰化縣', school_count: 0, student_count: 0, has_data: false },
  { county_name: '南投縣', school_count: 55, student_count: 1100, has_data: true },
  { county_name: '雲林縣', school_count: 0, student_count: 0, has_data: false },
  { county_name: '嘉義縣', school_count: 0, student_count: 0, has_data: false },
  { county_name: '屏東縣', school_count: 90, student_count: 1800, has_data: true },
  { county_name: '宜蘭縣', school_count: 65, student_count: 1250, has_data: true },
  { county_name: '花蓮縣', school_count: 0, student_count: 0, has_data: false },
  { county_name: '臺東縣', school_count: 0, student_count: 0, has_data: false },
  { county_name: '澎湖縣', school_count: 0, student_count: 0, has_data: false },
  { county_name: '金門縣', school_count: 0, student_count: 0, has_data: false },
  { county_name: '連江縣', school_count: 0, student_count: 0, has_data: false },
];

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只允許 GET 請求
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed',
        status: 405,
      },
    });
  }

  // 模擬延遲（可選，讓載入動畫更明顯）
  // setTimeout(() => {
    res.status(200).json({
      data: {
        counties: mockCountyStats,
        total: mockCountyStats.length,
      },
    });
  // }, 500);
}
