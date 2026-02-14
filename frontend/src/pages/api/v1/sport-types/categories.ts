/**
 * Mock API: Sport Type Categories
 * Feature: 003-student-sports-data
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// category 使用中文以匹配 TypeScript 類型 SportCategory
const categories = ['體適能', '田徑', '球類'];

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

  res.status(200).json({
    data: {
      categories,
    },
  });
}
