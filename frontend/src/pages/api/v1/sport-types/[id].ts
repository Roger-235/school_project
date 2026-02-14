/**
 * Mock API: Single Sport Type
 * Feature: 003-student-sports-data
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { mockSportTypes } from './index';

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

  const { id } = req.query;
  const sportTypeId = parseInt(id as string, 10);

  if (isNaN(sportTypeId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: '無效的運動類型 ID',
        status: 400,
      },
    });
  }

  const sportType = mockSportTypes.find((t) => t.id === sportTypeId);

  if (!sportType) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '運動類型不存在',
        status: 404,
      },
    });
  }

  res.status(200).json({
    data: {
      sport_type: sportType,
    },
  });
}
