/**
 * Mock API: GET /api/v1/counties/[countyName]/statistics
 * Returns statistics for a specific county
 * Feature: 002-map-visualization (User Story 2)
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// Mock data for all 22 counties
const mockCountyStats: Record<string, { school_count: number; student_count: number; record_count: number; has_data: boolean }> = {
  '臺北市': { school_count: 150, student_count: 3200, record_count: 12800, has_data: true },
  '新北市': { school_count: 200, student_count: 4500, record_count: 18000, has_data: true },
  '桃園市': { school_count: 120, student_count: 2800, record_count: 11200, has_data: true },
  '臺中市': { school_count: 180, student_count: 3800, record_count: 15200, has_data: true },
  '臺南市': { school_count: 130, student_count: 2600, record_count: 10400, has_data: true },
  '高雄市': { school_count: 190, student_count: 4100, record_count: 16400, has_data: true },
  '基隆市': { school_count: 35, student_count: 720, record_count: 2880, has_data: true },
  '新竹市': { school_count: 45, student_count: 980, record_count: 3920, has_data: true },
  '嘉義市': { school_count: 28, student_count: 580, record_count: 2320, has_data: true },
  '新竹縣': { school_count: 55, student_count: 1100, record_count: 4400, has_data: true },
  '苗栗縣': { school_count: 70, student_count: 1350, record_count: 5400, has_data: true },
  '彰化縣': { school_count: 95, student_count: 2000, record_count: 8000, has_data: true },
  '南投縣': { school_count: 60, student_count: 1200, record_count: 4800, has_data: true },
  '雲林縣': { school_count: 75, student_count: 1500, record_count: 6000, has_data: true },
  '嘉義縣': { school_count: 0, student_count: 0, record_count: 0, has_data: false },
  '屏東縣': { school_count: 90, student_count: 1800, record_count: 7200, has_data: true },
  '宜蘭縣': { school_count: 0, student_count: 0, record_count: 0, has_data: false },
  '花蓮縣': { school_count: 0, student_count: 0, record_count: 0, has_data: false },
  '臺東縣': { school_count: 0, student_count: 0, record_count: 0, has_data: false },
  '澎湖縣': { school_count: 0, student_count: 0, record_count: 0, has_data: false },
  '金門縣': { school_count: 0, student_count: 0, record_count: 0, has_data: false },
  '連江縣': { school_count: 0, student_count: 0, record_count: 0, has_data: false },
  '宜蘭市': { school_count: 0, student_count: 0, record_count: 0, has_data: false }, // Alternative name handling
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed',
        status: 405,
      },
    });
  }

  const { countyName } = req.query;
  const county = Array.isArray(countyName) ? countyName[0] : countyName;
  const decodedCounty = decodeURIComponent(county || '');

  // Validate county name
  const stats = mockCountyStats[decodedCounty];

  if (!stats) {
    return res.status(404).json({
      error: {
        code: 'COUNTY_NOT_FOUND',
        message: `Invalid county name: ${decodedCounty}`,
        status: 404,
      },
    });
  }

  // Return county statistics
  return res.status(200).json({
    data: {
      county_name: decodedCounty,
      school_count: stats.school_count,
      student_count: stats.student_count,
      record_count: stats.record_count,
      has_data: stats.has_data,
    },
  });
}
