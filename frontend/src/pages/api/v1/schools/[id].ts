/**
 * Mock API: Single School Operations (GET, PUT, DELETE)
 * 模擬後端 API，提供假資料用於前端測試
 * Feature: 003-student-sports-data
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// Import shared mock data from index
// Note: In real implementation, this would be a shared store or database
let mockSchools = [
  {
    id: 1,
    name: '臺北市立建國高級中學',
    code: 'TPE-JK-001',
    county: '臺北市',
    district: '中正區',
    address: '臺北市中正區南海路56號',
    phone: '02-2303-4381',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '臺北市立北一女子高級中學',
    code: 'TPE-BY-001',
    county: '臺北市',
    district: '中正區',
    address: '臺北市中正區重慶南路一段165號',
    phone: '02-2382-0484',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: '新北市立板橋高級中學',
    code: 'NTP-BQ-001',
    county: '新北市',
    district: '板橋區',
    address: '新北市板橋區文化路一段25號',
    phone: '02-2960-2500',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 4,
    name: '臺中市立臺中第一高級中等學校',
    code: 'TXG-TC-001',
    county: '臺中市',
    district: '北區',
    address: '臺中市北區育才街2號',
    phone: '04-2222-6081',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: 5,
    name: '高雄市立高雄高級中學',
    code: 'KHH-KH-001',
    county: '高雄市',
    district: '三民區',
    address: '高雄市三民區建國三路50號',
    phone: '07-286-8059',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const schoolId = parseInt(id as string, 10);

  if (isNaN(schoolId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: '無效的學校 ID',
        status: 400,
      },
    });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(schoolId, res);
    case 'PUT':
      return handlePut(schoolId, req, res);
    case 'DELETE':
      return handleDelete(schoolId, res);
    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method not allowed',
          status: 405,
        },
      });
  }
}

function handleGet(schoolId: number, res: NextApiResponse) {
  const school = mockSchools.find((s) => s.id === schoolId);

  if (!school) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '學校不存在',
        status: 404,
      },
    });
  }

  res.status(200).json({
    data: {
      school,
    },
  });
}

function handlePut(
  schoolId: number,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const schoolIndex = mockSchools.findIndex((s) => s.id === schoolId);

  if (schoolIndex === -1) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '學校不存在',
        status: 404,
      },
    });
  }

  const { name, code, county, district, address, phone } = req.body;
  const now = new Date().toISOString();

  mockSchools[schoolIndex] = {
    ...mockSchools[schoolIndex],
    name: name || mockSchools[schoolIndex].name,
    code: code || mockSchools[schoolIndex].code,
    county: county || mockSchools[schoolIndex].county,
    district: district ?? mockSchools[schoolIndex].district,
    address: address ?? mockSchools[schoolIndex].address,
    phone: phone ?? mockSchools[schoolIndex].phone,
    updated_at: now,
  };

  res.status(200).json({
    data: {
      school: mockSchools[schoolIndex],
    },
  });
}

function handleDelete(schoolId: number, res: NextApiResponse) {
  const schoolIndex = mockSchools.findIndex((s) => s.id === schoolId);

  if (schoolIndex === -1) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '學校不存在',
        status: 404,
      },
    });
  }

  mockSchools.splice(schoolIndex, 1);

  res.status(200).json({
    data: {
      message: '學校已成功刪除',
    },
  });
}
