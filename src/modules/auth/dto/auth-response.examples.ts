export const inviteResponseExample = {
  email: 'user@example.com',
  name: '홍길동',
  semesterTrack: {
    id: 1,
    semester: {
      year: 2026,
      half: 'FIRST_HALF',
      label: '26-상반기',
    },
    track: {
      code: 'BACKEND',
      name: 'BackEnd',
    },
  },
  invitationToken:
    '6f3edfa77f3f9b93034aa3b4a90474e0c2d6f23f4b0e3b2b14f7a4e0fbc0c912',
  expiresAt: '2026-05-01T09:00:00.000Z',
};

export const invitationDetailResponseExample = {
  email: 'user@example.com',
  name: '홍길동',
  expiresAt: '2026-05-01T09:00:00.000Z',
  semesterTrack: {
    id: 1,
    semester: {
      year: 2026,
      half: 'FIRST_HALF',
      label: '26-상반기',
    },
    track: {
      code: 'BACKEND',
      name: 'BackEnd',
    },
  },
};

export const registerResponseExample = {
  id: 1,
  email: 'user@example.com',
  name: '홍길동',
  role: 'BEGINNER',
};

export const tokenResponseExample = {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access-token',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token',
};
