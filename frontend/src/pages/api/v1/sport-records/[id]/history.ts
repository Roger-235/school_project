/**
 * Mock API: Sport Record History (Audit Trail)
 * Feature: 003-student-sports-data
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// 模擬審計記錄
const mockAuditRecords: Record<number, Array<{
  id: number;
  record_id: number;
  previous_value: number | null;
  new_value: number;
  change_reason: string;
  changed_at: string;
  changed_by: number;
}>> = {
  1: [],
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
  3: [],
  4: [],
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

  const history = mockAuditRecords[recordId] || [];

  // Sort by changed_at desc
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime()
  );

  res.status(200).json({
    data: {
      history: sortedHistory,
      total: sortedHistory.length,
    },
  });
}
