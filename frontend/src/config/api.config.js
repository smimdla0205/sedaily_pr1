/**
 * API 설정
 *
 * 책임:
 * - API 엔드포인트 관리
 * - 환경별 설정
 */

export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  wsURL: import.meta.env.VITE_WS_URL || '',
  timeout: 30000, // 30초
};

export const API_ENDPOINTS = {
  // 인증
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
  },

  // 프롬프트
  prompts: {
    list: '/prompts',
    detail: (engineType) => `/prompts/${engineType}`,
    update: (engineType) => `/prompts/${engineType}`,
    delete: (engineType) => `/prompts/${engineType}`,
  },

  // 파일
  files: {
    list: (engineType) => `/prompts/${engineType}/files`,
    create: (engineType) => `/prompts/${engineType}/files`,
    update: (engineType, fileId) => `/prompts/${engineType}/files/${fileId}`,
    delete: (engineType, fileId) => `/prompts/${engineType}/files/${fileId}`,
  },

  // 대화
  conversations: {
    list: '/conversations',
    detail: (conversationId) => `/conversations/${conversationId}`,
    create: '/conversations',
    update: (conversationId) => `/conversations/${conversationId}`,
    delete: (conversationId) => `/conversations/${conversationId}`,
  },

  // 사용량
  usage: {
    get: (userId, engineType) => `/usage/${userId}/${engineType}`,
    update: '/usage/update',
  },
};
