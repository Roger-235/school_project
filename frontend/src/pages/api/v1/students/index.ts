/**
 * Mock API: Students List and Create
 * 模擬後端 API，提供假資料用於前端測試
 * Feature: 003-student-sports-data
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// 模擬學生資料
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

// Mock schools data for reference (same as schools API)
const mockSchools = [
  { id: 1, name: '臺北市立建國高級中學', county: '臺北市' },
  { id: 2, name: '臺北市立北一女子高級中學', county: '臺北市' },
  { id: 3, name: '新北市立板橋高級中學', county: '新北市' },
  { id: 4, name: '臺中市立臺中第一高級中等學校', county: '臺中市' },
  { id: 5, name: '高雄市立高雄高級中學', county: '高雄市' },
];

let nextStudentId = 5;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
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

function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = '1',
    page_size = '20',
    school_id,
    grade,
    gender,
    search,
    name, // Support both 'name' and 'search' parameters
  } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(page_size as string, 10);

  let filteredStudents = [...mockStudents];

  // Filter by school_id
  if (school_id) {
    const schoolIdNum = parseInt(school_id as string, 10);
    filteredStudents = filteredStudents.filter(
      (s) => s.school_id === schoolIdNum
    );
  }

  // Filter by grade
  if (grade) {
    const gradeNum = parseInt(grade as string, 10);
    filteredStudents = filteredStudents.filter((s) => s.grade === gradeNum);
  }

  // Filter by gender
  if (gender && typeof gender === 'string') {
    filteredStudents = filteredStudents.filter((s) => s.gender === gender);
  }

  // Filter by name or search term (support both parameters)
  const searchTerm = name || search;
  if (searchTerm && typeof searchTerm === 'string') {
    const searchLower = searchTerm.toLowerCase();
    filteredStudents = filteredStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.student_number.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const total = filteredStudents.length;
  const totalPages = Math.ceil(total / pageSizeNum);
  const offset = (pageNum - 1) * pageSizeNum;
  const paginatedStudents = filteredStudents.slice(offset, offset + pageSizeNum);

  res.status(200).json({
    data: {
      students: paginatedStudents,
      pagination: {
        page: pageNum,
        page_size: pageSizeNum,
        total,
        total_pages: totalPages,
      },
    },
  });
}

function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    student_number,
    name,
    grade,
    class: className,
    gender,
    birth_date,
    school_id,
  } = req.body;

  // Basic validation
  if (!student_number || !name || !grade || !gender || !school_id) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: '學號、姓名、年級、性別和學校為必填欄位',
        status: 400,
      },
    });
  }

  // Check for duplicate student_number
  if (mockStudents.some((s) => s.student_number === student_number)) {
    return res.status(400).json({
      error: {
        code: 'DUPLICATE_STUDENT_NUMBER',
        message: '學號已存在',
        status: 400,
      },
    });
  }

  // Find school
  const school = mockSchools.find((s) => s.id === school_id);
  if (!school) {
    return res.status(400).json({
      error: {
        code: 'INVALID_SCHOOL',
        message: '無效的學校 ID',
        status: 400,
      },
    });
  }

  const now = new Date().toISOString();
  const newStudent = {
    id: nextStudentId++,
    student_number,
    name,
    grade,
    class: className || '',
    gender,
    birth_date: birth_date || null,
    school_id,
    school: {
      id: school.id,
      name: school.name,
      county: school.county,
    },
    created_at: now,
    updated_at: now,
  };

  mockStudents.push(newStudent);

  res.status(201).json({
    data: {
      student: newStudent,
    },
  });
}

// Export for use in other mock APIs
export { mockStudents, mockSchools };
