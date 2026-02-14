/**
 * Mock API: Single Student Operations (GET, PUT, DELETE)
 * 模擬後端 API，提供假資料用於前端測試
 * Feature: 003-student-sports-data
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// Mock students data (duplicated for simplicity in mock)
let mockStudents = [
  {
    id: 1,
    student_number: 'S2024001',
    name: '王小明',
    grade: 7,
    class: '甲',
    gender: 'male',
    birth_date: '2011-03-15',
    school_id: 1,
    school: {
      id: 1,
      name: '臺北市立建國高級中學',
      county: '臺北市',
    },
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 2,
    student_number: 'S2024002',
    name: '李小華',
    grade: 7,
    class: '乙',
    gender: 'female',
    birth_date: '2011-05-22',
    school_id: 1,
    school: {
      id: 1,
      name: '臺北市立建國高級中學',
      county: '臺北市',
    },
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 3,
    student_number: 'S2024003',
    name: '張大同',
    grade: 8,
    class: '甲',
    gender: 'male',
    birth_date: '2010-08-10',
    school_id: 2,
    school: {
      id: 2,
      name: '臺北市立北一女子高級中學',
      county: '臺北市',
    },
    created_at: '2024-01-11T00:00:00Z',
    updated_at: '2024-01-11T00:00:00Z',
  },
  {
    id: 4,
    student_number: 'S2024004',
    name: '陳美玲',
    grade: 9,
    class: '丙',
    gender: 'female',
    birth_date: '2009-12-01',
    school_id: 3,
    school: {
      id: 3,
      name: '新北市立板橋高級中學',
      county: '新北市',
    },
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
  },
];

const mockSchools = [
  { id: 1, name: '臺北市立建國高級中學', county: '臺北市' },
  { id: 2, name: '臺北市立北一女子高級中學', county: '臺北市' },
  { id: 3, name: '新北市立板橋高級中學', county: '新北市' },
  { id: 4, name: '臺中市立臺中第一高級中等學校', county: '臺中市' },
  { id: 5, name: '高雄市立高雄高級中學', county: '高雄市' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const studentId = parseInt(id as string, 10);

  if (isNaN(studentId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: '無效的學生 ID',
        status: 400,
      },
    });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(studentId, res);
    case 'PUT':
      return handlePut(studentId, req, res);
    case 'DELETE':
      return handleDelete(studentId, res);
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

function handleGet(studentId: number, res: NextApiResponse) {
  const student = mockStudents.find((s) => s.id === studentId);

  if (!student) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '學生不存在',
        status: 404,
      },
    });
  }

  res.status(200).json({
    data: {
      student,
    },
  });
}

function handlePut(
  studentId: number,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const studentIndex = mockStudents.findIndex((s) => s.id === studentId);

  if (studentIndex === -1) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '學生不存在',
        status: 404,
      },
    });
  }

  const {
    student_number,
    name,
    grade,
    class: className,
    gender,
    birth_date,
    school_id,
  } = req.body;

  // If school_id changed, update school info
  let school = mockStudents[studentIndex].school;
  if (school_id && school_id !== mockStudents[studentIndex].school_id) {
    const newSchool = mockSchools.find((s) => s.id === school_id);
    if (!newSchool) {
      return res.status(400).json({
        error: {
          code: 'INVALID_SCHOOL',
          message: '無效的學校 ID',
          status: 400,
        },
      });
    }
    school = { id: newSchool.id, name: newSchool.name, county: newSchool.county };
  }

  const now = new Date().toISOString();

  mockStudents[studentIndex] = {
    ...mockStudents[studentIndex],
    student_number: student_number || mockStudents[studentIndex].student_number,
    name: name || mockStudents[studentIndex].name,
    grade: grade ?? mockStudents[studentIndex].grade,
    class: className ?? mockStudents[studentIndex].class,
    gender: gender || mockStudents[studentIndex].gender,
    birth_date: birth_date ?? mockStudents[studentIndex].birth_date,
    school_id: school_id || mockStudents[studentIndex].school_id,
    school,
    updated_at: now,
  };

  res.status(200).json({
    data: {
      student: mockStudents[studentIndex],
    },
  });
}

function handleDelete(studentId: number, res: NextApiResponse) {
  const studentIndex = mockStudents.findIndex((s) => s.id === studentId);

  if (studentIndex === -1) {
    return res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: '學生不存在',
        status: 404,
      },
    });
  }

  mockStudents.splice(studentIndex, 1);

  res.status(200).json({
    data: {
      message: '學生已成功刪除',
    },
  });
}
