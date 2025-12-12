/**
 * Mock Login API
 * 模擬後端登入 API，用於前端開發測試
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// Mock users for testing
const mockUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin' as const,
  },
  {
    id: 2,
    email: 'staff@example.com',
    password: 'password123',
    role: 'school_staff' as const,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
        status: 405,
      },
    });
  }

  const { email, password } = req.body;

  // Find user
  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: '帳號或密碼錯誤',
        status: 401,
      },
    });
  }

  // Generate mock token
  const token = `mock-jwt-token-${user.id}-${Date.now()}`;

  return res.status(200).json({
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    },
  });
}
